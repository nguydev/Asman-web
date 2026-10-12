import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subscriptionService } from '../../../api/services/subscriptionService.js'
import Icon from '../../../components/common/Icon.jsx'
import TierCard from '../../../components/SubscriptionTierCard.jsx'

const BASE_PLAN = {
  name: '',
  price: '',
  currency: 'usd',
  driverLimit: '',
}

function planFromTier(tier) {
  if (!tier) return BASE_PLAN
  return {
    name: tier.name ?? '',
    price: typeof tier.price === 'number' ? tier.price / 100 : '',
    currency: tier.currency ?? '',
    driverLimit: tier.driverLimit ?? tier.maxDrivers ?? '',
  }
}

function PlanModal({ plan: initialPlan, isCreating, onClose, onSave, isPending }) {
  const [plan, setPlan] = useState(initialPlan)

  const setField = (key) => (e) => setPlan((p) => ({ ...p, [key]: e.target.value }))
  const setNumberField = (key) => (e) =>
    setPlan((p) => ({ ...p, [key]: e.target.value === '' ? '' : Number(e.target.value) }))

  const handleSave = (e) => {
    e.preventDefault()
    const payload = {}

    if (isCreating) {
      payload.name = plan.name
      payload.price = Math.round(Number(plan.price) * 100)
      payload.currency = plan.currency
      payload.driverLimit = Number(plan.driverLimit)
    } else {
      if (plan.name !== '' && plan.name !== initialPlan.name) {
        payload.name = plan.name
      }

      const newPrice = plan.price !== '' ? Math.round(Number(plan.price) * 100) : ''
      const oldPrice = initialPlan.price !== '' ? Math.round(Number(initialPlan.price) * 100) : ''
      if (plan.price !== '' && newPrice !== oldPrice) {
        payload.price = newPrice
      }

      if (plan.currency !== '' && plan.currency !== initialPlan.currency) {
        payload.currency = plan.currency
      }

      if (plan.driverLimit !== '' && Number(plan.driverLimit) !== Number(initialPlan.driverLimit)) {
        payload.driverLimit = Number(plan.driverLimit)
      }
    }

    onSave(payload)
  }

  const isFormValid = plan.name && plan.price !== '' && plan.driverLimit !== '' && plan.currency

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl dark:bg-zinc-900 overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 p-6 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {isCreating ? 'Add Subscription Plan' : `Editing "${initialPlan.name}"`}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {isCreating ? 'Configure the details for your new plan.' : 'Update plan limits and pricing.'}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800">
            <Icon name="close" size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Plan Name
              </label>
              <input
                type="text"
                required
                value={plan.name}
                onChange={setField('name')}
                placeholder="e.g. Enterprise Tier"
                className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Monthly Price (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={plan.price}
                onChange={setNumberField('price')}
                placeholder="0.00"
                className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Currency
              </label>
              <select
                value={plan.currency}
                onChange={setField('currency')}
                className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              >
                <option value="usd">USD</option>
                <option value="eur">EUR</option>
                <option value="gbp">GBP</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Max Drivers
              </label>
              <input
                type="number"
                min="-1"
                required
                value={plan.driverLimit}
                onChange={setNumberField('driverLimit')}
                placeholder="Number of drivers (-1 for unlimited)"
                className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Set to -1 for unlimited drivers.
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !isFormValid}
              className="flex-1 flex justify-center items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
            >
              {isPending ? (
                <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              ) : (
                <Icon name="save" size={16} />
              )}
              {isPending ? 'Saving...' : (isCreating ? 'Create Plan' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ManageSubscriptionPlans() {
  const queryClient = useQueryClient()

  // Modal state: null means closed, 'new' means creating, or holds a tier object for editing
  const [modalState, setModalState] = useState(null)
  const [savedMsg, setSavedMsg] = useState('')

  const { data: tiers = [] } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      try {
        const res = await subscriptionService.getPlans()
        const payload = res.data?.data || res.data
        const list = Array.isArray(payload) ? payload : payload?.data
        return Array.isArray(list) ? list.filter(p => p.status === 'ACTIVE') : []
      } catch {
        return []
      }
    }
  })

  const saveMutation = useMutation({
    mutationFn: async (updatedData) => {
      if (modalState === 'new') {
        const res = await subscriptionService.createPlan(updatedData)
        return { type: 'create', data: res.data?.data || res.data }
      } else {
        const res = await subscriptionService.updatePlan(modalState.id, updatedData)
        return { type: 'update', data: res.data?.data || res.data, oldId: modalState.id }
      }
    },
    onSuccess: ({ type, data, oldId }) => {
      queryClient.setQueryData(['subscriptionPlans'], (old) => {
        if (!old) return [data]
        if (type === 'create') return [...old, data]
        // Replace the old plan with the new plan returned by the backend
        return old.map(t => t.id === oldId ? { ...t, ...data } : t)
      })
      setModalState(null)
      setSavedMsg(type === 'create' ? 'Plan created successfully!' : 'Changes saved.')
      setTimeout(() => setSavedMsg(''), 2500)
    },
    onError: () => {
      alert('Failed to save plan. Please check your inputs.')
    }
  })

  const handleSave = (payload) => {
    saveMutation.mutate(payload)
  }

  const showAddButton = tiers.length < 3

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Pricing Configuration</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Manage your subscription tiers. Maximum of 3 plans allowed.
          </p>
        </div>
        {savedMsg && (
          <span className="animate-fade-in rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-600 dark:bg-green-500/10 dark:text-green-400">
            {savedMsg}
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
        {tiers.map((tier) => (
          <TierCard
            key={tier.id}
            tier={tier}
            selected={modalState?.id === tier.id}
            onEdit={() => setModalState(tier)}
            shouldEdit={true}
          />
        ))}
        {showAddButton && (
          <button
            onClick={() => setModalState('new')}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-200 text-zinc-500 hover:border-brand/40 hover:bg-brand/5 hover:text-brand transition-all dark:border-zinc-800 dark:hover:border-brand-dark/40 dark:hover:bg-brand-dark/10 p-6 min-h-[280px]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-sm dark:bg-zinc-800">
              <Icon name="plus" size={24} />
            </span>
            <span className="font-semibold text-lg">Add Plan</span>
          </button>
        )}
      </div>

      {modalState && (
        <PlanModal
          plan={modalState === 'new' ? BASE_PLAN : planFromTier(modalState)}
          isCreating={modalState === 'new'}
          onClose={() => setModalState(null)}
          onSave={handleSave}
          isPending={saveMutation.isPending}
        />
      )}
    </div>
  )
}
