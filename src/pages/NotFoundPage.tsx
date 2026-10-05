import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { EmptyState } from '../components/ui/EmptyState'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <AppShell title="Page not found">
      <EmptyState
        title="404 — Not found"
        description="The page you requested does not exist in this demo app."
        actionLabel="Go to dashboard"
        onAction={() => navigate('/')}
      />
    </AppShell>
  )
}
