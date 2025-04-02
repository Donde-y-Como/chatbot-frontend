import { Card, CardContent } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Login() {
  return (
    <AuthLayout>
      <Card className='p-6'>
        <div className='flex flex-col space-y-2 text-left mb-4'>
          <h1 className='text-2xl font-semibold tracking-tight'>Iniciar sesión</h1>
          <p className='text-sm text-muted-foreground'>Elige tu método de inicio de sesión preferido</p>
        </div>
        
        <Tabs defaultValue='email-password' className='w-full'>
          <TabsList className='grid w-full grid-cols-2 mb-4'>
            <TabsTrigger value='email-password'>Correo y contraseña</TabsTrigger>
            <TabsTrigger value='email-only'>Solo correo</TabsTrigger>
          </TabsList>
          
          <TabsContent value='email-password'>
            <CardContent className='px-0 pt-0'>
              <p className='text-sm text-muted-foreground mb-4'>Ingresa tu correo electrónico y contraseña a continuación</p>
              <UserAuthForm />
            </CardContent>
          </TabsContent>
          
          <TabsContent value='email-only'>
            <CardContent className='px-0 pt-0'>
              <p className='text-sm text-muted-foreground mb-4'>Ingresa tu correo para recibir un enlace de acceso</p>
              <UserAuthForm emailOnly={true} />
            </CardContent>
          </TabsContent>
        </Tabs>
        
        <p className='mt-4 px-8 text-center text-sm text-muted-foreground'>
          Al hacer clic en iniciar sesión, aceptas nuestros{' '}
          <a
            href='/terms'
            className='underline underline-offset-4 hover:text-primary'
          >
            Términos de Servicio
          </a>{' '}
          y nuestra{' '}
          <a
            href='/privacy'
            className='underline underline-offset-4 hover:text-primary'
          >
            Política de Privacidad
          </a>
          .
        </p>
      </Card>
    </AuthLayout>
  )
}