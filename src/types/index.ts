export type PropertyStatus = 'available' | 'occupied' | 'maintenance'
export type PropertyType = 'apartment' | 'house' | 'condo' | 'studio'

export interface Property {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  type: PropertyType
  status: PropertyStatus
  price: number
  bedrooms: number
  bathrooms: number
  sqft: number
  amenities: string[]
  images: string[]
  description: string
  tenantId?: string
}

export interface Tenant {
  id: string
  name: string
  email: string
  phone: string
  propertyId: string
  leaseStart: string
  leaseEnd: string
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked-in'
  | 'completed'
  | 'cancelled'

export interface Booking {
  id: string
  propertyId: string
  tenantId: string
  checkIn: string
  checkOut: string
  status: BookingStatus
  guests: number
  totalAmount: number
}

export type PaymentStatus = 'paid' | 'pending' | 'overdue'
export type PaymentMethod = 'card' | 'bank_transfer' | 'cash' | 'check'

export interface Payment {
  id: string
  propertyId: string
  tenantId: string
  amount: number
  dueDate: string
  paidDate?: string
  status: PaymentStatus
  method?: PaymentMethod
  description: string
}

export type PropertySort =
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'newest'

export interface PropertyFilters {
  q: string
  status: PropertyStatus | ''
  type: PropertyType | ''
  minPrice: string
  maxPrice: string
  bedrooms: string
  sort: PropertySort
  page: number
}

export interface PropertyFormValues {
  name: string
  address: string
  city: string
  state: string
  zip: string
  type: PropertyType
  status: PropertyStatus
  price: number
  bedrooms: number
  bathrooms: number
  sqft: number
  amenities: string
  description: string
  imageUrl: string
}
