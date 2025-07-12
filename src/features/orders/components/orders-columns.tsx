import { DataTableColumnHeader } from '@/components/tables/data-table-column-header.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { ColumnDef, FilterFn } from '@tanstack/react-table'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { CreditCard, Banknote, ArrowRightLeft, Clock, CheckCircle, XCircle, CircleDollarSign } from 'lucide-react'
import { OrderWithDetails, PaymentMethod, OrderStatus } from '@/features/store/types'
import { OrderRowActions } from './orders-row-actions'

// Global filter function
export const globalFilterFn: FilterFn<OrderWithDetails> = (row, columnId, value) => {
  if (!value) return true
  
  const order = row.original
  const searchValue = String(value).toLowerCase()
  
  const matches = (
    order.id.toLowerCase().includes(searchValue) ||
    order.clientId.toLowerCase().includes(searchValue) ||
    (order.notes && order.notes.toLowerCase().includes(searchValue))
  )
  
  return Boolean(matches)
}

// Order status icons and colors
const getOrderStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-3 w-3" />
    case 'partial_paid':
      return <CircleDollarSign className="h-3 w-3" />
    case 'paid':
      return <CheckCircle className="h-3 w-3" />
    case 'cancelled':
      return <XCircle className="h-3 w-3" />
    default:
      return <Clock className="h-3 w-3" />
  }
}

const getOrderStatusVariant = (status: OrderStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'pending':
      return 'outline'
    case 'partial_paid':
      return 'secondary'
    case 'paid':
      return 'default'
    case 'cancelled':
      return 'destructive'
    default:
      return 'outline'
  }
}

const getOrderStatusLabel = (status: OrderStatus): string => {
  switch (status) {
    case 'pending':
      return 'Pendiente'
    case 'partial_paid':
      return 'Parcial'
    case 'paid':
      return 'Pagado'
    case 'cancelled':
      return 'Cancelado'
    default:
      return status
  }
}

// Payment method icons and colors
const getPaymentMethodIcon = (method: PaymentMethod) => {
  switch (method) {
    case 'cash':
      return <Banknote className="h-3 w-3" />
    case 'credit_card':
    case 'debit_card':
      return <CreditCard className="h-3 w-3" />
    default:
      return <Banknote className="h-3 w-3" />
  }
}

const getPaymentMethodVariant = (method: PaymentMethod): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (method) {
    case 'cash':
      return 'default'
    case 'credit_card':
      return 'secondary'
    case 'debit_card':
      return 'outline'
    default:
      return 'outline'
  }
}

const getPaymentMethodLabel = (method: PaymentMethod): string => {
  switch (method) {
    case 'cash':
      return 'Efectivo'
    case 'credit_card':
      return 'Tarjeta de Crédito'
    case 'debit_card':
      return 'Tarjeta de Débito'
    default:
      return method
  }
}

// Format currency
const formatCurrency = (amount: number, currency: string = 'MXN') => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export const createColumns = (onPayment?: (order: OrderWithDetails) => void, onEdit?: (order: OrderWithDetails) => void, onDelete?: (order: OrderWithDetails) => void): ColumnDef<OrderWithDetails>[] => [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID Orden' />
    ),
    cell: ({ row }) => {
      const id = row.getValue('id') as string
      const shortId = id.slice(-8).toUpperCase()
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="font-mono text-xs cursor-pointer">
                #{shortId}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-mono">{id}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    enableHiding: false,
    enableSorting: true,
  },

  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as OrderStatus
      
      return (
        <Badge variant={getOrderStatusVariant(status)} className="text-xs">
          {getOrderStatusIcon(status)}
          <span className="ml-1">{getOrderStatusLabel(status)}</span>
        </Badge>
      )
    },
    enableSorting: true,
    enableHiding: false,
  },

  {
    accessorKey: 'clientId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cliente' />
    ),
    cell: ({ row }) => {
      const clientId = row.getValue('clientId') as string
      const shortClientId = clientId.slice(-8).toUpperCase()
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="font-mono text-xs cursor-pointer">
                {shortClientId}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-mono">{clientId}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    enableSorting: true,
  },

  {
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total' />
    ),
    cell: ({ row }) => {
      const total = row.getValue('totalAmount') as { amount: number; currency: string }
      
      return (
        <div className="font-semibold text-lg text-blue-600">
          {formatCurrency(total.amount, total.currency)}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: false,
  },

  {
    accessorKey: 'paidAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pagado' />
    ),
    cell: ({ row }) => {
      const paid = row.getValue('paidAmount') as { amount: number; currency: string }
      const total = row.original.totalAmount
      const isFullyPaid = row.original.isFullyPaid
      
      return (
        <div className={`font-medium ${isFullyPaid ? 'text-green-600' : 'text-orange-600'}`}>
          {formatCurrency(paid.amount, paid.currency)}
          {paid.amount < total.amount && (
            <div className="text-xs text-muted-foreground">
              de {formatCurrency(total.amount, total.currency)}
            </div>
          )}
        </div>
      )
    },
    enableSorting: true,
  },

  {
    accessorKey: 'remainingAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pendiente' />
    ),
    cell: ({ row }) => {
      const remaining = row.getValue('remainingAmount') as { amount: number; currency: string }
      const isFullyPaid = row.original.isFullyPaid
      
      if (isFullyPaid) {
        return (
          <Badge variant="default" className="text-xs text-green-600">
            Completado
          </Badge>
        )
      }
      
      return (
        <div className="font-medium text-red-600">
          {formatCurrency(remaining.amount, remaining.currency)}
        </div>
      )
    },
    enableSorting: true,
  },

  {
    accessorKey: 'itemCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Artículos' />
    ),
    cell: ({ row }) => {
      const itemCount = row.getValue('itemCount') as number
      
      return (
        <Badge variant="outline" className="text-sm">
          {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
        </Badge>
      )
    },
    enableSorting: true,
  },

  {
    id: 'paymentMethods',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Métodos de Pago' />
    ),
    cell: ({ row }) => {
      const payments = row.original.payments
      
      if (payments.length === 0) {
        return <span className="text-muted-foreground text-sm">Sin pagos</span>
      }

      const uniqueMethods = Array.from(new Set(payments.map(p => p.method)))

      if (uniqueMethods.length === 1) {
        const method = uniqueMethods[0]
        return (
          <Badge variant={getPaymentMethodVariant(method)} className="text-xs">
            {getPaymentMethodIcon(method)}
            <span className="ml-1">{getPaymentMethodLabel(method)}</span>
          </Badge>
        )
      }

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex gap-1 cursor-pointer">
                {uniqueMethods.slice(0, 2).map((method) => (
                  <Badge key={method} variant={getPaymentMethodVariant(method)} className="text-xs p-1">
                    {getPaymentMethodIcon(method)}
                  </Badge>
                ))}
                {uniqueMethods.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{uniqueMethods.length - 2}
                  </Badge>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <Card className="border-0 shadow-none">
                <CardContent className="p-2 space-y-1">
                  {uniqueMethods.map((method) => {
                    const totalForMethod = payments
                      .filter(p => p.method === method)
                      .reduce((sum, p) => sum + p.amount.amount, 0)
                    
                    return (
                      <div key={method} className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          {getPaymentMethodIcon(method)}
                          <span>{getPaymentMethodLabel(method)}</span>
                        </div>
                        <span className="font-mono">
                          {formatCurrency(totalForMethod, payments[0]?.amount.currency || 'MXN')}
                        </span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    enableSorting: false,
  },

  {
    accessorKey: 'notes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Notas' />
    ),
    cell: ({ row }) => {
      const notes = row.original.notes
      if (!notes) return <span className='text-muted-foreground text-sm'>Sin notas</span>
      
      const truncatedNotes = notes.length > 30 ? `${notes.substring(0, 30)}...` : notes
      const needsTooltip = notes.length > 30
      
      const content = (
        <div className='text-sm italic'>{truncatedNotes}</div>
      )
      
      if (needsTooltip) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {content}
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs whitespace-pre-wrap">{notes}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }
      
      return content
    },
    enableSorting: false,
    enableHiding: true,
  },

  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha Creación' />
    ),
    cell: ({ row }) => {
      const createdAt = row.original.createdAt
      
      return (
        <div className="flex flex-col gap-1">
          <Badge variant='secondary' className='text-xs'>
            {format(parseISO(createdAt), 'dd/MM/yyyy', { locale: es })}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {format(parseISO(createdAt), 'HH:mm', { locale: es })}
          </span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: false,
  },

  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Última Actualización' />
    ),
    cell: ({ row }) => {
      const updatedAt = row.original.updatedAt
      
      return (
        <div className="flex flex-col gap-1">
          <Badge variant='outline' className='text-xs'>
            {format(parseISO(updatedAt), 'dd/MM/yyyy', { locale: es })}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {format(parseISO(updatedAt), 'HH:mm', { locale: es })}
          </span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },

  // Actions column
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      if (!onPayment) return null
      return <OrderRowActions row={row} onPayment={onPayment} onEdit={onEdit} onDelete={onDelete} />
    },
  },
]

export const columns = createColumns()