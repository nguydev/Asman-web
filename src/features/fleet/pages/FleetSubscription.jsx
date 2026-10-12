import { useQuery } from '@tanstack/react-query'
import Icon from '../../../components/common/Icon.jsx'
import TierCard from '../../../components/SubscriptionTierCard.jsx'
import { subscriptionService } from '../../../api/services/subscriptionService.js'

export default function FleetSubscription() {
  const { data: tiers = [], isLoading } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      try {
        const res = await subscriptionService.getPlans()
        const payload = res.data?.data || res.data
        const list = Array.isArray(payload) ? payload : payload?.data
        return Array.isArray(list) ? list : []
      } catch {
        return []
      }
    }
  })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <span className="flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand dark:text-brand-dark">
          <span className="grid h-4 w-4 place-items-center rounded-full bg-brand text-white">
            <Icon name="check" size={10} />
          </span>
          Current Status
        </span>
      </div>

      {/* tiers */}
      <div>
        <h2 className="font-bold text-zinc-900 dark:text-zinc-50">
          Available Tiers
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Select the plan that best fits your logistical scale.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {isLoading ? (
            <div className="text-sm text-zinc-400">Loading plans...</div>
          ) : tiers.length === 0 ? (
            <div className="text-sm text-zinc-400">No active subscription plans available yet.</div>
          ) : (
            tiers.map((tier) => (
              <TierCard key={tier.id} tier={tier} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
