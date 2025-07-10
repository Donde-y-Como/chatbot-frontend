import { DataTableColumnHeader } from '@/components/tables/data-table-column-header.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { ColumnDef, FilterFn } from '@tanstack/react-table'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { CreditCard, Banknote, ArrowRightLeft, FileText } from 'lucide-react'
import { Sale, PaymentMethod } from '../types'

// Global filter function
export const globalFilterFn: FilterFn<Sale> = (row, columnId, value) => {
  if (!value) return true
  
  const sale = row.original
  const searchValue = String(value).toLowerCase()
  
  const matches = (
    sale.id.toLowerCase().includes(searchValue) ||
    sale.clientId.toLowerCase().includes(searchValue) ||
    (sale.notes && sale.notes.toLowerCase().includes(searchValue))
  )
  
  return Boolean(matches)
}

// Payment method icons and colors
const getPaymentMethodIcon = (method: PaymentMethod) => {
  switch (method) {
    case PaymentMethod.EFECTIVO:
      return <Banknote className="h-3 w-3" />
    case PaymentMethod.TARJETA:
      return <CreditCard className="h-3 w-3" />
    case PaymentMethod.TRANSFERENCIA:
      return <ArrowRightLeft className="h-3 w-3" />
    case PaymentMethod.CHEQUE:
      return <FileText className="h-3 w-3" />
    default:
      return <Banknote className="h-3 w-3" />
  }
}

const getPaymentMethodVariant = (method: PaymentMethod): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (method) {
    case PaymentMethod.EFECTIVO:
      return 'default'
    case PaymentMethod.TARJETA:
      return 'secondary'
    case PaymentMethod.TRANSFERENCIA:
      return 'outline'
    case PaymentMethod.CHEQUE:
      return 'destructive'
    default:
      return 'outline'
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

export const createColumns = (): ColumnDef<Sale>[] => [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID Venta' />
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
        <div className="font-semibold text-lg text-green-600">
          {formatCurrency(total.amount, total.currency)}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: false,
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
      const paymentSummary = row.original.paymentSummary
      const methods = Object.entries(paymentSummary).filter(([_, amount]) => amount && amount.amount > 0)
      
      if (methods.length === 0) {
        return <span className="text-muted-foreground text-sm">Sin pagos</span>
      }

      if (methods.length === 1) {
        const [method, amount] = methods[0]
        return (
          <Badge variant={getPaymentMethodVariant(method as PaymentMethod)} className="text-xs">
            {getPaymentMethodIcon(method as PaymentMethod)}
            <span className="ml-1">{method}</span>
          </Badge>
        )
      }

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex gap-1 cursor-pointer">
                {methods.slice(0, 2).map(([method]) => (
                  <Badge key={method} variant={getPaymentMethodVariant(method as PaymentMethod)} className="text-xs p-1">
                    {getPaymentMethodIcon(method as PaymentMethod)}
                  </Badge>
                ))}
                {methods.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{methods.length - 2}
                  </Badge>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <Card className="border-0 shadow-none">
                <CardContent className="p-2 space-y-1">
                  {methods.map(([method, amount]) => (
                    <div key={method} className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        {getPaymentMethodIcon(method as PaymentMethod)}
                        <span>{method}</span>
                      </div>
                      <span className="font-mono">
                        {amount && formatCurrency(amount.amount, amount.currency)}
                      </span>
                    </div>
                  ))}
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
      <DataTableColumnHeader column={column} title='Fecha' />
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
]

export const columns = createColumns()
