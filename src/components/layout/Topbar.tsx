import type { ReactNode } from 'react'
import { Menu, RotateCcw } from 'lucide-react'
import { Button } from '../ui/Button'

interface TopbarProps {
  title: string
  subtitle?: string
  onMenuClick: () => void
  onResetDemo?: () => void
  resetLoading?: boolean
  actions?: ReactNode
}

export function Topbar({
  title,
  subtitle,
  onMenuClick,
  onResetDemo,
  resetLoading,
  actions,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          aria-label="Open navigation"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-slate-900">{title}</h1>
          {subtitle ? (
            <p className="truncate text-xs text-slate-500 sm:text-sm">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {actions}
        {onResetDemo ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={onResetDemo}
            disabled={resetLoading}
            leftIcon={<RotateCcw className="h-4 w-4" />}
          >
            <span className="hidden sm:inline">Reset demo</span>
            <span className="sm:hidden">Reset</span>
          </Button>
        ) : null}
      </div>
    </header>
  )
}
