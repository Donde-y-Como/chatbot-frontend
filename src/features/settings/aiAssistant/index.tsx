import { useState } from 'react'
import { Loader2, AlertCircle, Bot } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import ContentSection from '../components/content-section'
import { AIAssistantForm } from './components/AIAssistantForm'
import {
  useGetAIAssistantConfig,
  useCreateAIAssistantConfig,
  useUpdateAIAssistantConfig,
} from './hooks/useAIAssistant'
import { CreateAIAssistantData } from './types'

export default function SettingsAiAssistant() {
  const {
    data: configuration,
    isPending: isLoadingConfig,
    error: configError,
  } = useGetAIAssistantConfig()

  const { mutateAsync: createConfig, isPending: isCreating } =
    useCreateAIAssistantConfig()

  const { mutateAsync: updateConfig, isPending: isUpdating } =
    useUpdateAIAssistantConfig()

  const handleSubmit = async (data: CreateAIAssistantData) => {
    try {
      if (configuration) {
        // Update existing configuration
        await updateConfig(data)
      } else {
        // Create new configuration
        await createConfig(data)
      }
    } catch (error) {
      // Error handling is done in the hooks with toast notifications
      console.error('Error saving AI Assistant configuration:', error)
    }
  }

  return (
    <ContentSection
      title="Asistente IA"
      desc="Configura tu asistente de inteligencia artificial para responder automáticamente a tus clientes"
    >
      <div className="space-y-6">
        {/* Loading state */}
        {isLoadingConfig && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
              <span className="text-muted-foreground">
                Cargando configuración...
              </span>
            </CardContent>
          </Card>
        )}

        {/* Error state */}
        {configError && !isLoadingConfig && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error al cargar la configuración</AlertTitle>
            <AlertDescription>
              No se pudo cargar la configuración del asistente. Por favor,
              intenta recargar la página.
            </AlertDescription>
          </Alert>
        )}

        {/* Info card for new users */}
        {!configuration && !isLoadingConfig && !configError && (
          <Alert>
            <Bot className="h-4 w-4" />
            <AlertTitle>Configura tu Asistente de IA</AlertTitle>
            <AlertDescription>
              Tu asistente de IA puede responder automáticamente a las consultas
              de tus clientes, ayudarles a agendar citas, proporcionar
              información sobre servicios y más. Configura los prompts a
              continuación para personalizar el comportamiento del asistente.
            </AlertDescription>
          </Alert>
        )}

        {/* Configuration form */}
        {!isLoadingConfig && !configError && (
          <AIAssistantForm
            initialData={configuration}
            onSubmit={handleSubmit}
            isSubmitting={isCreating || isUpdating}
          />
        )}

      </div>
    </ContentSection>
  )
}