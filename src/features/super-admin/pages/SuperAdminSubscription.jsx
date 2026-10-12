import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { subscriptionService } from "../../../api/services/subscriptionService.js";
import Icon from "../../../components/common/Icon.jsx";
import TierCard from "../../../components/SubscriptionTierCard.jsx";
import { Pagination } from "../../../components/ui/Pagination.jsx";

const MOCK_STATS = [
  {
    key: "mrr",
    label: "Monthly Recurring Revenue",
    value: "$0",
    change: "—",
    changeTone: "text-zinc-500",
    icon: "creditCard",
  },
  {
    key: "subs",
    label: "Active Subscribers",
    value: "0",
    change: "—",
    changeTone: "text-zinc-500",
    icon: "users",
  },
  {
    key: "churn",
    label: "Churn Rate",
    value: "0.0%",
    change: "—",
    changeTone: "text-zinc-500",
    icon: "warning",
  },
];

const MOCK_SUBSCRIBERS = [];

const STATUS_STYLES = {
  active: "bg-green-500/15 text-green-600 dark:text-green-400",
  past_due: "bg-red-500/15 text-red-600 dark:text-red-400",
};
const STATUS_LABELS = { active: "Active", past_due: "Past Due" };

function StatCard({ stat }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase leading-snug tracking-wide text-zinc-400">
          {stat.label}
        </p>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand dark:text-brand-dark">
          <Icon name={stat.icon} size={15} />
        </span>
      </div>
      <p className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
        {stat.value}
      </p>
      <p className={`mt-1 text-xs font-semibold ${stat.changeTone}`}>
        {stat.change}
      </p>
    </div>
  );
}

export default function SuperAdminSubscription() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data: stats = MOCK_STATS } = useQuery({
    queryKey: ["subscriptionStats"],
    queryFn: async () => {
      try {
        const res = await subscriptionService.getStats();
        const payload = res.data?.data || res.data;

        if (payload && payload.monthlyRecurringRevenue) {
          const mrr = payload.monthlyRecurringRevenue;
          const active = payload.activeSubscribers;
          const churn = payload.churnRate;

          return [
            {
              key: "mrr",
              label: "Monthly Recurring Revenue",
              value: `$${(mrr.amount || 0).toLocaleString()}`,
              change:
                mrr.changePercentVsLastMonth >= 0
                  ? `↗ +${mrr.changePercentVsLastMonth?.toFixed(1) || 0}% vs last month`
                  : `↘ ${mrr.changePercentVsLastMonth?.toFixed(1) || 0}% vs last month`,
              changeTone:
                mrr.changePercentVsLastMonth >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400",
              icon: "creditCard",
            },
            {
              key: "subs",
              label: "Active Subscribers",
              value: (active?.total || 0).toLocaleString(),
              change:
                active?.newToday > 0
                  ? `↗ +${active.newToday} new today`
                  : "0 new today",
              changeTone:
                active?.newToday > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-zinc-500",
              icon: "users",
            },
            {
              key: "churn",
              label: "Churn Rate",
              value: `${((churn?.rate || 0) * 100).toFixed(1)}%`,
              change:
                churn?.churned > 0 ? `${churn.churned} churned` : "No churn",
              changeTone:
                (churn?.rate || 0) > 0.05
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400",
              icon: "warning",
            },
          ];
        }

        return Array.isArray(payload) ? payload : MOCK_STATS;
      } catch {
        return MOCK_STATS;
      }
    },
  });

  const { data: tiers = [] } = useQuery({
    queryKey: ["subscriptionPlans"],
    queryFn: async () => {
      try {
        const res = await subscriptionService.getPlans();
        const payload = res.data?.data || res.data;
        const list = Array.isArray(payload) ? payload : payload?.data;
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },
  });

  const { data: subscribersData = { list: MOCK_SUBSCRIBERS, total: 0 } } =
    useQuery({
      queryKey: ["subscribers", page],
      queryFn: async () => {
        try {
          const res = await subscriptionService.getSubscribers({
            page,
            limit: 10,
          });
          // Assuming backend returns { data: [], pagination: { total: X } } inside res.data
          const payload = res.data?.data || res.data;
          const list = Array.isArray(payload)
            ? payload
            : payload?.data || MOCK_SUBSCRIBERS;
          const total =
            res.data?.pagination?.total ||
            payload?.pagination?.total ||
            list.length;
          return { list, total };
        } catch {
          return { list: MOCK_SUBSCRIBERS, total: 0 };
        }
      },
    });

  const {
    list: subscribers = MOCK_SUBSCRIBERS,
    total: totalSubscribers = 0,
  } = subscribersData;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <StatCard key={s.key} stat={s} />
        ))}
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            Active Tiers
          </h2>
          <button
            onClick={() => navigate("/subscription/plans")}
            className="text-sm font-semibold text-brand hover:underline dark:text-brand-dark"
          >
            Configure Pricing Models
          </button>
        </div>
        <p className="mt-1 max-w-2xl text-base text-zinc-500 dark:text-zinc-400">
          Subscription Fees are billed in advance on a monthly or annual basis.
          Fees are non-refundable except as required by law.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {tiers.slice(0, 3).map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              onEdit={() => navigate("/subscription/plans")}
              shouldEdit={false}
            />
          ))}
        </div>
      </div>

      {subscribers.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
            Active Subscriptions
          </h3>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Subscriber
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Plan
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Status
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Cycle
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Amount
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-zinc-100 dark:border-zinc-800"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {s.initials || s.name.substring(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                            {s.name}
                          </p>
                          <p className="text-xs text-zinc-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-zinc-600 dark:text-zinc-300">
                      {s.plan}
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[s.status] || STATUS_STYLES.active}`}
                      >
                        {STATUS_LABELS[s.status] || s.status}
                      </span>
                    </td>
                    <td className="py-3 text-zinc-600 dark:text-zinc-300">
                      {s.cycle}
                    </td>
                    <td className="py-3 font-semibold text-zinc-900 dark:text-zinc-50">
                      {s.amount}
                    </td>
                    <td className="py-3">
                      <button className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800">
                        <Icon name="moreVertical" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={Math.ceil(totalSubscribers / 10)}
            totalItems={totalSubscribers}
            itemsPerPage={10}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
