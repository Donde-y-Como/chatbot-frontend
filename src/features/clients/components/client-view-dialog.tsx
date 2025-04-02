import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar, Mail, MapPin, Paperclip, Tag, Clock, ExternalLink, FileType } from "lucide-react"
import { format } from "date-fns"
import { ClientPrimitives } from "../types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ClientViewDialogProps {
  currentClient?: ClientPrimitives
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientViewDialog({ currentClient, open, onOpenChange }: ClientViewDialogProps) {
  if (!currentClient) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificado';
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        onOpenChange(state)
      }}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/10">
              <AvatarImage src={currentClient.photo} alt={currentClient.name} />
              <AvatarFallback className="text-lg">
                {currentClient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl font-bold">Detalles del Cliente</DialogTitle>
              <p className="text-sm font-medium mt-1">{currentClient.name}</p>
              <DialogDescription className="flex items-center mt-1">
                <Mail className="h-4 w-4 mr-2" />
                {currentClient.email || 'Sin correo electrónico'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] w-full">
          <Tabs defaultValue="details" className="w-full mt-2" orientation="horizontal">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="annexes">Anexos</TabsTrigger>
              <TabsTrigger value="notes">Notas</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal Information */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-lg">Información Personal</h3>
                    <Separator />
                    
                    <div className="space-y-2">
                      {currentClient.address && (
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <span>{currentClient.address}</span>
                        </div>
                      )}
                      
                      {currentClient.birthdate && (
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
                          <span>Nacimiento: {formatDate(currentClient.birthdate)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Platform Identities */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-lg">Cuentas de Plataforma</h3>
                    <Separator />
                    
                    {currentClient.platformIdentities && currentClient.platformIdentities.length > 0 ? (
                      <div className="space-y-3">
                        {currentClient.platformIdentities.map((identity, index) => (
                          <div key={index} className="border rounded-md p-3">
                            <div className="flex items-center justify-between mb-2">
                              <Badge className="mr-2">{identity.platformName}</Badge>
                              <span className="text-xs text-muted-foreground">ID: {identity.platformId}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium">{identity.profileName}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Sin identidades de plataforma asociadas</p>
                    )}
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-lg">Etiquetas</h3>
                    <Separator />
                    
                    {currentClient.tagIds && currentClient.tagIds.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {currentClient.tagIds.map((tagId, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1 text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tagId}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Sin etiquetas asignadas</p>
                    )}
                  </CardContent>
                </Card>

                {/* System Info */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-lg">Información del Sistema</h3>
                    <Separator />
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Creado: {formatDate(currentClient.createdAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Actualizado: {formatDate(currentClient.updatedAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground">ID: {currentClient.id}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground">Negocio ID: {currentClient.businessId}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="annexes">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-lg">Archivos Adjuntos & Documentos</h3>
                  <Separator />
                  
                  {currentClient.annexes && currentClient.annexes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {currentClient.annexes.map((annex, index) => (
                        <Card key={index} className="p-3 hover:bg-accent/50 cursor-pointer transition-colors">
                          <div className="flex items-center">
                            <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="font-medium truncate">{annex.name || 'Sin título'}</span>
                          </div>
                          {annex.media && (
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center">
                                <FileType className="h-4 w-4 mr-1 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground truncate">
                                  {annex.media.type}
                                </p>
                              </div>
                              {annex.media.url && (
                                <a 
                                  href={annex.media.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary flex items-center hover:underline"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Ver
                                </a>
                              )}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Sin documentos adjuntos</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-lg">Notas</h3>
                  <Separator />
                  
                  {currentClient.notes ? (
                    <div className="whitespace-pre-wrap rounded-md bg-muted/50 p-4">
                      {currentClient.notes}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Sin notas disponibles</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
