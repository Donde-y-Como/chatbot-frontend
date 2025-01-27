import { IconSearch } from '@tabler/icons-react'

interface ChatSearchInputProps {
  value: string
  onChange: (value: string) => void
}

export function ChatSearchInput({ value, onChange }: ChatSearchInputProps) {
  return (
    <label className='flex h-12 w-full items-center space-x-0 rounded-md border border-input pl-2 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring'>
      <IconSearch size={15} className='mr-2 stroke-slate-500' />
      <input
        type='search'
        className='w-full flex-1 bg-inherit text-sm focus-visible:outline-none'
        placeholder='Buscar conversación...'
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}