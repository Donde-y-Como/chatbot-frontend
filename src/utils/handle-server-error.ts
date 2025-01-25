import { AxiosError } from 'axios'
import { toast } from '@/hooks/use-toast'

export function handleServerError(error: unknown) {
  // eslint-disable-next-line no-console
  console.log(error)

  let errMsg = 'Algo salio mal'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'Contenido no encontrado'
  }

  if (error instanceof AxiosError) {
    errMsg = error.response?.data.title
  }

  toast({ variant: 'destructive', title: errMsg })
}
