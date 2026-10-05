import type {
  BookingStatus,
  PaymentStatus,
  PropertyStatus,
} from '../types'

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'info'
  | 'purple'

export function propertyStatusVariant(status: PropertyStatus): BadgeVariant {
  switch (status) {
    case 'available':
      return 'success'
    case 'occupied':
      return 'info'
    case 'maintenance':
      return 'warning'
  }
}

export function bookingStatusVariant(status: BookingStatus): BadgeVariant {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'confirmed':
      return 'info'
    case 'checked-in':
      return 'purple'
    case 'completed':
      return 'success'
    case 'cancelled':
      return 'neutral'
  }
}

export function paymentStatusVariant(status: PaymentStatus): BadgeVariant {
  switch (status) {
    case 'paid':
      return 'success'
    case 'pending':
      return 'warning'
    case 'overdue':
      return 'danger'
  }
}

export const PLACEHOLDER_IMAGE =
  'https://placehold.co/800x600/e2e8f0/64748b?text=Property'
