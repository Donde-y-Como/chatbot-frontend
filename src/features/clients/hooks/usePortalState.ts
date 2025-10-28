import { useState, useEffect } from 'react'
import { ClientApiService } from '../services/ClientApiService'
import { PortalSection } from '../components/portal/shared/portalTypes'

interface TokenValidationData {
  isValid: boolean
  clientId: string
  businessId: string
  clientName: string
  expiresAt: string
}

interface UsePortalStateReturn {
  // Loading states
  loading: boolean
  error: string | null

  // Token validation
  tokenData: TokenValidationData | null

  // Navigation state
  activeSection: PortalSection
  selectedTarget: 'self' | 'other' | null

  // Actions
  setActiveSection: (section: PortalSection) => void
  setSelectedTarget: (target: 'self' | 'other' | null) => void
  goToOverview: () => void
  handleSectionChange: (section: PortalSection, target?: 'self' | 'other' | null) => void
}

export function usePortalState(token: string | null): UsePortalStateReturn {
  const [loading, setLoading] = useState(true)
  const [tokenData, setTokenData] = useState<TokenValidationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<PortalSection>('overview')
  const [selectedTarget, setSelectedTarget] = useState<'self' | 'other' | null>(null)

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token no proporcionado')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await ClientApiService.validatePortalToken(token)
        setTokenData(data)
        setError(null)
      } catch (err: any) {
        console.error('Error validating token:', err)

        if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
          setError('Error de conexión. Verifica que el servidor esté funcionando.')
        } else if (err.response?.status === 404) {
          setError('Token no encontrado o inválido.')
        } else if (err.response?.status === 401) {
          setError('Token expirado o desactivado.')
        } else {
          setError('Token inválido o expirado. Solicita un nuevo enlace de acceso.')
        }
      } finally {
        setLoading(false)
      }
    }

    validateToken()
  }, [token])

  const goToOverview = () => {
    setActiveSection('overview')
    setSelectedTarget(null)
  }

  const handleSectionChange = (section: PortalSection, target: 'self' | 'other' | null = null) => {
    setActiveSection(section)
    setSelectedTarget(target)
  }

  return {
    loading,
    error,
    tokenData,
    activeSection,
    selectedTarget,
    setActiveSection,
    setSelectedTarget,
    goToOverview,
    handleSectionChange
  }
}