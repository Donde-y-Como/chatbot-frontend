import { Link } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { BusinessRegisterForm } from './components/business-register-form'

export default function BusinessRegister() {
  return (
    <AuthLayout>
      <Card className='p-6'>
        <div className='mb-2 flex flex-col space-y-2 text-left'>
          <h1 className='text-lg font-semibold tracking-tight'>
            Registrar negocio
          </h1>
          <p className='text-sm text-muted-foreground'>
            Ingresa los datos de tu negocio para comenzar. <br />
            ¿Ya tienes una cuenta?{' '}
            <Link
              to='/iniciar-sesion'
              className='underline underline-offset-4 hover:text-primary'
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
        <BusinessRegisterForm />
        <p className='mt-4 px-8 text-center text-sm text-muted-foreground'>
          Al registrar tu negocio, aceptas nuestros{' '}
          <a
            href='/terms'
            className='underline underline-offset-4 hover:text-primary'
          >
            Términos de Servicio
          </a>{' '}
          y{' '}
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
