import { useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Check, Plus, Search, Tag, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useGetProductTags } from '@/features/products/hooks/useGetAuxiliaryData'

interface TagSelectorProps {
  title?: string
  description?: string
  helperText?: string
}

export function TagSelector({
  title = 'Etiquetas',
  description = 'Seleccionar etiquetas para organizar',
  helperText = 'Las etiquetas te ayudan a organizar y filtrar tus elementos. Puedes seleccionar múltiples etiquetas haciendo clic en ellas.',
}: TagSelectorProps) {
  const { control } = useFormContext()
  const { data: tags = [] } = useGetProductTags()
  const [searchQuery, setSearchQuery] = useState('')

  // Filter tags based on search query
  const filteredTags = useMemo(() => {
    return tags.filter((tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [tags, searchQuery])

  // Don't render if no tags exist
  if (tags.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Tag className='h-5 w-5' />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <FormField
          control={control}
          name='tagIds'
          render={({ field }) => {
            const selectedTagIds = field.value || []
            const selectedTags = tags.filter((tag) =>
              selectedTagIds.includes(tag.id)
            )
            const availableTags = filteredTags.filter(
              (tag) => !selectedTagIds.includes(tag.id)
            )

            const handleTagToggle = (tagId: string) => {
              const currentValue = field.value || []
              if (currentValue.includes(tagId)) {
                field.onChange(currentValue.filter((id) => id !== tagId))
              } else {
                field.onChange([...currentValue, tagId])
              }
            }

            const handleSelectAll = () => {
              field.onChange(tags.map((tag) => tag.id))
            }

            const handleClearAll = () => {
              field.onChange([])
            }

            return (
              <FormItem className='space-y-4'>
                <FormLabel className='text-base font-medium'>
                  {description}
                </FormLabel>

                {/* Selected Tags Section */}
                {selectedTags.length > 0 && (
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h4 className='text-sm font-medium text-muted-foreground'>
                        Etiquetas seleccionadas ({selectedTags.length})
                      </h4>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={handleClearAll}
                        className='h-auto p-1 text-xs text-muted-foreground hover:text-foreground'
                      >
                        Limpiar todo
                      </Button>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {selectedTags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant='default'
                          className='cursor-pointer  group relative pr-6 transition-all hover:scale-105'
                          onClick={() => handleTagToggle(tag.id)}
                        >
                          <Check className='h-3 w-3 mr-1' />
                          {tag.name}
                          <button
                            type='button'
                            className='absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-white/20 transition-colors'
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTagToggle(tag.id)
                            }}
                          >
                            <X className='h-2.5 w-2.5' />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search and Controls */}
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <div className='relative flex-1'>
                      <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                      <Input
                        placeholder='Buscar etiquetas...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='pl-9'
                      />
                    </div>
                    {availableTags.length > 0 && (
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={handleSelectAll}
                        className='shrink-0'
                      >
                        <Plus className='h-4 w-4 mr-1' />
                        Todo
                      </Button>
                    )}
                  </div>

                  {/* Available Tags Count */}
                  <div className='text-xs text-muted-foreground'>
                    {searchQuery ? (
                      <>
                        Mostrando {availableTags.length} de {tags.length}{' '}
                        etiquetas
                      </>
                    ) : (
                      <>{availableTags.length} etiquetas disponibles</>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Available Tags Grid */}
                <div className='space-y-3'>
                  {availableTags.length > 0 ? (
                    <>
                      <h4 className='text-sm font-medium text-muted-foreground'>
                        Etiquetas disponibles
                      </h4>
                      <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
                        {availableTags.map((tag) => (
                          <button
                            key={tag.id}
                            type='button'
                            className='group relative flex items-center gap-2 p-3 rounded-lg border border-border hover:border-ring hover:bg-accent/50 transition-all duration-200 text-left'
                            onClick={() => handleTagToggle(tag.id)}
                          >
                            <div
                              className='w-3 h-3 rounded-full border-2 border-current shrink-0'
                              style={{ color: '#6366f1' }}
                            />
                            <span
                              className='text-sm font-medium truncate'
                              title={tag.name}
                            >
                              {tag.name}
                            </span>
                            <Plus className='h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground' />
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className='text-center py-8 text-muted-foreground'>
                      {searchQuery ? (
                        <div className='space-y-2'>
                          <Search className='h-8 w-8 mx-auto opacity-50' />
                          <p className='text-sm'>
                            No se encontraron etiquetas para "{searchQuery}"
                          </p>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => setSearchQuery('')}
                            className='text-xs'
                          >
                            Limpiar búsqueda
                          </Button>
                        </div>
                      ) : (
                        <div className='space-y-2'>
                          <Tag className='h-8 w-8 mx-auto opacity-50' />
                          <p className='text-sm'>
                            Todas las etiquetas están seleccionadas
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Helper Text */}
                <div className='text-xs text-muted-foreground bg-muted/30 rounded-lg p-3'>
                  <p>
                    💡 <strong>Consejo:</strong> {helperText}
                  </p>
                </div>

                <FormMessage />
              </FormItem>
            )
          }}
        />
      </CardContent>
    </Card>
  )
}
