import * as React from 'react'
import { Check, ChevronsUpDown, Plus, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Tag } from '@/features/settings/tags/types'
import { useGetTags, useCreateTag } from '@/features/settings/tags/hooks/useTags'
import { TagDialog } from '@/features/settings/tags/components/tag-dialog'

interface TagSelectorProps {
  selectedTagIds: string[]
  onTagChange: (tagIds: string[]) => void
  className?: string
}

export function TagSelector({
  selectedTagIds,
  onTagChange,
  className
}: TagSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')
  const { data: tags = [], isLoading: loading } = useGetTags()
  const createTagMutation = useCreateTag()

  // Obtener etiquetas seleccionadas
  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id))

  // Filtrar etiquetas disponibles
  const filteredTags = tags.filter(tag =>
    searchValue === '' || 
    tag.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  // Manejar selección de etiqueta
  const handleTagSelect = (tagId: string) => {
    const newTagIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId]
    
    onTagChange(newTagIds)
  }

  // Remover etiqueta seleccionada
  const removeTag = (tagId: string) => {
    onTagChange(selectedTagIds.filter(id => id !== tagId))
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Etiquetas seleccionadas */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Etiquetas seleccionadas:</p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge 
                key={tag.id} 
                variant="secondary" 
                className="gap-1"
                style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeTag(tag.id)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Selector de etiquetas */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            Seleccionar etiquetas...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Buscar etiquetas..."
                value={searchValue}
                onValueChange={setSearchValue}
              />
            </div>
            <CommandList>
              <CommandEmpty>
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    No se encontraron etiquetas
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCreateDialogOpen(true)
                      setOpen(false)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Crear nueva etiqueta
                  </Button>
                </div>
              </CommandEmpty>
              
              {/* Lista de etiquetas */}
              <CommandGroup heading="Etiquetas disponibles">
                {filteredTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id)
                  
                  return (
                    <CommandItem
                      key={tag.id}
                      value={tag.id}
                      onSelect={() => handleTagSelect(tag.id)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex items-center flex-1 gap-2">
                        <div
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: tag.color }}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{tag.name}</div>
                          {tag.description && (
                            <div className="text-xs text-muted-foreground">
                              {tag.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              
              {/* Botón para crear nueva etiqueta */}
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setCreateDialogOpen(true)
                    setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear nueva etiqueta
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Dialog para crear nueva etiqueta */}
      <TagDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={async (values) => {
          await createTagMutation.mutateAsync(values)
        }}
        isSubmitting={createTagMutation.isPending}
        title="Crear nueva etiqueta"
        submitLabel="Crear etiqueta"
        mode="create-complete"
      />
    </div>
  )
}
