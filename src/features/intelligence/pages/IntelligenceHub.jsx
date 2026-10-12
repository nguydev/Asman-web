import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../../components/common/Icon.jsx'
import HabeasCorpusTracker from './HabeasCorpusTracker.jsx'
import IntelMap from '../../../components/intel/IntelMap.jsx'
import DetentionCorporations from '../../../components/intel/DetentionCorporations.jsx'
import NationalAttorneys from '../../../components/intel/NationalAttorneys.jsx'
import {
  DW_FACILITIES,
  DW_CORPS,
  DW_JUDGES,
  DW_NEWS,
  DW_COLORS,
  dwTagBg,
  dwTagColor,
} from '../../../data/detentionWatchData.js'
import { useIntelAttorneys } from '../../../hooks/useIntelAttorneys.js'
import { useFfiDetentionCenters } from '../../../hooks/useFfiDetentionCenters.js'

const TABS = [
  { id: 'map', label: 'Intel Map', icon: 'map' },
  { id: 'hc', label: 'HC Tracker', icon: 'clipboard' },
  { id: 'attorneys', label: 'Attorneys', icon: 'briefcase' },
  { id: 'corps', label: 'Corporations', icon: 'building' },
]

const PLANNED_COUNT = DW_FACILITIES.filter((f) => f.status === 'planned').length

// Facility-type key for Freedom for Immigrants detention centers.
const CAPACITY_KEY = [
  { id: 'dedicated', c: DW_COLORS.red, l: 'DEDICATED / CDF', s: 'CDF, DIGSA, SPC, family' },
  { id: 'igsa', c: DW_COLORS.orange, l: 'IGSA', s: 'Local government contracts' },
  { id: 'usms', c: DW_COLORS.accent, l: 'USMS IGA', s: 'Marshals agreements' },
  { id: 'federal', c: DW_COLORS.blue, l: 'FEDERAL', s: 'BOP / DOD' },
  { id: 'other', c: DW_COLORS.text2, l: 'OTHER', s: 'Unclassified / unknown' },
  { id: 'planned', c: DW_COLORS.blue, l: 'PLANNED', s: 'Proposed 2025-26' },
  { id: 'corps', c: DW_COLORS.purple, l: 'CORP HQ', s: 'Headquarters' },
]

const DATA_SOURCES = [
  'Freedom for Immigrants Map',
  'Vera Institute of Justice',
  'TRAC Immigration (Syracuse)',
  'ICE/DHS Enforcement Stats',
  'PACER Federal Docket',
  'Prison Legal News',
  'ACLU Immigrants Rights',
  'SCOTUSblog',
]

function PanelTitle({ children }) {
  return (
    <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
      {children}
    </div>
  )
}

function LeftPanel({ layers, onToggle, layerDefs, capCounts, activeCapacities, onToggleCapacity }) {
  return (
    <aside className="flex flex-col h-full divide-y divide-zinc-200 dark:divide-white/5 overflow-y-auto rounded-xl glass-panel [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Map layers */}
      <div className="p-4">
        <PanelTitle>Map Layers</PanelTitle>
        <div className="flex flex-col">
          {layerDefs.map((ld) => (
            <button
              key={ld.key}
              onClick={() => onToggle(ld.key)}
              className="flex items-center gap-2.5 py-1.5 text-left transition-colors hover:opacity-75"
            >
              <span
                className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded border transition-colors"
                style={{
                  borderColor: layers[ld.key] ? ld.color : DW_COLORS.border2,
                  backgroundColor: layers[ld.key] ? ld.color : 'transparent',
                }}
              >
                {layers[ld.key] && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: ld.color, boxShadow: `0 0 5px ${ld.color}` }}
              />
              <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">{ld.label}</span>
              <span className="text-xs text-zinc-500">{ld.count}</span>
            </button>
          ))}
        </div>
      </div>



      {/* Capacity key */}
      <div className="p-4">
        <PanelTitle>Facility Types</PanelTitle>

        {(() => {
          const total =
            (capCounts?.dedicated || 0) +
            (capCounts?.igsa || 0) +
            (capCounts?.usms || 0) +
            (capCounts?.federal || 0) +
            (capCounts?.other || 0)
          if (total === 0) return null
          return (
            <div className="h-1.5 w-full flex rounded-full overflow-hidden mb-5 opacity-90 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
              <div className="transition-all duration-500" style={{ width: `${(capCounts.other / total) * 100}%`, backgroundColor: DW_COLORS.text2 }} />
              <div className="transition-all duration-500" style={{ width: `${(capCounts.federal / total) * 100}%`, backgroundColor: DW_COLORS.blue }} />
              <div className="transition-all duration-500" style={{ width: `${(capCounts.usms / total) * 100}%`, backgroundColor: DW_COLORS.accent }} />
              <div className="transition-all duration-500" style={{ width: `${(capCounts.igsa / total) * 100}%`, backgroundColor: DW_COLORS.orange }} />
              <div className="transition-all duration-500" style={{ width: `${(capCounts.dedicated / total) * 100}%`, backgroundColor: DW_COLORS.red }} />
            </div>
          )
        })()}

        <div className="flex flex-col gap-3">
          {CAPACITY_KEY.map((row) => {
            const isActive = activeCapacities[row.id]
            const count = capCounts ? capCounts[row.id] : 0
            return (
              <button
                key={row.id}
                onClick={() => onToggleCapacity(row.id)}
                className={`flex items-center gap-3 text-left transition-all hover:opacity-80 ${isActive ? '' : 'opacity-40 grayscale'}`}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full transition-colors"
                  style={{ background: isActive ? row.c : '#71717a', boxShadow: isActive ? `0 0 5px ${row.c}` : 'none' }}
                />
                <span className="flex flex-col items-start leading-tight">
                  <span className={`text-tiny font-bold tracking-wide transition-colors ${isActive ? 'text-zinc-700 dark:text-zinc-200' : 'text-zinc-500 dark:text-zinc-500 line-through decoration-zinc-500/50'}`}>
                    {row.l}
                  </span>
                  <span className={`text-micro mt-0.5 transition-colors ${isActive ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-600/50 dark:text-zinc-600/50 line-through decoration-zinc-500/50'}`}>
                    {row.s}
                  </span>
                </span>
                <span className="ml-auto font-mono text-xs text-zinc-600 dark:text-zinc-400 opacity-80 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700/50">
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Data sources */}
      <div className="p-4">
        <PanelTitle>Data Sources</PanelTitle>
        <div className="flex flex-col gap-1">
          {DATA_SOURCES.map((s) => (
            <div key={s} className="text-xs text-zinc-600 dark:text-zinc-400">
              · {s}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

function LiveIntelligenceFeed() {
  return (
    <aside className="flex flex-col h-full overflow-y-auto rounded-xl glass-panel [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 p-4">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand/10 text-brand dark:text-brand-light">
          <Icon name="broadcast" size={15} />
        </span>
        <div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Live Intelligence Feed
          </div>
          <div className="text-xs text-zinc-500">National detention &amp; enforcement news</div>
        </div>
      </div>
      <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800/50">
        {DW_NEWS.map((n) => (
          <div key={n.head} className="px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
            <span
              className="rounded px-2 py-0.5 text-micro font-bold uppercase tracking-wider"
              style={{ background: dwTagBg(n.tag), color: dwTagColor(n.tag) }}
            >
              {n.lbl}
            </span>
            <p className="mt-1.5 text-sm leading-snug text-zinc-800 dark:text-zinc-200">{n.head}</p>
            <div className="mt-2 flex justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <span>{n.src}</span>
              <span>{n.time}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

export default function IntelligenceHub() {
  const [activeTab, setActiveTab] = useState('map')
  const { total: attorneyCount } = useIntelAttorneys({ limit: 80 })
  const { counts: ffiCounts, isLoading: ffiLoading } = useFfiDetentionCenters()
  const [layers, setLayers] = useState({
    detention: true,
    planned: true,
    corps: true,
    judges: true,
    attorneys: false,
  })

  const [activeCapacities, setActiveCapacities] = useState({
    dedicated: true,
    igsa: true,
    usms: true,
    federal: true,
    other: true,
    planned: true,
    corps: true,
  })

  const capCounts = useMemo(
    () => ({
      dedicated: ffiCounts.dedicated,
      igsa: ffiCounts.igsa,
      usms: ffiCounts.usms,
      federal: ffiCounts.federal,
      other: ffiCounts.other,
      planned: PLANNED_COUNT,
      corps: DW_CORPS.length,
    }),
    [ffiCounts],
  )

  const toggleLayer = (key) => setLayers((l) => ({ ...l, [key]: !l[key] }))
  const toggleCapacity = (key) => setActiveCapacities((c) => ({ ...c, [key]: !c[key] }))

  const layerDefs = [
    {
      key: 'detention',
      label: 'Detention Centers',
      color: '#ef4444',
      count: ffiLoading && !ffiCounts.total ? '…' : ffiCounts.total,
    },
    { key: 'planned', label: 'Planned 2025-26', color: '#f59e0b', count: PLANNED_COUNT },
    { key: 'corps', label: 'Private Corps HQ', color: '#8b5cf6', count: DW_CORPS.length },
    { key: 'judges', label: 'Immigration Judges', color: '#3b82f6', count: DW_JUDGES.length },
    { key: 'attorneys', label: 'HC Attorneys', color: '#ec4899', count: attorneyCount },
  ]

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-40px)] md:h-[calc(100vh-64px)]">
      {/* Header / Nav - 3 separate cards matching the body grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)_300px]">

        {/* Card 1 (Left): Logo */}
        <div className="flex items-center justify-center lg:justify-start gap-3 rounded-xl glass-panel p-2 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-zinc-900 text-white dark:bg-white/15">
              <Icon name="shield" size={18} />
            </span>
            <div className="leading-none">
              <div className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">
                ASMAN
              </div>
              <div className="mt-0.5 text-micro font-semibold tracking-[0.15em] text-zinc-500 dark:text-white/60">
                ENTERPRISE
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 (Center): Page Name & Tabs */}
        <div className="flex items-center justify-between overflow-x-auto rounded-xl glass-panel p-2 shadow-sm [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          <h1 className="text-lg font-bold text-zinc-900 hidden sm:block dark:text-zinc-50 whitespace-nowrap px-4">
            Intelligence Hub
          </h1>
          <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800/50 p-1 text-sm">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={
                  'flex shrink-0 items-center gap-2 rounded-md px-4 py-1.5 font-semibold transition-colors ' +
                  (activeTab === tab.id
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200')
                }
              >
                <Icon name={tab.icon} size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card 3 (Right): Go to Dashboard */}
        <div className="flex items-center justify-center rounded-xl glass-panel p-2 shadow-sm">
          <Link
            to="/dashboard"
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <Icon name="grid" size={18} />
            <span className="hidden whitespace-nowrap sm:inline">Go To Dashboard</span>
          </Link>
        </div>
      </div>

      {/* 3-column body: controls | tab content | live feed (feed persists across tabs) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)_300px] flex-1 min-h-0">
        <LeftPanel
          layers={layers}
          onToggle={toggleLayer}
          layerDefs={layerDefs}
          capCounts={capCounts}
          activeCapacities={activeCapacities}
          onToggleCapacity={toggleCapacity}
        />

        <div className={`min-w-0 flex flex-col h-full ${activeTab !== 'map' ? 'overflow-y-auto' : ''}`}>
          {activeTab === 'map' && (
            <IntelMap layers={layers} activeCapacities={activeCapacities} />
          )}
          {activeTab === 'hc' && <HabeasCorpusTracker embedded />}
          {activeTab === 'attorneys' && <NationalAttorneys />}
          {activeTab === 'corps' && <DetentionCorporations />}
        </div>

        <LiveIntelligenceFeed />
      </div>
    </div>
  )
}
