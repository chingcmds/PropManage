import type { Property, PropertyFormValues } from '../types'

export type FormErrors = Partial<Record<keyof PropertyFormValues, string>>

export function propertyToFormValues(property: Property): PropertyFormValues {
  return {
    name: property.name,
    address: property.address,
    city: property.city,
    state: property.state,
    zip: property.zip,
    type: property.type,
    status: property.status,
    price: property.price,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sqft: property.sqft,
    amenities: property.amenities.join(', '),
    description: property.description,
    imageUrl: property.images[0] ?? '',
  }
}

export const emptyPropertyForm = (): PropertyFormValues => ({
  name: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  type: 'apartment',
  status: 'available',
  price: 2000,
  bedrooms: 1,
  bathrooms: 1,
  sqft: 800,
  amenities: '',
  description: '',
  imageUrl: '',
})

export function validatePropertyForm(values: PropertyFormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.name.trim()) errors.name = 'Name is required'
  if (!values.address.trim()) errors.address = 'Address is required'
  if (!values.city.trim()) errors.city = 'City is required'
  if (!values.state.trim()) errors.state = 'State is required'
  if (!values.zip.trim()) errors.zip = 'ZIP is required'
  if (values.price <= 0) errors.price = 'Price must be greater than 0'
  if (values.bedrooms < 0) errors.bedrooms = 'Invalid bedrooms'
  if (values.bathrooms <= 0) errors.bathrooms = 'At least one bathroom'
  if (values.sqft <= 0) errors.sqft = 'Square footage must be positive'
  return errors
}
