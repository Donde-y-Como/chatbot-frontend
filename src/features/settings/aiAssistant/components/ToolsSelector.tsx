import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import {
  AVAILABLE_TOOLS,
  AvailableToolId,
} from '@/features/settings/aiAssistant/available-tools.ts'

type Props = {
  value: AvailableToolId[]
  onChange: (ids: AvailableToolId[]) => void
}

const tools = AVAILABLE_TOOLS

export function ToolsSelector({ value, onChange }: Props) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return tools.filter((t) =>
      `${t.title} ${t.description}`.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const toggle = (id: AvailableToolId) => {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    )
  }

  const visibleIds = filtered.map((t) => t.id)

  const allSelected =
    visibleIds.length > 0 && visibleIds.every((id) => value.includes(id))

  const someSelected =
    visibleIds.some((id) => value.includes(id)) && !allSelected

  const toggleAll = () => {
    if (allSelected) {
      onChange(value.filter((id) => !visibleIds.includes(id)))
    } else {
      const merged = new Set([...value, ...visibleIds])
      onChange(Array.from(merged))
    }
  }

  return (
    <div className='space-y-3'>
      <Input
        placeholder='Buscar herramienta…'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className='flex items-center justify-between px-1'>
        <label className='flex items-center gap-2 text-sm font-medium'>
          <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
          Seleccionar todas
        </label>

        <span className='text-xs text-muted-foreground'>
          {value.length} seleccionadas
        </span>
      </div>

      <div className='max-h-[420px] overflow-y-auto rounded-md border p-2 space-y-1'>
        {filtered.map((tool) => (
          <Collapsible key={tool.id}>
            <div className='flex items-start gap-3 rounded-md px-2 py-2 hover:bg-muted'>
              <Checkbox
                checked={value.includes(tool.id)}
                onCheckedChange={() => toggle(tool.id)}
              />

              <div className='flex-1'>
                <CollapsibleTrigger className='flex w-full items-center justify-between text-left'>
                  <span className='font-medium text-sm'>{tool.title}</span>
                  <ChevronDown className='h-4 w-4 opacity-50' />
                </CollapsibleTrigger>

                <CollapsibleContent className='pt-2 text-xs text-muted-foreground leading-relaxed'>
                  {tool.description}
                </CollapsibleContent>
              </div>
            </div>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}
