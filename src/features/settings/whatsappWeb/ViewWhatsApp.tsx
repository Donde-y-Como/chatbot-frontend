import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
    AlertCircle,
    CheckCircle2,
    Copy,
    ExternalLink,
    Loader2,
    MessageSquare,
    Phone,
    RefreshCw,
    Shield,
    Unlink,
    User
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useClientInfo } from "./useClientInfo";
import { useDisconnectWhatsApp } from "./useDisconnectWhatsApp";

export function ViewWhatsApp() {
    const { data: whatsappData, isLoading, error, refetch } = useClientInfo();
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const { disconnectWhatsApp } = useDisconnectWhatsApp();

    const handleCopyId = async () => {
        if (whatsappData?.data?.contactId) {
            await navigator.clipboard.writeText(whatsappData.data.contactId);
            toast("ID de contacto copiado al portapapeles");
        }
    };

    const handleDisconnect = async () => {
        setIsDisconnecting(true);
        try {
            await disconnectWhatsApp();
            toast("WhatsApp desconectado");
        } catch (error) {
            toast.error("Error al desconectar WhatsApp. Intenta nuevamente.");
        } finally {
            setIsDisconnecting(false);
        }
    };

    const handleRefresh = () => {
        refetch?.();
    };

    if (isLoading) {
        return (
            <Card className="w-full max-w-lg mx-auto">
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold">
                                Cargando información...
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Obteniendo detalles de tu cuenta de WhatsApp
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !whatsappData) {
        return (
            <Card className="w-full max-w-lg mx-auto">
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-red-800">
                                Error al cargar datos
                            </h3>
                            <p className="text-sm text-red-600 mt-1">
                                No se pudo obtener la información de WhatsApp
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleRefresh} variant="outline" size="sm">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reintentar
                            </Button>
                            <Button variant="ghost" size="sm">
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (whatsappData.status === "error") {
        return <>
        
        

        </>;
    }


    const { displayName, formattedNumber, profilePicUrl, contactId } = whatsappData.data;

    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader className="space-y-3">
                <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">
                            Cuenta de WhatsApp
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Información de la cuenta conectada
                        </p>
                    </div>
                </div>
            </CardHeader>

                <div className="space-y-6 py-4">
                    {/* Profile Section */}
                    <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <Avatar className="w-16 h-16 border-2 border-green-200">
                            <AvatarImage
                                src={profilePicUrl}
                                alt={`Foto de perfil de ${displayName}`}
                            />
                            <AvatarFallback className="bg-green-100 text-green-700 text-lg font-semibold">
                                {displayName?.charAt(0)?.toUpperCase() || <User className="w-6 h-6" />}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-lg font-semibold text-green-800 truncate">
                                    {displayName}
                                </h3>
                                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Conectado
                                </Badge>
                            </div>
                            <div className="flex items-center text-green-600">
                                <Phone className="w-4 h-4 mr-2" />
                                <span className="text-sm font-mono">
                                    {formattedNumber}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Account Details */}
                    <div className="space-y-4">
                        <h4 className="font-semibold flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Detalles de la cuenta
                        </h4>

                        <div className="grid gap-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Nombre de usuario
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {displayName}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Número de teléfono
                                    </p>
                                    <p className="text-sm text-gray-600 font-mono">
                                        {formattedNumber}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-700">
                                        ID de contacto
                                    </p>
                                    <p className="text-xs text-gray-500 font-mono truncate">
                                        {contactId}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleCopyId}
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Security & Privacy */}
                    <div className="space-y-3">
                        <h4 className="font-semibold flex items-center">
                            <Shield className="w-4 h-4 mr-2" />
                            Seguridad y privacidad
                        </h4>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                                <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                                <div className="text-xs text-blue-800">
                                    <p className="font-medium mb-1">Conexión segura activa</p>
                                    <p>Accede únicamente a los mensajes necesarios para brindarte asistencia. Tus conversaciones están protegidas.</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-muted-foreground space-y-1">
                            <p>• Puedes desconectar esta cuenta en cualquier momento</p>
                            <p>• También puedes gestionar la conexión desde WhatsApp Web</p>
                            <p>• Los datos se procesan de forma segura y privada</p>
                        </div>
                    </div>
                </div>

                <CardFooter className="flex flex-col sm:flex-row gap-2">
                    <div className="flex flex-1 gap-2">
                        <Button
                            onClick={handleRefresh}
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Actualizar
                        </Button>

                        <Button
                            onClick={() => window.open('https://web.whatsapp.com', '_blank')}
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            WhatsApp Web
                        </Button>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="flex-1 sm:flex-none"
                                    disabled={isDisconnecting}
                                >
                                    <Unlink className="w-4 h-4 mr-2" />
                                    Desconectar
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        ¿Desconectar WhatsApp?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Perderás acceso a tus conversaciones de WhatsApp.
                                        Podrás reconectar en cualquier momento.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDisconnect}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        {isDisconnecting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Desconectando...
                                            </>
                                        ) : (
                                            'Desconectar'
                                        )}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                            Cerrar
                        </Button>
                    </div>
                </CardFooter>
            </Card>
    );
}