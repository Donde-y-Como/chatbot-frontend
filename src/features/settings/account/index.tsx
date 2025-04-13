import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import ContentSection from '../components/content-section'
import { AccountWhatsAppForm } from './account-whatsapp-form'
import { useGetAccount } from './hooks/useGetAccounts'

export default function SettingsAccount() {
  const {
    data: accountData,
    isLoading: isLoadingAccount,
    error: accountError,
  } = useGetAccount()

  return (
    <ContentSection
      title='Cuenta'
      desc='Actualiza la configuración de tu cuenta de whasApp'
    >
      <div>
        {isLoadingAccount && (
          <div className='flex justify-center items-center py-10'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
            <span className='ml-2'>Cargando datos del perfil...</span>
          </div>
        )}

        {accountError && (
          <Alert variant='destructive' className='mb-6'>
            <AlertTitle>Error al cargar los datos del perfil</AlertTitle>
            <AlertDescription>
              No se pudieron cargar los datos de tu perfil. Por favor, intenta
              recargar la página.
            </AlertDescription>
          </Alert>
        )}
        {accountData && <AccountWhatsAppForm accountData={accountData} />}
      </div>
    </ContentSection>
  )
}
