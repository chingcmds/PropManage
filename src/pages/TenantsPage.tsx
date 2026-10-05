import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { EmptyState, ErrorState } from '../components/ui/EmptyState'
import { TableSkeleton } from '../components/ui/Skeleton'
import { useAsync } from '../hooks/useAsync'
import { useDebounce } from '../hooks/useDebounce'
import { fetchProperties, fetchTenants } from '../services/api'
import { formatDate } from '../utils/format'

export function TenantsPage() {
  const [q, setQ] = useState('')
  const debouncedQ = useDebounce(q, 300)

  const tenantsState = useAsync(fetchTenants, [])
  const propertiesState = useAsync(fetchProperties, [])

  const loading = tenantsState.loading || propertiesState.loading
  const error = tenantsState.error ?? propertiesState.error

  const filtered = useMemo(() => {
    if (!tenantsState.data) return []
    const needle = debouncedQ.trim().toLowerCase()
    if (!needle) return tenantsState.data
    return tenantsState.data.filter(
      (t) =>
        t.name.toLowerCase().includes(needle) ||
        t.email.toLowerCase().includes(needle) ||
        t.phone.includes(needle),
    )
  }, [tenantsState.data, debouncedQ])

  const propertyName = (id: string) =>
    propertiesState.data?.find((p) => p.id === id)?.name ?? id

  const reload = () => {
    tenantsState.reload()
    propertiesState.reload()
  }

  return (
    <AppShell title="Tenants" subtitle="Active leases and contact details" onDataReset={reload}>
      <div className="mb-4">
        <input
          type="search"
          placeholder="Search by name, email, or phone…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      {error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : loading ? (
        <TableSkeleton rows={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No tenants found"
          description="Try a different search term or reset demo data."
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-card md:block">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Tenant</th>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Lease</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">{t.name}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/properties/${t.propertyId}`}
                        className="text-brand-600 hover:underline"
                      >
                        {propertyName(t.propertyId)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{t.email}</div>
                      <div className="text-xs">{t.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(t.leaseStart)} – {formatDate(t.leaseEnd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-card"
              >
                <p className="font-semibold text-slate-900">{t.name}</p>
                <Link
                  to={`/properties/${t.propertyId}`}
                  className="text-sm text-brand-600"
                >
                  {propertyName(t.propertyId)}
                </Link>
                <p className="mt-2 text-sm text-slate-600">{t.email}</p>
                <p className="text-sm text-slate-600">{t.phone}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Lease: {formatDate(t.leaseStart)} – {formatDate(t.leaseEnd)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </AppShell>
  )
}
