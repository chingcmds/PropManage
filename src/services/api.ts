import propertiesSeed from '../data/properties.json'
import tenantsSeed from '../data/tenants.json'
import bookingsSeed from '../data/bookings.json'
import paymentsSeed from '../data/payments.json'
import type {
  Booking,
  Payment,
  Property,
  PropertyFormValues,
  Tenant,
} from '../types'

const STORAGE_KEY = 'pmd_demo_v1'
const DELAY_MS = 350

interface Store {
  properties: Property[]
  tenants: Tenant[]
  bookings: Booking[]
  payments: Payment[]
}

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, DELAY_MS))
}

function readStore(): Store {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    return JSON.parse(raw) as Store
  }
  const seed: Store = {
    properties: propertiesSeed as Property[],
    tenants: tenantsSeed as Tenant[],
    bookings: bookingsSeed as Booking[],
    payments: paymentsSeed as Payment[],
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
  return seed
}

function writeStore(store: Store): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

export async function resetDemoData(): Promise<void> {
  await delay()
  localStorage.removeItem(STORAGE_KEY)
  readStore()
}

export async function fetchProperties(): Promise<Property[]> {
  await delay()
  return readStore().properties
}

export async function fetchProperty(id: string): Promise<Property | undefined> {
  await delay()
  return readStore().properties.find((p) => p.id === id)
}

export async function createProperty(
  values: PropertyFormValues,
): Promise<Property> {
  await delay()
  const store = readStore()
  const property: Property = {
    id: newId('prop'),
    name: values.name.trim(),
    address: values.address.trim(),
    city: values.city.trim(),
    state: values.state.trim(),
    zip: values.zip.trim(),
    type: values.type,
    status: values.status,
    price: values.price,
    bedrooms: values.bedrooms,
    bathrooms: values.bathrooms,
    sqft: values.sqft,
    amenities: values.amenities
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean),
    images: values.imageUrl.trim()
      ? [values.imageUrl.trim()]
      : ['https://placehold.co/800x600/e2e8f0/64748b?text=Property'],
    description: values.description.trim(),
  }
  store.properties = [property, ...store.properties]
  writeStore(store)
  return property
}

export async function updateProperty(
  id: string,
  values: PropertyFormValues,
): Promise<Property> {
  await delay()
  const store = readStore()
  const idx = store.properties.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('Property not found')
  const existing = store.properties[idx]
  const updated: Property = {
    ...existing,
    name: values.name.trim(),
    address: values.address.trim(),
    city: values.city.trim(),
    state: values.state.trim(),
    zip: values.zip.trim(),
    type: values.type,
    status: values.status,
    price: values.price,
    bedrooms: values.bedrooms,
    bathrooms: values.bathrooms,
    sqft: values.sqft,
    amenities: values.amenities
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean),
    images: values.imageUrl.trim()
      ? [values.imageUrl.trim(), ...existing.images.slice(1)]
      : existing.images,
    description: values.description.trim(),
  }
  store.properties[idx] = updated
  writeStore(store)
  return updated
}

export async function deleteProperty(id: string): Promise<void> {
  await delay()
  const store = readStore()
  store.properties = store.properties.filter((p) => p.id !== id)
  writeStore(store)
}

export async function fetchTenants(): Promise<Tenant[]> {
  await delay()
  return readStore().tenants
}

export async function fetchBookings(): Promise<Booking[]> {
  await delay()
  return readStore().bookings
}

export async function fetchPayments(): Promise<Payment[]> {
  await delay()
  return readStore().payments
}

export async function fetchDashboardBundle(): Promise<Store> {
  await delay()
  return readStore()
}
