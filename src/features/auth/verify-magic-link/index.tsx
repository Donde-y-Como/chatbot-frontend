import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "@tanstack/react-router"
import { toast } from "sonner"
import { CheckCircle, Loader2, RefreshCcw, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/stores/authStore"
import { authService } from "../AuthService"
import AuthLayout from "../auth-layout"

export function VerifyMagicLinkPage() {
  const [verificationState, setVerificationState] = useState<"loading" | "success" | "error">("loading")
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState("El enlace de inicio de sesión es inválido o ha expirado")
  const [isRetrying, setIsRetrying] = useState(false)

  const { setAccessToken, setUser } = useAuthStore((state) => state.auth)
  const navigate = useNavigate()
  const params = useParams({
    from: "/(auth)/link-iniciar-sesion/$token",
  })

  const verifyToken = useCallback(async (token: string) => {
    try {
      setVerificationState("loading")
      setProgress(25)

      if (!token) {
        throw new Error("Token no válido")
      }

      setProgress(50)

      const response = await authService.verifyLoginLink(token)
      setAccessToken(response.token)
      setProgress(75)

      try {
        const userData = await authService.getMe()
        setUser(userData)
      } catch (userError) {
        console.warn("Error al obtener los datos del usuario")
      }

      setProgress(100)
      setVerificationState("success")
      toast.success("Inicio de sesión exitoso")


      navigate({ to: "/" })
      toast.dismiss()
    } catch (err) {
      const errorMsg = "El enlace de inicio de sesión es inválido o ha expirado"
      setErrorMessage(errorMsg)
      setVerificationState("error")
      toast.error(errorMsg)
    } finally {
      setIsRetrying(false)
    }
  }, [navigate, setAccessToken, setUser])

  const handleRetry = () => {
    setIsRetrying(true)
    const token = params.token
    if (token) {
      verifyToken(token)
    } else {
      setErrorMessage("No se encontró un token válido")
      setVerificationState("error")
      setIsRetrying(false)
    }
  }

  useEffect(() => {
    const token = params.token
    if (token) {
      verifyToken(token)
    } else {
      setErrorMessage("No se encontró un token válido")
      setVerificationState("error")
    }
  }, [params.token, verifyToken])

  return (
    <AuthLayout>
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {verificationState === "loading" && "Verificando acceso"}
            {verificationState === "success" && "¡Verificación exitosa!"}
            {verificationState === "error" && "Error de verificación"}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center space-y-6 pt-4 pb-6">
          {verificationState === "loading" && (
            <>
              <div className="relative w-20 h-20 flex items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium">{progress}%</span>
                </div>
              </div>

              <div className="w-full space-y-4">
                <Progress value={progress} className="w-full" />

                <div className="space-y-2 w-full">
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${progress >= 25 ? "bg-primary" : "bg-muted"}`} />
                    <Skeleton className={`h-4 flex-1 ${progress >= 25 ? "bg-primary/20" : "bg-muted"}`} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${progress >= 50 ? "bg-primary" : "bg-muted"}`} />
                    <Skeleton className={`h-4 flex-1 ${progress >= 50 ? "bg-primary/20" : "bg-muted"}`} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${progress >= 75 ? "bg-primary" : "bg-muted"}`} />
                    <Skeleton className={`h-4 flex-1 ${progress >= 75 ? "bg-primary/20" : "bg-muted"}`} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${progress >= 100 ? "bg-primary" : "bg-muted"}`} />
                    <Skeleton className={`h-4 flex-1 ${progress >= 100 ? "bg-primary/20" : "bg-muted"}`} />
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground text-center">
                Por favor espera mientras verificamos tu enlace de acceso
              </p>
            </>
          )}

          {verificationState === "success" && (
            <>
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>

              <Alert className="bg-green-50 border-green-200">
                <AlertTitle>¡Inicio de sesión exitoso!</AlertTitle>
                <AlertDescription>
                  Has iniciado sesión correctamente. Serás redirigido automáticamente en unos segundos.
                </AlertDescription>
              </Alert>
            </>
          )}

          {verificationState === "error" && (
            <>
              <div className="rounded-full bg-red-100 p-3">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>

              <Alert variant="destructive">
                <AlertTitle>Error de verificación</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          {verificationState === "success" && (
            <Button onClick={() => navigate({ to: "/" })} className="w-full">
              Ir a la página principal
            </Button>
          )}

          {verificationState === "error" && (
            <>
              <Button onClick={handleRetry} variant="outline" className="w-full" disabled={isRetrying}>
                {isRetrying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reintentando...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Reintentar verificación
                  </>
                )}
              </Button>

              <Button onClick={() => navigate({ to: "/iniciar-sesion" })} variant="secondary" className="w-full">
                Volver a iniciar sesión
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}

export default VerifyMagicLinkPage

