import type { ReactNode } from 'react'
import type { BadgeVariant } from '../../utils/status'
import { labelFromKey } from '../../utils/format'

const styles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  purple: 'bg-violet-50 text-violet-700 ring-violet-600/20',
}

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

export function Badge({
  variant = 'neutral',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export function StatusBadge({
  status,
  variant,
}: {
  status: string
  variant: BadgeVariant
}) {
  return <Badge variant={variant}>{labelFromKey(status)}</Badge>
}
