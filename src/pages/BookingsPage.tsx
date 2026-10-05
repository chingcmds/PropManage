import { useMemo, useState } from 'react'
import type { BookingStatus } from '../types'
import { AppShell } from '../components/layout/AppShell'
import { StatusBadge } from '../components/ui/Badge'
import { EmptyState, ErrorState } from '../components/ui/EmptyState'
import { TableSkeleton } from '../components/ui/Skeleton'
import { useAsync } from '../hooks/useAsync'
import { fetchBookings, fetchProperties, fetchTenants } from '../services/api'
import { formatCurrency, formatDate } from '../utils/format'
import { bookingStatusVariant } from '../utils/status'

const TABS: { label: string; value: BookingStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Checked in', value: 'checked-in' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export function BookingsPage() {
  const [status, setStatus] = useState<BookingStatus | 'all'>('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const bookingsState = useAsync(fetchBookings, [])
  const propertiesState = useAsync(fetchProperties, [])
  const tenantsState = useAsync(fetchTenants, [])

  const loading =
    bookingsState.loading || propertiesState.loading || tenantsState.loading
  const error =
    bookingsState.error ?? propertiesState.error ?? tenantsState.error

  const filtered = useMemo(() => {
    if (!bookingsState.data) return []
    return bookingsState.data.filter((b) => {
      if (status !== 'all' && b.status !== status) return false
      if (from && b.checkIn < from) return false
      if (to && b.checkOut > to) return false
      return true
    })
  }, [bookingsState.data, status, from, to])

  const propertyName = (id: string) =>
    propertiesState.data?.find((p) => p.id === id)?.name ?? id
  const tenantName = (id: string) =>
    tenantsState.data?.find((t) => t.id === id)?.name ?? id

  const reload = () => {
    bookingsState.reload()
    propertiesState.reload()
    tenantsState.reload()
  }

  return (
    <AppShell title="Bookings" subtitle="Reservation status and schedules" onDataReset={reload}>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatus(tab.value)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                status === tab.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="text-xs text-slate-500">
            From
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 block rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-slate-500">
            To
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 block rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            />
          </label>
        </div>
      </div>

      {error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : loading ? (
        <TableSkeleton rows={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No bookings match"
          description="Adjust status tabs or date range to see more results."
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-card md:block">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Tenant</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Guests</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium">{propertyName(b.propertyId)}</td>
                    <td className="px-4 py-3">{tenantName(b.tenantId)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(b.checkIn)} – {formatDate(b.checkOut)}
                    </td>
                    <td className="px-4 py-3">{b.guests}</td>
                    <td className="px-4 py-3">{formatCurrency(b.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={b.status}
                        variant={bookingStatusVariant(b.status)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{propertyName(b.propertyId)}</p>
                    <p className="text-sm text-slate-500">{tenantName(b.tenantId)}</p>
                  </div>
                  <StatusBadge
                    status={b.status}
                    variant={bookingStatusVariant(b.status)}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {formatDate(b.checkIn)} – {formatDate(b.checkOut)}
                </p>
                <p className="mt-1 text-sm font-medium">{formatCurrency(b.totalAmount)}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </AppShell>
  )
}
