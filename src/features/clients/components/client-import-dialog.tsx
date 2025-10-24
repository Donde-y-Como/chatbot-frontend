import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useWhatsApp } from '@/features/settings/whatsappWeb/useWhatsApp'
import { Download, Loader2, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/api/axiosInstance'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { queryClient } from '@/hooks/use-web-socket'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'

interface ImportResponse {
  totalContacts: number
  imported: number
  updated: number
  skipped: number
  errors: Array<{
    remoteJid: string
    error: string
  }>
}

interface ClientImportDialogProps {
  open: boolean
  onOpenChange: () => void
}

export function ClientImportDialog({ open, onOpenChange }: ClientImportDialogProps) {
  const { isConnected, isLoading: whatsappLoading } = useWhatsApp()
  const [overrideName, setOverrideName] = useState(false)
  const [overridePhoto, setOverridePhoto] = useState(false)
  const [importResult, setImportResult] = useState<ImportResponse | null>(null)

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (overrideFields: string[]) => {
      const response = await api.post<ImportResponse>('/clients/import/whatsapp-web', {
        overrideFields,
      })
      return response.data
    },
    onSuccess: (data) => {
      setImportResult(data)
      queryClient.invalidateQueries({ queryKey: ['clients'] })

      const message = `${data.imported} nuevo(s), ${data.updated} actualizado(s), ${data.skipped} omitido(s)`
      toast.success('Importación completada', {
        description: message,
      })
    },
    onError: (error: any) => {
      toast.error('Error al importar contactos', {
        description: error?.response?.data?.message || 'Intenta nuevamente',
      })
    },
  })

  const handleImport = () => {
    const overrideFields: string[] = []
    if (overrideName) overrideFields.push('name')
    if (overridePhoto) overrideFields.push('photo')

    importMutation.mutate(overrideFields)
  }

  const resetDialog = () => {
    setImportResult(null)
    setOverrideName(false)
    setOverridePhoto(false)
    importMutation.reset()
  }

  const handleClose = () => {
    resetDialog()
    onOpenChange()
  }

  const showResults = importMutation.isSuccess && importResult

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose()
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Importar Contactos de WhatsApp
          </DialogTitle>
          <DialogDescription>
            {showResults
              ? 'Resumen de la importación'
              : 'Importa todos tus contactos de WhatsApp como clientes'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Connection Warning */}
          {!isConnected && !whatsappLoading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>WhatsApp no conectado</AlertTitle>
              <AlertDescription>
                Debes conectar WhatsApp en Configuración antes de importar contactos.
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {importMutation.isPending && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm font-medium">Importando contactos...</p>
              <p className="text-xs text-muted-foreground">Esto puede tomar unos momentos</p>
            </div>
          )}

          {/* Import Configuration */}
          {!importMutation.isPending && !showResults && isConnected && (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>¿Estás seguro?</AlertTitle>
                <AlertDescription>
                  Esta acción importará todos tus contactos de WhatsApp como clientes en el sistema.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <p className="text-sm font-medium">
                  Cuando se encuentre un número duplicado:
                </p>

                <div className="space-y-3 pl-1">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="override-name"
                      checked={overrideName}
                      onCheckedChange={(checked) => setOverrideName(checked === true)}
                    />
                    <div className="space-y-1">
                      <label
                        htmlFor="override-name"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Actualizar nombre
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Reemplazar el nombre del cliente existente con el de WhatsApp
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="override-photo"
                      checked={overridePhoto}
                      onCheckedChange={(checked) => setOverridePhoto(checked === true)}
                    />
                    <div className="space-y-1">
                      <label
                        htmlFor="override-photo"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Actualizar foto
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Reemplazar la foto del cliente existente con la de WhatsApp
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Results Display */}
          {showResults && importResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4 bg-muted/50">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-primary">{importResult.totalContacts}</span>
                    <span className="text-xs text-muted-foreground">Total procesados</span>
                  </div>
                </Card>

                <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {importResult.imported}
                    </span>
                    <span className="text-xs text-green-700 dark:text-green-400">Nuevos clientes</span>
                  </div>
                </Card>

                <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {importResult.updated}
                    </span>
                    <span className="text-xs text-blue-700 dark:text-blue-400">Actualizados</span>
                  </div>
                </Card>

                <Card className="p-4 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {importResult.skipped}
                    </span>
                    <span className="text-xs text-orange-700 dark:text-orange-400">Omitidos</span>
                  </div>
                </Card>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <>
                  <Separator />
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Errores encontrados ({importResult.errors.length})</AlertTitle>
                    <AlertDescription className="mt-2 space-y-1">
                      {importResult.errors.slice(0, 3).map((error, idx) => (
                        <div key={idx} className="text-xs">
                          • {error.remoteJid}: {error.error}
                        </div>
                      ))}
                      {importResult.errors.length > 3 && (
                        <div className="text-xs font-medium">
                          ... y {importResult.errors.length - 3} más
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                </>
              )}

              {importResult.errors.length === 0 && (
                <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle className="text-green-700 dark:text-green-400">
                    ¡Importación exitosa!
                  </AlertTitle>
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Todos los contactos se procesaron correctamente.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {showResults ? (
            <Button onClick={handleClose} className="w-full sm:w-auto">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Cerrar
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={importMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleImport}
                disabled={!isConnected || importMutation.isPending || whatsappLoading}
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Importar Ahora
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
