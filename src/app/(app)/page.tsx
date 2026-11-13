import { KpiCard } from "@/components/app/kpi-card"
import { PageHeader } from "@/components/app/page-header"
import { formatNumber } from "@/lib/format"
import { formatMoney } from "@/lib/money"
import {
  RevenueByCategoryChart,
  RevenueByMonthChart,
} from "@/modules/sales/components/sales-charts"
import { salesDashboard } from "@/modules/sales/queries"

export const metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const stats = await salesDashboard()
  return (
    <>
      <PageHeader title="Dashboard" description="How the business is doing, at a glance." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Revenue"
          value={formatMoney(stats.revenueCents)}
          hint="Total of sent and paid sales, tax included."
          detail={`${formatNumber(stats.count)} sales`}
        />
        <KpiCard
          label="Waiting for payment"
          value={formatMoney(stats.openCents)}
          hint="Sales marked sent but not paid yet."
        />
        <KpiCard
          label="Average sale"
          value={formatMoney(stats.averageCents)}
          hint="Revenue divided by the number of sent and paid sales."
        />
        <KpiCard
          label="Drafts"
          value={formatNumber(stats.byStatus.find((s) => s.status === "draft")?.count ?? 0)}
          hint="Sales not sent to the customer yet. They do not count as revenue."
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RevenueByMonthChart data={stats.byMonth} />
        </div>
        <div className="lg:col-span-2">
          <RevenueByCategoryChart data={stats.byCategory} />
        </div>
      </div>
    </>
  )
}
