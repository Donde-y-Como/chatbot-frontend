import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { usePortalState } from '../hooks/usePortalState'
import { useClientPortalAppointments, useClientPortalServicesHistory } from '../hooks/portal'

// Components
import { PortalHeader } from './portal/shared/PortalHeader'
import { PortalSidebar } from './portal/shared/PortalSidebar'
import { DashboardSection } from './portal/dashboard/DashboardSection'
import { PortalSectionRenderer } from './portal/shared/PortalSectionRenderer'

export default function ClientPortal() {
  const searchParams = new URLSearchParams(window.location.search)
  const token = searchParams.get('token')

  const {
    loading,
    error,
    tokenData,
    activeSection,
    selectedTarget,
    setSelectedTarget,
    goToOverview,
    handleSectionChange
  } = usePortalState(token)

  // Data for navigation counts
  const { data: appointments } = useClientPortalAppointments(
    token || '',
    !!tokenData?.isValid
  )

  // TODO: Re-enable when backend implements /clients/portal/{id}/services-history endpoint
  // const { data: servicesHistory } = useClientPortalServicesHistory(
  //   tokenData?.clientId || '',
  //   token || '',
  //   !!tokenData?.isValid
  // )
  const servicesHistory = undefined as any // Temporarily disabled

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Validando acceso...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !tokenData?.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-red-600 mb-2">Acceso Denegado</h2>
              <p className="text-gray-600">{error || 'Token inválido'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <PortalHeader
        clientName={tokenData.clientName}
        expiresAt={tokenData.expiresAt}
      />

      <div className="container mx-auto py-8 px-4">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <PortalSidebar
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              appointmentsCount={appointments?.length}
              servicesHistoryCount={servicesHistory?.length}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {activeSection === 'overview' ? (
              <DashboardSection
                token={token!}
                clientName={tokenData.clientName}
                onSectionChange={handleSectionChange}
              />
            ) : (
              <PortalSectionRenderer
                section={activeSection}
                selectedTarget={selectedTarget}
                clientId={tokenData.clientId}
                token={token!}
                onBack={goToOverview}
                onTargetSelect={setSelectedTarget}
                onSectionChange={handleSectionChange}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}