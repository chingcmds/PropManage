import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Building2, DollarSign, Percent, AlertCircle } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { KpiSkeleton, TableSkeleton } from '../components/ui/Skeleton'
import { ErrorState } from '../components/ui/EmptyState'
import { RevenueChart } from '../components/charts/RevenueChart'
import { OccupancyChart } from '../components/charts/OccupancyChart'
import { useAsync } from '../hooks/useAsync'
import { fetchDashboardBundle } from '../services/api'
import { formatCurrency, formatDate } from '../utils/format'
import {
  buildOccupancy,
  buildRevenueSeries,
  monthlyPaidRevenue,
  occupancyRate,
  outstandingPayments,
  overduePaymentsList,
  recentBookings,
} from '../utils/dashboard'
import { StatusBadge } from '../components/ui/Badge'
import { bookingStatusVariant, paymentStatusVariant } from '../utils/status'

export function DashboardPage() {
  const { data, loading, error, reload } = useAsync(fetchDashboardBundle, [])

  return (
    <AppShell
      title="Dashboard"
      subtitle="Portfolio overview and recent activity"
      onDataReset={reload}
    >
      {error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : loading || !data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <KpiSkeleton key={i} />
            ))}
          </div>
          <TableSkeleton rows={4} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Total properties"
              value={String(data.properties.length)}
              icon={<Building2 className="h-5 w-5 text-brand-600" />}
            />
            <KpiCard
              label="Occupancy rate"
              value={`${occupancyRate(data.properties)}%`}
              icon={<Percent className="h-5 w-5 text-sky-600" />}
            />
            <KpiCard
              label="October revenue"
              value={formatCurrency(monthlyPaidRevenue(data.payments))}
              icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
            />
            <KpiCard
              label="Outstanding"
              value={formatCurrency(outstandingPayments(data.payments))}
              icon={<AlertCircle className="h-5 w-5 text-amber-600" />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Monthly revenue" subtitle="Paid rent (demo series)" />
              <CardBody>
                <RevenueChart data={buildRevenueSeries(data.payments)} />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Occupancy mix" subtitle="By property status" />
              <CardBody>
                <OccupancyChart data={buildOccupancy(data.properties)} />
              </CardBody>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader
                title="Recent bookings"
                action={
                  <Link to="/bookings" className="text-sm font-medium text-brand-600">
                    View all
                  </Link>
                }
              />
              <CardBody className="space-y-3">
                {recentBookings(data.bookings).length === 0 ? (
                  <p className="text-sm text-slate-500">No bookings yet.</p>
                ) : (
                  recentBookings(data.bookings).map((b) => {
                    const prop = data.properties.find((p) => p.id === b.propertyId)
                    return (
                      <div
                        key={b.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {prop?.name ?? b.propertyId}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(b.checkIn)} – {formatDate(b.checkOut)}
                          </p>
                        </div>
                        <StatusBadge
                          status={b.status}
                          variant={bookingStatusVariant(b.status)}
                        />
                      </div>
                    )
                  })
                )}
              </CardBody>
            </Card>
            <Card>
              <CardHeader
                title="Overdue payments"
                action={
                  <Link to="/payments" className="text-sm font-medium text-brand-600">
                    View all
                  </Link>
                }
              />
              <CardBody className="space-y-3">
                {overduePaymentsList(data.payments).length === 0 ? (
                  <p className="text-sm text-slate-500">No overdue payments.</p>
                ) : (
                  overduePaymentsList(data.payments).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-red-100 bg-red-50/50 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {formatCurrency(p.amount)}
                        </p>
                        <p className="text-xs text-slate-500">Due {formatDate(p.dueDate)}</p>
                      </div>
                      <StatusBadge
                        status={p.status}
                        variant={paymentStatusVariant(p.status)}
                      />
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  )
}

function KpiCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: ReactNode
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}
