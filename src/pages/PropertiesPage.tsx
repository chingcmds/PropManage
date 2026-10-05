import { useEffect, useMemo, useState } from 'react'
import { Grid3x3, List, Plus } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { PropertyCard } from '../components/properties/PropertyCard'
import { PropertyFiltersBar } from '../components/properties/PropertyFilters'
import { PropertyForm } from '../components/properties/PropertyForm'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState, ErrorState } from '../components/ui/EmptyState'
import { Pagination } from '../components/ui/Pagination'
import { PropertyCardSkeleton } from '../components/ui/Skeleton'
import { useAsync } from '../hooks/useAsync'
import { useDebounce } from '../hooks/useDebounce'
import {
  filterProperties,
  paginate,
  usePropertyFilters,
} from '../hooks/usePropertyFilters'
import {
  createProperty,
  fetchProperties,
  updateProperty,
} from '../services/api'
import type { Property, PropertyFormValues } from '../types'
import { emptyPropertyForm, propertyToFormValues } from '../utils/propertyForm'
import { useToast } from '../context/toast-context'

export function PropertiesPage() {
  const { filters, setFilters, clearFilters, pageSize } = usePropertyFilters()
  const [searchInput, setSearchInput] = useState(filters.q)
  const debouncedQ = useDebounce(searchInput, 300)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Property | null>(null)
  const [saving, setSaving] = useState(false)
  const { push } = useToast()

  const { data, loading, error, reload } = useAsync(fetchProperties, [])

  useEffect(() => {
    if (debouncedQ !== filters.q) setFilters({ q: debouncedQ, page: 1 })
  }, [debouncedQ, filters.q, setFilters])

  const filtered = useMemo(
    () => (data ? filterProperties(data, filters) : []),
    [data, filters],
  )
  const pageData = paginate(filtered, filters.page, pageSize)

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const handleSave = async (values: PropertyFormValues) => {
    setSaving(true)
    try {
      if (editing) {
        await updateProperty(editing.id, values)
        push('Property updated')
      } else {
        await createProperty(values)
        push('Property created')
      }
      setModalOpen(false)
      reload()
    } catch {
      push('Could not save property', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell
      title="Properties"
      subtitle="Search, filter, and manage your portfolio"
      onDataReset={reload}
      actions={
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Add property
        </Button>
      }
    >
      <div className="space-y-6">
        <PropertyFiltersBar
          filters={filters}
          onChange={setFilters}
          onClear={clearFilters}
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
        />

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {loading ? 'Loading…' : `${filtered.length} properties`}
          </p>
          <div className="flex rounded-lg border border-slate-200 p-0.5">
            <button
              type="button"
              className={`rounded-md p-2 ${view === 'grid' ? 'bg-slate-100' : ''}`}
              onClick={() => setView('grid')}
              aria-label="Grid view"
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={`rounded-md p-2 ${view === 'list' ? 'bg-slate-100' : ''}`}
              onClick={() => setView('list')}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {error ? (
          <ErrorState message={error.message} onRetry={reload} />
        ) : loading ? (
          <div
            className={
              view === 'grid'
                ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                : 'space-y-4'
            }
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No properties found"
            description="Try adjusting filters or add a new property to your portfolio."
            actionLabel="Add property"
            onAction={openCreate}
          />
        ) : (
          <>
            <div
              className={
                view === 'grid'
                  ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                  : 'space-y-4'
              }
            >
              {pageData.items.map((p) => (
                <PropertyCard key={p.id} property={p} view={view} />
              ))}
            </div>
            <Pagination
              page={pageData.page}
              totalPages={pageData.totalPages}
              total={pageData.total}
              onPageChange={(page) => setFilters({ page })}
            />
          </>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit property' : 'Add property'}
        wide
      >
        <PropertyForm
          key={editing?.id ?? 'new'}
          initial={editing ? propertyToFormValues(editing) : emptyPropertyForm()}
          submitLabel={editing ? 'Save changes' : 'Create property'}
          loading={saving}
          onSubmit={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </AppShell>
  )
}
