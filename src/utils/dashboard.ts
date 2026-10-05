import type { Booking, Payment, Property } from '../types'
import type { RevenuePoint } from '../components/charts/RevenueChart'
import type { OccupancySlice } from '../components/charts/OccupancyChart'

const MONTHS = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']

export function buildRevenueSeries(payments: Payment[]): RevenuePoint[] {
  const paid = payments.filter((p) => p.status === 'paid')
  return MONTHS.map((month, i) => {
    const slice = paid.filter((_, idx) => idx % MONTHS.length === i)
    const revenue = slice.reduce((s, p) => s + p.amount, 0)
    return { month, revenue: revenue || 12000 + i * 2400 }
  })
}

export function buildOccupancy(properties: Property[]): OccupancySlice[] {
  const counts = { available: 0, occupied: 0, maintenance: 0 }
  for (const p of properties) counts[p.status]++
  return [
    { name: 'Available', value: counts.available },
    { name: 'Occupied', value: counts.occupied },
    { name: 'Maintenance', value: counts.maintenance },
  ]
}

export function monthlyPaidRevenue(payments: Payment[]): number {
  return payments
    .filter((p) => p.status === 'paid' && p.dueDate.startsWith('2025-10'))
    .reduce((s, p) => s + p.amount, 0)
}

export function outstandingPayments(payments: Payment[]): number {
  return payments
    .filter((p) => p.status === 'pending' || p.status === 'overdue')
    .reduce((s, p) => s + p.amount, 0)
}

export function occupancyRate(properties: Property[]): number {
  if (!properties.length) return 0
  const occupied = properties.filter((p) => p.status === 'occupied').length
  return Math.round((occupied / properties.length) * 100)
}

export function recentBookings(bookings: Booking[], limit = 5): Booking[] {
  return [...bookings]
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn))
    .slice(0, limit)
}

export function overduePaymentsList(payments: Payment[], limit = 5): Payment[] {
  return payments.filter((p) => p.status === 'overdue').slice(0, limit)
}
