import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/api/axiosInstance.ts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { UserQueryKey } from '@/components/layout/hooks/useGetUser.ts'
import { WHATSAPP_QUERY_KEY } from '@/features/settings/whatsappWeb/useWhatsAppData.ts'

export function CreateWhatsAppInstance() {
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const queryClient = useQueryClient()
  const createWhatsAppInstance = useMutation({
    mutationFn: async (phoneNumber: string) => {
      await api.post<{ qrCode: string }>('whatsapp-web/create', { phoneNumber })
    },
    onSuccess: async () => {
      toast.error('Numero de WhatsApp vinculado ahora escanea el QR')
      void queryClient.invalidateQueries({
        queryKey: UserQueryKey,
      })
      void queryClient.invalidateQueries({
        queryKey: WHATSAPP_QUERY_KEY,
      })
    },
    onError: async () => {
      toast.error('Ingresa un número de teléfono válido')
    },
  })

  const handleSubmit = async () => {
    if (!phoneNumber) {
      toast.error('Ingresa un número de teléfono válido')
    }

    if (phoneNumber.includes('521')) {
      await createWhatsAppInstance.mutateAsync(phoneNumber)
    } else {
      toast.error(
        'El número debe incluir el código de país (ejemplo: 521 para México) '
      )
      return
    }
  }

  return (
    <Card className='w-full max-w-lg mx-auto'>
      <CardHeader className='space-y-3'>
        <div className='flex items-center space-x-2'>
          <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
            <MessageSquare className='w-5 h-5 text-green-600' />
          </div>
          <div>
            <h2 className='text-xl font-semibold'>Conecta tu WhatsApp</h2>
            <p className='text-sm text-muted-foreground'></p>
          </div>
        </div>
      </CardHeader>

      <CardContent className='py-2'>
        <Label> Numero de telefono + Codigo de pais (521 para Mexico)</Label>
        <Input
          type='text'
          placeholder={'521 9512000452'}
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </CardContent>

      <CardFooter className='flex-col sm:flex-row gap-2'>
        <Button
          onClick={handleSubmit}
          variant='default'
          disabled={!phoneNumber || createWhatsAppInstance.isPending}
          size='sm'
          className='cursor-pointer text-xs'
        >
          <RefreshCw className='w-3 h-3 mr-1' />
          Crear Codigo QR
        </Button>
      </CardFooter>
    </Card>
  )
}
