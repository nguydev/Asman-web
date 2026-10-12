import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Icon from '../common/Icon.jsx'
import NotificationPopover from './NotificationPopover.jsx'

const ROUTE_TITLES = {
  '/': 'Dashboard',
  '/fleets': 'Fleet Network',
  '/fleets/onboard': 'Partner Onboarding',
  '/users': 'System Users',
  '/settings': 'System Settings',
  '/templates': 'Legal Templates',
  '/case-tracker': 'Habeas Corpus Tracker',
  '/intelligence': 'National Intelligence',
  '/sos-incidents': 'SOS & Critical Incidents',
  '/subscription/plans': 'Subscription Plans',
  '/my-fleet': 'Live Map',
  '/vehicles': 'Fleets',
  '/drivers': 'Fleet Drivers',
  '/drivers/new': 'New Driver',
  '/attorneys': 'Attorney Network',
  '/case-status': 'Case Tracker',
  '/subscription': 'Subscription',
}

function getPageTitle(pathname) {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]

  if (pathname.startsWith('/case-tracker/')) return 'Case Details'
  if (pathname.startsWith('/attorneys/')) return 'Attorney Profile'
  if (pathname.startsWith('/my-fleet/vehicle/')) return 'Vehicle Details'
  if (pathname.match(/^\/drivers\/[^/]+\/edit$/)) return 'Edit Driver'
  if (pathname.startsWith('/facility/')) return 'Detention Center'

  return 'Dashboard'
}

export default function AdminHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const pageTitle = getPageTitle(location.pathname)

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl px-5 py-3">
      <div className="flex items-center gap-3 flex-1">
        <h1 className="text-lg font-bold text-zinc-900 hidden sm:block dark:text-zinc-50 min-w-[200px]">
          {pageTitle}
        </h1>
      </div>

      <div className="flex flex-1 sm:flex-none items-center justify-end gap-4 w-full sm:w-auto">
        <div className="relative w-full max-w-xs">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
            <Icon name="search" size={16} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search entities, personnel..."
            className="w-full rounded-lg border border-zinc-800/50 bg-zinc-900/50 py-2 pl-9 pr-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-brand/50 focus:bg-zinc-900 focus:ring-2 focus:ring-brand/30 transition-all"
          />
        </div>

        <NotificationPopover />

        <button
          onClick={() => navigate('/intelligence')}
          title="Back to Hub"
          className="flex h-9 flex-shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Icon name="globe" size={18} />
          <span className="hidden whitespace-nowrap sm:inline">Back to Hub</span>
        </button>
      </div>
    </header>
  )
}
