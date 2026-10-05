import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import type { PaymentStatus } from '../types'
import { AppShell } from '../components/layout/AppShell'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/ui/Badge'
import { Card, CardBody } from '../components/ui/Card'
import { EmptyState, ErrorState } from '../components/ui/EmptyState'
import { TableSkeleton } from '../components/ui/Skeleton'
import { useAsync } from '../hooks/useAsync'
import { fetchPayments, fetchProperties, fetchTenants } from '../services/api'
import { formatCurrency, formatDate, labelFromKey } from '../utils/format'
import { paymentStatusVariant } from '../utils/status'
import { downloadCsv } from '../utils/csv'

export function PaymentsPage() {
  const [status, setStatus] = useState<PaymentStatus | 'all'>('all')
  const [month, setMonth] = useState('2025-10')

  const paymentsState = useAsync(fetchPayments, [])
  const propertiesState = useAsync(fetchProperties, [])
  const tenantsState = useAsync(fetchTenants, [])

  const loading =
    paymentsState.loading || propertiesState.loading || tenantsState.loading
  const error =
    paymentsState.error ?? propertiesState.error ?? tenantsState.error

  const filtered = useMemo(() => {
    if (!paymentsState.data) return []
    return paymentsState.data.filter((p) => {
      if (status !== 'all' && p.status !== status) return false
      if (month && !p.dueDate.startsWith(month)) return false
      return true
    })
  }, [paymentsState.data, status, month])

  const totals = useMemo(() => {
    const paid = filtered.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
    const pending = filtered
      .filter((p) => p.status === 'pending')
      .reduce((s, p) => s + p.amount, 0)
    const overdue = filtered
      .filter((p) => p.status === 'overdue')
      .reduce((s, p) => s + p.amount, 0)
    return { paid, pending, overdue, all: paid + pending + overdue }
  }, [filtered])

  const propertyName = (id: string) =>
    propertiesState.data?.find((p) => p.id === id)?.name ?? id
  const tenantName = (id: string) =>
    tenantsState.data?.find((t) => t.id === id)?.name ?? id

  const reload = () => {
    paymentsState.reload()
    propertiesState.reload()
    tenantsState.reload()
  }

  const exportCsv = () => {
    const rows = [
      ['ID', 'Property', 'Tenant', 'Amount', 'Due', 'Paid', 'Status', 'Method'],
      ...filtered.map((p) => [
        p.id,
        propertyName(p.propertyId),
        tenantName(p.tenantId),
        String(p.amount),
        p.dueDate,
        p.paidDate ?? '',
        p.status,
        p.method ?? '',
      ]),
    ]
    downloadCsv(`payments-${month}.csv`, rows)
  }

  return (
    <AppShell
      title="Payments"
      subtitle="Rent collection and outstanding balances"
      onDataReset={reload}
      actions={
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Download className="h-4 w-4" />}
          onClick={exportCsv}
          disabled={!filtered.length}
        >
          Export CSV
        </Button>
      }
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Paid" value={formatCurrency(totals.paid)} tone="success" />
        <SummaryCard label="Pending" value={formatCurrency(totals.pending)} tone="warning" />
        <SummaryCard label="Overdue" value={formatCurrency(totals.overdue)} tone="danger" />
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as PaymentStatus | 'all')}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      {error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : loading ? (
        <TableSkeleton rows={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No payments in this period"
          description="Change the month or status filter to see payment records."
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-card md:block">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Tenant</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium">{propertyName(p.propertyId)}</td>
                    <td className="px-4 py-3">{tenantName(p.tenantId)}</td>
                    <td className="px-4 py-3 text-slate-600">{p.description}</td>
                    <td className="px-4 py-3">{formatDate(p.dueDate)}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.method ? labelFromKey(p.method) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={p.status}
                        variant={paymentStatusVariant(p.status)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-card"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{propertyName(p.propertyId)}</p>
                    <p className="text-sm text-slate-500">{tenantName(p.tenantId)}</p>
                  </div>
                  <StatusBadge
                    status={p.status}
                    variant={paymentStatusVariant(p.status)}
                  />
                </div>
                <p className="mt-2 text-lg font-semibold">{formatCurrency(p.amount)}</p>
                <p className="text-xs text-slate-500">Due {formatDate(p.dueDate)}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </AppShell>
  )
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'success' | 'warning' | 'danger'
}) {
  const ring =
    tone === 'success'
      ? 'border-emerald-100 bg-emerald-50/50'
      : tone === 'warning'
        ? 'border-amber-100 bg-amber-50/50'
        : 'border-red-100 bg-red-50/50'
  return (
    <Card className={ring}>
      <CardBody>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
      </CardBody>
    </Card>
  )
}
