import { useState } from 'react'
import type { PropertyFormValues } from '../../types'
import {
  validatePropertyForm,
  type FormErrors,
} from '../../utils/propertyForm'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'

interface PropertyFormProps {
  initial: PropertyFormValues
  submitLabel: string
  loading?: boolean
  onSubmit: (values: PropertyFormValues) => void
  onCancel: () => void
}

export function PropertyForm({
  initial,
  submitLabel,
  loading,
  onSubmit,
  onCancel,
}: PropertyFormProps) {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState<FormErrors>({})

  const set = <K extends keyof PropertyFormValues>(
    key: K,
    val: PropertyFormValues[K],
  ) => setValues((v) => ({ ...v, [key]: val }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors = validatePropertyForm(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Property name"
        name="name"
        value={values.name}
        onChange={(e) => set('name', e.target.value)}
        error={errors.name}
      />
      <Input
        label="Street address"
        name="address"
        value={values.address}
        onChange={(e) => set('address', e.target.value)}
        error={errors.address}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="City"
          name="city"
          value={values.city}
          onChange={(e) => set('city', e.target.value)}
          error={errors.city}
        />
        <Input
          label="State"
          name="state"
          value={values.state}
          onChange={(e) => set('state', e.target.value)}
          error={errors.state}
        />
        <Input
          label="ZIP"
          name="zip"
          value={values.zip}
          onChange={(e) => set('zip', e.target.value)}
          error={errors.zip}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Type"
          value={values.type}
          onChange={(e) =>
            set('type', e.target.value as PropertyFormValues['type'])
          }
          options={[
            { value: 'apartment', label: 'Apartment' },
            { value: 'house', label: 'House' },
            { value: 'condo', label: 'Condo' },
            { value: 'studio', label: 'Studio' },
          ]}
        />
        <Select
          label="Status"
          value={values.status}
          onChange={(e) =>
            set('status', e.target.value as PropertyFormValues['status'])
          }
          options={[
            { value: 'available', label: 'Available' },
            { value: 'occupied', label: 'Occupied' },
            { value: 'maintenance', label: 'Maintenance' },
          ]}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Monthly rent ($)"
          type="number"
          min={0}
          value={values.price}
          onChange={(e) => set('price', Number(e.target.value))}
          error={errors.price}
        />
        <Input
          label="Bedrooms"
          type="number"
          min={0}
          value={values.bedrooms}
          onChange={(e) => set('bedrooms', Number(e.target.value))}
          error={errors.bedrooms}
        />
        <Input
          label="Bathrooms"
          type="number"
          min={1}
          step={0.5}
          value={values.bathrooms}
          onChange={(e) => set('bathrooms', Number(e.target.value))}
          error={errors.bathrooms}
        />
        <Input
          label="Sq ft"
          type="number"
          min={1}
          value={values.sqft}
          onChange={(e) => set('sqft', Number(e.target.value))}
          error={errors.sqft}
        />
      </div>
      <Input
        label="Cover image URL"
        name="imageUrl"
        value={values.imageUrl}
        onChange={(e) => set('imageUrl', e.target.value)}
        hint="Optional — uses a placeholder if empty"
      />
      <Input
        label="Amenities"
        name="amenities"
        value={values.amenities}
        onChange={(e) => set('amenities', e.target.value)}
        hint="Comma-separated (e.g. Parking, Gym)"
      />
      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
