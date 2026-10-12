import { useEffect, useMemo, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Icon from '../../../components/common/Icon.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { PageHeader } from '../../../components/ui/PageHeader.jsx'
import {
  apiErrorMessage,
  fleetService,
  unwrapApiData,
} from '../../../api/services/fleetService.js'
import {
  driverService,
  unwrapApiData as unwrapDrivers,
} from '../../../api/services/driverService.js'
import { getCurrentOrganizationId } from '../../../api/services/orgContext.js'

const fieldLabel = 'block text-xs font-medium text-zinc-500 dark:text-zinc-400'
const fieldInput =
  'mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:bg-zinc-900'

const FLEET_COLORS = [
  { hex: '#16a34a', label: 'Green' },
  { hex: '#2563eb', label: 'Blue' },
  { hex: '#7c3aed', label: 'Purple' },
  { hex: '#db2777', label: 'Pink' },
  { hex: '#ea580c', label: 'Orange' },
  { hex: '#ca8a04', label: 'Gold' },
  { hex: '#0d9488', label: 'Teal' },
  { hex: '#06b6d4', label: 'Cyan' },
  { hex: '#dc2626', label: 'Red' },
  { hex: '#64748b', label: 'Slate' },
]

const DEFAULT_COLOR = FLEET_COLORS[0].hex

function ColorSwatches({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FLEET_COLORS.map(({ hex, label }) => {
        const selected = value === hex
        return (
          <button
            key={hex}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={selected}
            onClick={() => onChange(hex)}
            className={
              'relative h-8 w-8 rounded-full transition ' +
              (selected
                ? 'ring-2 ring-zinc-900 ring-offset-2 dark:ring-white dark:ring-offset-zinc-900'
                : 'hover:scale-110')
            }
            style={{ backgroundColor: hex }}
          >
            {selected && (
              <span className="absolute inset-0 grid place-items-center text-white">
                <Icon name="check" size={14} />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function MapPinPreview({ color, name }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 p-4 dark:border-zinc-700 dark:bg-zinc-800/60">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(161 161 170 / 0.45) 1px, transparent 0)',
          backgroundSize: '18px 18px',
        }}
      />
      <div className="relative flex min-h-[120px] flex-col items-center justify-center gap-3">
        <div className="relative">
          <span
            className="absolute inset-0 animate-ping rounded-full opacity-30"
            style={{ backgroundColor: color }}
          />
          <span
            className="relative grid h-11 w-11 place-items-center rounded-full text-white shadow-lg ring-4 ring-white/80 dark:ring-zinc-900/80"
            style={{ backgroundColor: color }}
          >
            <Icon name="truck" size={18} />
          </span>
        </div>
        <div className="rounded-lg bg-white/90 px-3 py-1.5 text-center shadow-sm dark:bg-zinc-900/90">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {name.trim() || 'Fleet name'}
          </p>
          <p className="text-[11px] text-zinc-500">Map pin preview</p>
        </div>
      </div>
    </div>
  )
}

function CreateFleetModal({
  open,
  onClose,
  name,
  color,
  onNameChange,
  onColorChange,
  onSubmit,
  isPending,
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !isPending) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, isPending, onClose])

  if (!open) return null

  const colorLabel =
    FLEET_COLORS.find((c) => c.hex === color)?.label || 'Custom'

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-8 backdrop-blur-sm sm:items-center sm:py-10">
      <form
        onSubmit={onSubmit}
        className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 p-5 dark:border-zinc-800">
          <div className="flex items-start gap-3">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-sm"
              style={{ backgroundColor: color }}
            >
              <Icon name="truck" size={18} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Create fleet
              </h2>
              <p className="mt-0.5 text-sm text-zinc-500">
                Name the group and pick the color used on the live map.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <label className={fieldLabel}>
              Fleet name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Northeast Day Fleet"
              className={fieldInput}
              maxLength={120}
              autoFocus
              required
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className={fieldLabel}>Map indicator color</label>
              <span className="text-xs font-medium text-zinc-500">
                {colorLabel} · {color}
              </span>
            </div>
            <ColorSwatches value={color} onChange={onColorChange} />
          </div>

          <MapPinPreview color={color} name={name} />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon="plus"
            disabled={isPending || !name.trim()}
          >
            {isPending ? 'Creating...' : 'Create fleet'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function DriverAvatar({ name, avatar }) {
  const initial = (name || 'D').charAt(0).toUpperCase()
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name || 'Driver'}
        className="h-9 w-9 rounded-full object-cover ring-2 ring-brand/10"
      />
    )
  }
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-sm font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200">
      {initial}
    </div>
  )
}

export default function Vehicles() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createColor, setCreateColor] = useState(DEFAULT_COLOR)
  const [renameValue, setRenameValue] = useState('')
  const [editColor, setEditColor] = useState(DEFAULT_COLOR)
  const [isRenaming, setIsRenaming] = useState(false)
  const [assignDriverId, setAssignDriverId] = useState('')

  const { data: orgId } = useQuery({
    queryKey: ['current-organization-id'],
    queryFn: getCurrentOrganizationId,
  })

  const {
    data: fleets = [],
    isLoading: fleetsLoading,
    isError: fleetsError,
    error: fleetsErr,
  } = useQuery({
    queryKey: ['organization-fleets', orgId],
    enabled: !!orgId,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const res = await fleetService.list(orgId)
      const data = unwrapApiData(res)
      return Array.isArray(data) ? data : []
    },
  })

  const { data: fleetDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['organization-fleet', orgId, selectedId],
    enabled: !!orgId && !!selectedId,
    queryFn: async () => {
      const res = await fleetService.get(orgId, selectedId)
      return unwrapApiData(res)
    },
  })

  const { data: drivers = [] } = useQuery({
    queryKey: ['organization-drivers', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const res = await driverService.getOrganizationDrivers(orgId)
      const data = unwrapDrivers(res)
      if (!Array.isArray(data)) return []
      return data
        .filter((d) => d.status === 'ACTIVE')
        .map((d) => ({
          id: d.id,
          name: d.user?.profile?.name || 'Unknown Driver',
          email: d.user?.email || null,
          licensePlate: d.licensePlate || null,
        }))
    },
  })

  useEffect(() => {
    if (!selectedId && fleets.length > 0) {
      setSelectedId(fleets[0].id)
    }
    if (
      selectedId &&
      fleets.length > 0 &&
      !fleets.some((f) => f.id === selectedId)
    ) {
      setSelectedId(fleets[0]?.id ?? null)
    }
  }, [fleets, selectedId])

  useEffect(() => {
    setRenameValue(fleetDetail?.name || '')
    setEditColor(fleetDetail?.color || DEFAULT_COLOR)
    setIsRenaming(false)
    setAssignDriverId('')
  }, [fleetDetail?.id, fleetDetail?.name, fleetDetail?.color])

  const assignedIds = useMemo(
    () =>
      new Set(
        (fleetDetail?.members || []).map((m) => m.driverId).filter(Boolean),
      ),
    [fleetDetail],
  )

  const availableDrivers = useMemo(
    () => drivers.filter((d) => !assignedIds.has(d.id)),
    [drivers, assignedIds],
  )

  const nextSuggestedColor = useMemo(() => {
    const used = new Set(fleets.map((f) => f.color?.toLowerCase()))
    const unused = FLEET_COLORS.find((c) => !used.has(c.hex.toLowerCase()))
    return unused?.hex || DEFAULT_COLOR
  }, [fleets])

  const openCreate = () => {
    setCreateName('')
    setCreateColor(nextSuggestedColor)
    setCreateOpen(true)
  }

  const closeCreate = () => {
    if (createMutation.isPending) return
    setCreateOpen(false)
    setCreateName('')
    setCreateColor(DEFAULT_COLOR)
  }

  const invalidateFleets = () => {
    queryClient.invalidateQueries({ queryKey: ['organization-fleets', orgId] })
    if (selectedId) {
      queryClient.invalidateQueries({
        queryKey: ['organization-fleet', orgId, selectedId],
      })
    }
  }

  const createMutation = useMutation({
    mutationFn: ({ name, color }) =>
      fleetService.create(orgId, { name, color }),
    onSuccess: (res) => {
      const created = unwrapApiData(res)
      toast.success('Fleet created')
      setCreateOpen(false)
      setCreateName('')
      setCreateColor(DEFAULT_COLOR)
      invalidateFleets()
      if (created?.id) setSelectedId(created.id)
    },
    onError: (err) =>
      toast.error(apiErrorMessage(err, 'Failed to create fleet')),
  })

  const renameMutation = useMutation({
    mutationFn: ({ name, color }) =>
      fleetService.update(orgId, selectedId, { name, color }),
    onSuccess: () => {
      toast.success('Fleet updated')
      setIsRenaming(false)
      invalidateFleets()
    },
    onError: (err) =>
      toast.error(apiErrorMessage(err, 'Failed to update fleet')),
  })

  const deleteMutation = useMutation({
    mutationFn: () => fleetService.remove(orgId, selectedId),
    onSuccess: () => {
      toast.success('Fleet deleted')
      setSelectedId(null)
      queryClient.invalidateQueries({ queryKey: ['organization-fleets', orgId] })
    },
    onError: (err) =>
      toast.error(apiErrorMessage(err, 'Failed to delete fleet')),
  })

  const assignMutation = useMutation({
    mutationFn: (driverId) =>
      fleetService.assignDriver(orgId, selectedId, driverId),
    onSuccess: () => {
      toast.success('Driver assigned')
      setAssignDriverId('')
      invalidateFleets()
    },
    onError: (err) =>
      toast.error(apiErrorMessage(err, 'Failed to assign driver')),
  })

  const removeMutation = useMutation({
    mutationFn: (driverId) =>
      fleetService.removeDriver(orgId, selectedId, driverId),
    onSuccess: () => {
      toast.success('Driver removed')
      invalidateFleets()
    },
    onError: (err) =>
      toast.error(apiErrorMessage(err, 'Failed to remove driver')),
  })

  const handleCreate = (e) => {
    e.preventDefault()
    const name = createName.trim()
    if (!name) return
    createMutation.mutate({ name, color: createColor })
  }

  if (fleetsLoading) {
    return (
      <div className="p-8 text-center text-zinc-500">Loading fleets...</div>
    )
  }

  if (fleetsError) {
    return (
      <div className="p-8 text-center text-red-500">
        {apiErrorMessage(fleetsErr, 'Failed to load fleets')}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Fleets"
        subtitle="Group drivers into fleets — each color shows on the live map"
        actions={
          <Button variant="primary" icon="plus" onClick={openCreate}>
            New Fleet
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="flex flex-col rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              Your fleets
            </p>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {fleets.length}
            </span>
          </div>

          <div className="flex flex-col gap-1 p-2">
            {fleets.length === 0 ? (
              <div className="px-3 py-10 text-center">
                <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand">
                  <Icon name="truck" size={22} />
                </span>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  No fleets yet
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Create a fleet to color-code drivers on the map.
                </p>
                <Button
                  variant="primary"
                  icon="plus"
                  className="mt-4"
                  onClick={openCreate}
                >
                  Create fleet
                </Button>
              </div>
            ) : (
              fleets.map((fleet) => (
                <button
                  key={fleet.id}
                  type="button"
                  onClick={() => setSelectedId(fleet.id)}
                  className={
                    'flex items-center justify-between rounded-lg px-3 py-2.5 text-left transition ' +
                    (selectedId === fleet.id
                      ? 'bg-brand/10 ring-1 ring-brand/30'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800')
                  }
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-full shadow-sm ring-2 ring-white dark:ring-zinc-900"
                      style={{
                        backgroundColor: fleet.color || DEFAULT_COLOR,
                      }}
                    />
                    <span className="truncate font-semibold text-zinc-900 dark:text-zinc-50">
                      {fleet.name}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-zinc-400">
                    {fleet.memberCount ?? 0}
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          {!selectedId ? (
            <div className="flex h-64 flex-col items-center justify-center text-zinc-500">
              <Icon name="truck" size={40} className="mb-3 opacity-40" />
              <p className="font-medium text-zinc-700 dark:text-zinc-200">
                Select a fleet or create one
              </p>
              <Button
                variant="primary"
                icon="plus"
                className="mt-4"
                onClick={openCreate}
              >
                New Fleet
              </Button>
            </div>
          ) : detailLoading && !fleetDetail ? (
            <div className="p-8 text-center text-zinc-500">Loading fleet...</div>
          ) : !fleetDetail ? (
            <div className="p-8 text-center text-zinc-500">Fleet not found</div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {isRenaming ? (
                    <form
                      className="flex w-full max-w-lg flex-col gap-3"
                      onSubmit={(e) => {
                        e.preventDefault()
                        const name = renameValue.trim()
                        if (!name) return
                        if (
                          name === fleetDetail.name &&
                          editColor === fleetDetail.color
                        ) {
                          setIsRenaming(false)
                          return
                        }
                        renameMutation.mutate({ name, color: editColor })
                      }}
                    >
                      <div>
                        <label className={fieldLabel}>Fleet name</label>
                        <input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className={fieldInput}
                          maxLength={120}
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className={`${fieldLabel} mb-2`}>
                          Map indicator color
                        </label>
                        <ColorSwatches
                          value={editColor}
                          onChange={setEditColor}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={renameMutation.isPending}
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setRenameValue(fleetDetail.name)
                            setEditColor(fleetDetail.color || DEFAULT_COLOR)
                            setIsRenaming(false)
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-4 w-4 rounded-full shadow-sm ring-2 ring-white dark:ring-zinc-900"
                          style={{
                            backgroundColor:
                              fleetDetail.color || DEFAULT_COLOR,
                          }}
                        />
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                          {fleetDetail.name}
                        </h2>
                      </div>
                      <p className="mt-1 text-sm text-zinc-500">
                        {fleetDetail.memberCount ??
                          fleetDetail.members?.length ??
                          0}{' '}
                        drivers · map color{' '}
                        <span className="font-mono text-xs">
                          {fleetDetail.color}
                        </span>
                      </p>
                    </>
                  )}
                </div>
                {!isRenaming && (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      icon="edit"
                      onClick={() => setIsRenaming(true)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      icon="trash"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete fleet "${fleetDetail.name}"? Drivers are not deleted.`,
                          )
                        ) {
                          deleteMutation.mutate()
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-end gap-2 border-t border-zinc-100 pt-5 dark:border-zinc-800">
                <div className="min-w-[220px] flex-1">
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                    Assign driver
                  </label>
                  <select
                    value={assignDriverId}
                    onChange={(e) => setAssignDriverId(e.target.value)}
                    className={`${fieldInput} mt-0`}
                  >
                    <option value="">Select a driver...</option>
                    {availableDrivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                        {d.licensePlate ? ` · ${d.licensePlate}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  variant="primary"
                  icon="userPlus"
                  disabled={!assignDriverId || assignMutation.isPending}
                  onClick={() => assignMutation.mutate(assignDriverId)}
                >
                  Assign
                </Button>
              </div>

              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-zinc-400">
                  Members
                </p>
                {(fleetDetail.members || []).length === 0 ? (
                  <p className="rounded-lg bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500 dark:bg-zinc-800/50">
                    No drivers in this fleet yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {(fleetDetail.members || []).map((member) => (
                      <li
                        key={member.membershipId || member.driverId}
                        className="flex items-center justify-between gap-3 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <DriverAvatar
                            name={member.name}
                            avatar={member.avatar}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">
                              {member.name || 'Unknown'}
                            </p>
                            <p className="truncate text-xs text-zinc-500">
                              {[
                                member.licensePlate,
                                member.vinNumber,
                                member.email,
                              ]
                                .filter(Boolean)
                                .join(' · ') || '—'}
                            </p>
                          </div>
                        </div>
                        {member.driverId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={removeMutation.isPending}
                            onClick={() =>
                              removeMutation.mutate(member.driverId)
                            }
                          >
                            Remove
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      <CreateFleetModal
        open={createOpen}
        onClose={closeCreate}
        name={createName}
        color={createColor}
        onNameChange={setCreateName}
        onColorChange={setCreateColor}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
      />
    </div>
  )
}
