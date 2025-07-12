import { Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, DollarSign, Eye, Copy } from 'lucide-react'
import { OrderWithDetails } from '@/features/store/types'

interface OrderRowActionsProps {
  row: Row<OrderWithDetails>
  onPayment: (order: OrderWithDetails) => void
}

export function OrderRowActions({ row, onPayment }: OrderRowActionsProps) {
  const order = row.original

  const canReceivePayment = order.status === 'pending' || order.status === 'partial_paid'

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => handleCopyId()}>
          <Copy className="mr-2 h-4 w-4" />
          Copiar ID
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Eye className="mr-2 h-4 w-4" />
          Ver detalles
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {canReceivePayment && (
          <DropdownMenuItem
            onClick={() => onPayment(order)}
            className="text-green-600 focus:text-green-600"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Cobrar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}