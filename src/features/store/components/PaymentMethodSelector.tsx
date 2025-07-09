import { IconCash, IconCreditCard } from '@tabler/icons-react'
import { cn } from '@/lib/utils.ts'
import { Card } from '@/components/ui/card.tsx'
import { PaymentMethod } from '@/features/store/types.ts'

interface PaymentMethodSelectorProps {
  onSelect: (method: PaymentMethod) => void
  selected: PaymentMethod
}

export function PaymentMethodSelector({
  onSelect,
  selected,
}: PaymentMethodSelectorProps) {
  return (
    <div className='flex w-full items-center gap-2'>
      <Card
        className={cn([
          selected === 'cash' && 'bg-primary text-primary-foreground',
          'grid place-items-center p-4 cursor-pointer w-full transition-all duration-200 hover:scale-105 hover:shadow-md',
        ])}
        onClick={() => onSelect('cash')}
      >
        <IconCash className="transition-transform duration-200" />
        <p className="transition-colors duration-200">Efectivo</p>
      </Card>
      <Card
        className={cn([
          selected === 'debit_card' && 'bg-primary text-primary-foreground',
          'grid place-items-center p-4 cursor-pointer w-full transition-all duration-200 hover:scale-105 hover:shadow-md',
        ])}
        onClick={() => onSelect('debit_card')}
      >
        <IconCreditCard className="transition-transform duration-200" />
        <p className="transition-colors duration-200">Debito</p>
      </Card>
      <Card
        className={cn([
          selected === 'credit_card' && 'bg-primary text-primary-foreground',
          'grid place-items-center p-4 cursor-pointer w-full transition-all duration-200 hover:scale-105 hover:shadow-md',
        ])}
        onClick={() => onSelect('credit_card')}
      >
        <IconCreditCard className="transition-transform duration-200" />
        <p className="transition-colors duration-200">Credito</p>
      </Card>
    </div>
  )
}
