import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export default function UnauthorisedError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] font-bold leading-tight'>401</h1>
        <span className='font-medium'>Acceso Denegado</span>
        <p className='text-center text-muted-foreground'>
          Por favor, inicie sesión con las credenciales apropiadas <br /> para acceder a este
          recurso.
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            Regresar
          </Button>
          <Button onClick={() => navigate({ to: '/' })}>Ir a Inicio</Button>
        </div>
      </div>
    </div>
  )
}
