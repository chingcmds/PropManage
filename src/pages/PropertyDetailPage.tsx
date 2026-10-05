import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Bath, BedDouble, Pencil, Trash2 } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { PropertyForm } from '../components/properties/PropertyForm'
import { Button } from '../components/ui/Button'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState, ErrorState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { StatusBadge } from '../components/ui/Badge'
import { TableSkeleton } from '../components/ui/Skeleton'
import { useAsync } from '../hooks/useAsync'
import {
  deleteProperty,
  fetchBookings,
  fetchPayments,
  fetchProperty,
  fetchTenants,
  updateProperty,
} from '../services/api'
import { formatCurrency, formatDate, labelFromKey } from '../utils/format'
import {
  PLACEHOLDER_IMAGE,
  bookingStatusVariant,
  paymentStatusVariant,
  propertyStatusVariant,
} from '../utils/status'
import { propertyToFormValues } from '../utils/propertyForm'
import type { PropertyFormValues } from '../types'
import { useToast } from '../context/toast-context'

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { push } = useToast()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  const propertyState = useAsync(
    () => (id ? fetchProperty(id) : Promise.resolve(undefined)),
    [id],
  )
  const tenantsState = useAsync(fetchTenants, [propertyState.data])
  const bookingsState = useAsync(fetchBookings, [propertyState.data])
  const paymentsState = useAsync(fetchPayments, [propertyState.data])

  const property = propertyState.data
  const loading = propertyState.loading

  const tenant = useMemo(
    () =>
      property?.tenantId
        ? tenantsState.data?.find((t) => t.id === property.tenantId)
        : tenantsState.data?.find((t) => t.propertyId === property?.id),
    [property, tenantsState.data],
  )

  const bookings = useMemo(
    () =>
      bookingsState.data?.filter((b) => b.propertyId === id).slice(0, 8) ?? [],
    [bookingsState.data, id],
  )

  const payments = useMemo(
    () =>
      paymentsState.data?.filter((p) => p.propertyId === id).slice(0, 8) ?? [],
    [paymentsState.data, id],
  )

  const images = property?.images.length
    ? property.images
    : [PLACEHOLDER_IMAGE]

  const handleUpdate = async (values: PropertyFormValues) => {
    if (!id) return
    setSaving(true)
    try {
      await updateProperty(id, values)
      push('Property updated')
      setEditOpen(false)
      propertyState.reload()
    } catch {
      push('Update failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    setDeleting(true)
    try {
      await deleteProperty(id)
      push('Property deleted')
      navigate('/properties')
    } catch {
      push('Delete failed', 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (propertyState.error) {
    return (
      <AppShell title="Property">
        <ErrorState message={propertyState.error.message} onRetry={propertyState.reload} />
      </AppShell>
    )
  }

  if (!loading && !property) {
    return (
      <AppShell title="Property not found">
        <EmptyState
          title="Property not found"
          description="This listing may have been removed."
          actionLabel="Back to properties"
          onAction={() => navigate('/properties')}
        />
      </AppShell>
    )
  }

  return (
    <AppShell
      title={property?.name ?? 'Loading…'}
      subtitle={
        property ? `${property.address}, ${property.city}` : undefined
      }
      onDataReset={() => {
        propertyState.reload()
        tenantsState.reload()
        bookingsState.reload()
        paymentsState.reload()
      }}
      actions={
        property ? (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Pencil className="h-4 w-4" />}
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          </div>
        ) : null
      }
    >
      {loading || !property ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="space-y-6">
          <Link
            to="/properties"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to properties
          </Link>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <img
                src={images[activeImage] ?? PLACEHOLDER_IMAGE}
                alt=""
                className="h-72 w-full rounded-xl object-cover"
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER_IMAGE
                }}
              />
              {images.length > 1 ? (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((src, i) => (
                    <button
                      key={src + i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${
                        i === activeImage ? 'border-brand-500' : 'border-transparent'
                      }`}
                    >
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge
                  status={property.status}
                  variant={propertyStatusVariant(property.status)}
                />
                <span className="text-sm text-slate-500">
                  {labelFromKey(property.type)}
                </span>
              </div>
              <p className="text-3xl font-semibold text-slate-900">
                {formatCurrency(property.price)}
                <span className="text-base font-normal text-slate-500">/month</span>
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <BedDouble className="h-4 w-4" />
                  {property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} beds`}
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  {property.bathrooms} baths
                </span>
                <span>{property.sqft.toLocaleString()} sq ft</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                {property.description}
              </p>
              <div>
                <p className="text-sm font-medium text-slate-900">Amenities</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span
                      key={a}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader title="Current tenant" />
            <CardBody>
              {tenant ? (
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-500">Name</dt>
                    <dd className="font-medium">{tenant.name}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Email</dt>
                    <dd>{tenant.email}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Phone</dt>
                    <dd>{tenant.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Lease</dt>
                    <dd>
                      {formatDate(tenant.leaseStart)} – {formatDate(tenant.leaseEnd)}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-slate-500">No tenant assigned.</p>
              )}
            </CardBody>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Bookings" subtitle="For this property" />
              <CardBody className="space-y-2">
                {bookings.length === 0 ? (
                  <p className="text-sm text-slate-500">No bookings.</p>
                ) : (
                  bookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                    >
                      <span>
                        {formatDate(b.checkIn)} – {formatDate(b.checkOut)}
                      </span>
                      <StatusBadge
                        status={b.status}
                        variant={bookingStatusVariant(b.status)}
                      />
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Payment history" subtitle="Recent charges" />
              <CardBody className="space-y-2">
                {payments.length === 0 ? (
                  <p className="text-sm text-slate-500">No payments.</p>
                ) : (
                  payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{formatCurrency(p.amount)}</p>
                        <p className="text-xs text-slate-500">Due {formatDate(p.dueDate)}</p>
                      </div>
                      <StatusBadge
                        status={p.status}
                        variant={paymentStatusVariant(p.status)}
                      />
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {property ? (
        <>
          <Modal
            open={editOpen}
            onClose={() => setEditOpen(false)}
            title="Edit property"
            wide
          >
            <PropertyForm
              initial={propertyToFormValues(property)}
              submitLabel="Save changes"
              loading={saving}
              onSubmit={handleUpdate}
              onCancel={() => setEditOpen(false)}
            />
          </Modal>
          <ConfirmDialog
            open={deleteOpen}
            title="Delete property"
            message="This removes the property from your portfolio. This action cannot be undone."
            confirmLabel="Delete"
            loading={deleting}
            onConfirm={handleDelete}
            onCancel={() => setDeleteOpen(false)}
          />
        </>
      ) : null}
    </AppShell>
  )
}
