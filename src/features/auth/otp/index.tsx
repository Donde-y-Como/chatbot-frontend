import { Link } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { OtpForm } from './components/otp-form'

export default function Otp() {
  return (
    <AuthLayout>
      <Card className='p-6'>
        <div className='mb-2 flex flex-col space-y-2 text-left'>
          <h1 className='text-md font-semibold tracking-tight'>
            Verificación de cuenta
          </h1>
          <p className='text-sm text-muted-foreground'>
            Por favor, ingrese el código de autenticación. <br /> Hemos enviado el
            código de autenticación a su correo electrónico.
          </p>
        </div>
        <OtpForm />
        <p className='mt-4 px-8 text-center text-sm text-muted-foreground'>
          ¿No has recibido el código?{' '}
          <Link
            to='/iniciar-sesion'
            className='underline underline-offset-4 hover:text-primary'
          >
            Reenviar un nuevo código.
          </Link>
          .
        </p>
      </Card>
    </AuthLayout>
  )
}
