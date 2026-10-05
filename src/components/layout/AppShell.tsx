import { useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { resetDemoData } from '../../services/api'
import { useToast } from '../../context/toast-context'

interface AppShellProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  onDataReset?: () => void
  children: ReactNode
}

export function AppShell({
  title,
  subtitle,
  actions,
  onDataReset,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [resetting, setResetting] = useState(false)
  const { push } = useToast()

  const handleReset = async () => {
    setResetting(true)
    try {
      await resetDemoData()
      push('Demo data restored from seed')
      onDataReset?.()
    } catch {
      push('Failed to reset demo data', 'error')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setMobileOpen(true)}
          onResetDemo={handleReset}
          resetLoading={resetting}
          actions={actions}
        />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
