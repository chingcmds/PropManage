import { Link } from 'react-router-dom'
import { Bath, BedDouble, MapPin } from 'lucide-react'
import type { Property } from '../../types'
import { formatCurrency, labelFromKey } from '../../utils/format'
import { PLACEHOLDER_IMAGE, propertyStatusVariant } from '../../utils/status'
import { StatusBadge } from '../ui/Badge'

interface PropertyCardProps {
  property: Property
  view: 'grid' | 'list'
}

export function PropertyCard({ property, view }: PropertyCardProps) {
  const img = property.images[0] ?? PLACEHOLDER_IMAGE

  if (view === 'list') {
    return (
      <Link
        to={`/properties/${property.id}`}
        className="flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-card transition hover:border-brand-200 sm:flex-row"
      >
        <img
          src={img}
          alt=""
          className="h-44 w-full object-cover sm:h-auto sm:w-48"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_IMAGE
          }}
        />
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-900">{property.name}</h3>
              <StatusBadge
                status={property.status}
                variant={propertyStatusVariant(property.status)}
              />
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="h-4 w-4 shrink-0" />
              {property.city}, {property.state}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-lg font-semibold text-brand-700">
              {formatCurrency(property.price)}
              <span className="text-sm font-normal text-slate-500">/mo</span>
            </p>
            <div className="flex gap-3 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <BedDouble className="h-4 w-4" />
                {property.bedrooms === 0 ? 'Studio' : property.bedrooms}
              </span>
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                {property.bathrooms}
              </span>
              <span className="text-slate-400">{labelFromKey(property.type)}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/properties/${property.id}`}
      className="group overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-card transition hover:border-brand-200 hover:shadow-md"
    >
      <div className="relative">
        <img
          src={img}
          alt=""
          className="h-44 w-full object-cover transition group-hover:scale-[1.02]"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_IMAGE
          }}
        />
        <div className="absolute left-3 top-3">
          <StatusBadge
            status={property.status}
            variant={propertyStatusVariant(property.status)}
          />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900">{property.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          {property.city}, {property.state}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <p className="font-semibold text-brand-700">
            {formatCurrency(property.price)}
            <span className="text-xs font-normal text-slate-500">/mo</span>
          </p>
          <div className="flex gap-2 text-xs text-slate-600">
            <span className="flex items-center gap-0.5">
              <BedDouble className="h-3.5 w-3.5" />
              {property.bedrooms === 0 ? 'Studio' : property.bedrooms}
            </span>
            <span className="flex items-center gap-0.5">
              <Bath className="h-3.5 w-3.5" />
              {property.bathrooms}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
