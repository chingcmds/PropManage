import { Search, SlidersHorizontal } from 'lucide-react'
import type { PropertyFilters as Filters } from '../../types'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'

interface PropertyFiltersProps {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
  onClear: () => void
  searchInput: string
  onSearchInputChange: (value: string) => void
}

export function PropertyFiltersBar({
  filters,
  onChange,
  onClear,
  searchInput,
  onSearchInputChange,
}: PropertyFiltersProps) {
  const hasActive =
    filters.q ||
    filters.status ||
    filters.type ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.bedrooms

  return (
    <div className="space-y-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-card">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
            <Search className="h-4 w-4" />
            Search
          </label>
          <input
            type="search"
            placeholder="Name, address, or city…"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <Select
          label="Status"
          value={filters.status}
          onChange={(e) =>
            onChange({ status: e.target.value as Filters['status'], page: 1 })
          }
          options={[
            { value: '', label: 'All statuses' },
            { value: 'available', label: 'Available' },
            { value: 'occupied', label: 'Occupied' },
            { value: 'maintenance', label: 'Maintenance' },
          ]}
        />
        <Select
          label="Type"
          value={filters.type}
          onChange={(e) =>
            onChange({ type: e.target.value as Filters['type'], page: 1 })
          }
          options={[
            { value: '', label: 'All types' },
            { value: 'apartment', label: 'Apartment' },
            { value: 'house', label: 'House' },
            { value: 'condo', label: 'Condo' },
            { value: 'studio', label: 'Studio' },
          ]}
        />
        <Select
          label="Sort"
          value={filters.sort}
          onChange={(e) =>
            onChange({ sort: e.target.value as Filters['sort'], page: 1 })
          }
          options={[
            { value: 'newest', label: 'Newest' },
            { value: 'price-asc', label: 'Price: low to high' },
            { value: 'price-desc', label: 'Price: high to low' },
            { value: 'name-asc', label: 'Name A–Z' },
          ]}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input
          label="Min price"
          type="number"
          min={0}
          value={filters.minPrice}
          onChange={(e) => onChange({ minPrice: e.target.value, page: 1 })}
          placeholder="0"
        />
        <Input
          label="Max price"
          type="number"
          min={0}
          value={filters.maxPrice}
          onChange={(e) => onChange({ maxPrice: e.target.value, page: 1 })}
          placeholder="Any"
        />
        <Select
          label="Bedrooms"
          value={filters.bedrooms}
          onChange={(e) => onChange({ bedrooms: e.target.value, page: 1 })}
          options={[
            { value: '', label: 'Any' },
            { value: '0', label: 'Studio' },
            { value: '1', label: '1+' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4+' },
          ]}
        />
        {hasActive ? (
          <Button variant="secondary" onClick={onClear} leftIcon={<SlidersHorizontal className="h-4 w-4" />}>
            Clear filters
          </Button>
        ) : null}
      </div>
    </div>
  )
}
