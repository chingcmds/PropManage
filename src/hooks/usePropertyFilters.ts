import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Property, PropertyFilters, PropertySort } from '../types'

const PAGE_SIZE = 8

export function parsePropertyFilters(params: URLSearchParams): PropertyFilters {
  const page = Number(params.get('page') ?? '1')
  return {
    q: params.get('q') ?? '',
    status: (params.get('status') ?? '') as PropertyFilters['status'],
    type: (params.get('type') ?? '') as PropertyFilters['type'],
    minPrice: params.get('minPrice') ?? '',
    maxPrice: params.get('maxPrice') ?? '',
    bedrooms: params.get('bedrooms') ?? '',
    sort: (params.get('sort') as PropertySort) ?? 'newest',
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

function sortProperties(items: Property[], sort: PropertySort): Property[] {
  const copy = [...items]
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price)
    case 'name-asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    case 'newest':
    default:
      return copy
  }
}

export function filterProperties(
  properties: Property[],
  filters: PropertyFilters,
): Property[] {
  const q = filters.q.trim().toLowerCase()
  let result = properties.filter((p) => {
    if (q) {
      const hay = `${p.name} ${p.address} ${p.city}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (filters.status && p.status !== filters.status) return false
    if (filters.type && p.type !== filters.type) return false
    if (filters.bedrooms !== '') {
      const beds = Number(filters.bedrooms)
      if (filters.bedrooms === '4' ? p.bedrooms < 4 : p.bedrooms !== beds)
        return false
    }
    if (filters.minPrice !== '') {
      const min = Number(filters.minPrice)
      if (!Number.isNaN(min) && p.price < min) return false
    }
    if (filters.maxPrice !== '') {
      const max = Number(filters.maxPrice)
      if (!Number.isNaN(max) && p.price > max) return false
    }
    return true
  })
  result = sortProperties(result, filters.sort)
  return result
}

export function usePropertyFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(
    () => parsePropertyFilters(searchParams),
    [searchParams],
  )

  const setFilters = useCallback(
    (patch: Partial<PropertyFilters>) => {
      const next = { ...filters, ...patch }
      const params = new URLSearchParams()
      if (next.q) params.set('q', next.q)
      if (next.status) params.set('status', next.status)
      if (next.type) params.set('type', next.type)
      if (next.minPrice) params.set('minPrice', next.minPrice)
      if (next.maxPrice) params.set('maxPrice', next.maxPrice)
      if (next.bedrooms) params.set('bedrooms', next.bedrooms)
      if (next.sort && next.sort !== 'newest') params.set('sort', next.sort)
      if (next.page > 1) params.set('page', String(next.page))
      setSearchParams(params)
    },
    [filters, setSearchParams],
  )

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams())
  }, [setSearchParams])

  return { filters, setFilters, clearFilters, pageSize: PAGE_SIZE }
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    totalPages,
    page: safePage,
    total: items.length,
  }
}
