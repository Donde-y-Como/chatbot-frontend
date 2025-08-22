import React, { useState } from 'react'
import { AlertCircle, Info, Package, Plus, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator.tsx'
import { SidebarTrigger } from '@/components/ui/sidebar.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Main } from '@/components/layout/main.tsx'
import { ConsumableTable } from './components/ConsumableTable'
import { EquipmentTable } from './components/EquipmentTable'
import { ConsumableEditDialog } from './components/consumable/ConsumableEditDialog'
import { ConsumableViewDialog } from './components/consumable/ConsumableViewDialog'
import { EquipmentEditDialog } from './components/equipment/EquipmentEditDialog'
import { EquipmentViewDialog } from './components/equipment/EquipmentViewDialog'
import { useConsumables } from './hooks/useConsumables'
import { useEquipment } from './hooks/useEquipment'
import {
  Consumable,
  CreateConsumableData,
  CreateEquipmentData,
  Equipment,
  EquipmentStatus,
  TabType,
  UpdateConsumableData,
  UpdateEquipmentData,
} from './types'

export default function Tools() {
  const [activeTab, setActiveTab] = useState<TabType>('equipment')

  // Equipment dialogs
  const [showEquipmentForm, setShowEquipmentForm] = useState(false)
  const [showEquipmentView, setShowEquipmentView] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null
  )
  const [viewingEquipment, setViewingEquipment] = useState<Equipment | null>(
    null
  )

  // Consumable dialogs
  const [showConsumableForm, setShowConsumableForm] = useState(false)
  const [showConsumableView, setShowConsumableView] = useState(false)
  const [editingConsumable, setEditingConsumable] = useState<Consumable | null>(
    null
  )
  const [viewingConsumable, setViewingConsumable] = useState<Consumable | null>(
    null
  )

  const {
    equipment,
    loading: equipmentLoading,
    error: equipmentError,
    createEquipment,
    updateEquipment,
    deleteEquipment,
  } = useEquipment()

  const {
    consumables,
    loading: consumablesLoading,
    error: consumablesError,
    createConsumable,
    updateConsumable,
    deleteConsumable,
  } = useConsumables()

  // Equipment handlers
  const handleCreateEquipment = async (data: CreateEquipmentData) => {
    const result = await createEquipment(data)
    if (result) {
      setShowEquipmentForm(false)
      toast.success(`${data.name} ha sido creado exitosamente.`)
    }
  }

  const handleUpdateEquipment = async (
    equipment: Equipment,
    data: UpdateEquipmentData
  ) => {
    const result = await updateEquipment(equipment.id, data)
    if (result) {
      setEditingEquipment(null)
      toast.success('Los cambios han sido guardados exitosamente.')
    }
  }

  const handleDeleteEquipment = async (id: string) => {
    const equipmentToDelete = equipment.find((e) => e.id === id)
    const success = await deleteEquipment(id)
    if (success && equipmentToDelete) {
      toast.success(`${equipmentToDelete.name} ha sido eliminado.`)
    }
  }

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment)
  }

  const handleViewEquipment = (equipment: Equipment) => {
    setViewingEquipment(equipment)
    setShowEquipmentView(true)
  }

  // Consumable handlers
  const handleCreateConsumable = async (data: CreateConsumableData) => {
    const result = await createConsumable(data)
    if (result) {
      setShowConsumableForm(false)
      toast.success(`${data.name} ha sido creado exitosamente.`)
    }
  }

  const handleUpdateConsumable = async (
    consumable: Consumable,
    data: UpdateConsumableData
  ) => {
    const result = await updateConsumable(consumable.id, data)
    if (result) {
      setEditingConsumable(null)
      toast.success('Los cambios han sido guardados exitosamente.')
    }
  }

  const handleDeleteConsumable = async (id: string) => {
    const consumableToDelete = consumables.find((c) => c.id === id)
    const success = await deleteConsumable(id)
    if (success && consumableToDelete) {
      toast.success(`${consumableToDelete.name} ha sido eliminado.`)
    }
  }

  const handleEditConsumable = (consumable: Consumable) => {
    setEditingConsumable(consumable)
  }

  const handleViewConsumable = (consumable: Consumable) => {
    setViewingConsumable(consumable)
    setShowConsumableView(true)
  }

  // Get stats
  const lowStockConsumables = consumables.filter(
    (c) => c.stock < 10 && c.stock > 0
  )
  const outOfStockConsumables = consumables.filter((c) => c.stock === 0)
  const inUseEquipment = equipment.filter(
    (e) => e.status === EquipmentStatus.IN_USE
  )
  const activeEquipment = equipment.filter(
    (e) => e.status === EquipmentStatus.ACTIVE
  )

  const renderStatsCards = () => (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center'>
            <Settings className='h-8 w-8 text-blue-600' />
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Total Equipos</p>
              <p className='text-2xl font-bold'>{equipment.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center'>
            <Package className='h-8 w-8 text-green-600' />
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Total Consumibles
              </p>
              <p className='text-2xl font-bold'>{consumables.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center'>
            <AlertCircle className='h-8 w-8 text-yellow-600' />
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Stock Bajo</p>
              <p className='text-2xl font-bold'>{lowStockConsumables.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center'>
            <AlertCircle className='h-8 w-8 text-red-600' />
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Sin Stock</p>
              <p className='text-2xl font-bold'>
                {outOfStockConsumables.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAlerts = () => (
    <div className='space-y-4 mb-6'>
      {outOfStockConsumables.length > 0 && (
        <Alert className='border-red-200 bg-red-50'>
          <AlertCircle className='h-4 w-4 text-red-600' />
          <AlertDescription className='text-red-800'>
            <strong>
              {outOfStockConsumables.length} consumibles sin stock:
            </strong>{' '}
            {outOfStockConsumables
              .slice(0, 3)
              .map((c) => c.name)
              .join(', ')}
            {outOfStockConsumables.length > 3 &&
              ` y ${outOfStockConsumables.length - 3} más`}
          </AlertDescription>
        </Alert>
      )}

      {lowStockConsumables.length > 0 && (
        <Alert className='border-yellow-200 bg-yellow-50'>
          <AlertCircle className='h-4 w-4 text-yellow-600' />
          <AlertDescription className='text-yellow-800'>
            <strong>
              {lowStockConsumables.length} consumibles con stock bajo:
            </strong>{' '}
            {lowStockConsumables
              .slice(0, 3)
              .map((c) => c.name)
              .join(', ')}
            {lowStockConsumables.length > 3 &&
              ` y ${lowStockConsumables.length - 3} más`}
          </AlertDescription>
        </Alert>
      )}

      {inUseEquipment.length > 0 && (
        <Alert className='border-blue-200 bg-blue-50'>
          <Info className='h-4 w-4 text-blue-600' />
          <AlertDescription className='text-blue-800'>
            <strong>{inUseEquipment.length} equipos en uso actualmente</strong>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )

  return (
    <Main>
      <section className='p-2'>
        <div className='mb-2 w-full flex sm:items-center flex-col sm:flex-row  sm:justify-between'>
          <div className='flex flex-col gap-2'>
            <div className='flex gap-2 items-center'>
              <SidebarTrigger variant='outline' className='' />
              <Separator orientation='vertical' className='h-7 ' />
              <h1 className='text-2xl font-bold'>Gestión de Herramientas</h1>
            </div>

            <p className='text-muted-foreground self-start mb-2 sm:mb-0'>
              Administra equipos, insumos y consumibles
            </p>
          </div>
        </div>
        <div className=' '>
          {renderStatsCards()}
          {renderAlerts()}

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TabType)}
          >
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
              <TabsList className='grid w-full sm:w-auto grid-cols-2'>
                <TabsTrigger
                  value='equipment'
                  className='flex items-center gap-2'
                >
                  <Settings size={16} />
                  Equipos o Insumos
                </TabsTrigger>
                <TabsTrigger
                  value='consumables'
                  className='flex items-center gap-2'
                >
                  <Package size={16} />
                  Consumibles
                </TabsTrigger>
              </TabsList>

              <div className='flex gap-2'>
                {activeTab === 'equipment' && (
                  <Button
                    onClick={() => setShowEquipmentForm(true)}
                    className='flex items-center gap-2'
                  >
                    <Plus size={16} />
                    Nuevo Equipo
                  </Button>
                )}
                {activeTab === 'consumables' && (
                  <Button
                    onClick={() => setShowConsumableForm(true)}
                    className='flex items-center gap-2'
                  >
                    <Plus size={16} />
                    Nuevo Consumible
                  </Button>
                )}
              </div>
            </div>

            <TabsContent value='equipment' className='space-y-6'>
              {equipmentError && (
                <Alert className='border-red-200 bg-red-50'>
                  <AlertCircle className='h-4 w-4 text-red-600' />
                  <AlertDescription className='text-red-800'>
                    {equipmentError}
                  </AlertDescription>
                </Alert>
              )}

              <EquipmentTable
                equipment={equipment}
                onEdit={handleEditEquipment}
                onDelete={handleDeleteEquipment}
                onView={handleViewEquipment}
                isLoading={equipmentLoading}
              />
            </TabsContent>

            <TabsContent value='consumables' className='space-y-6'>
              {consumablesError && (
                <Alert className='border-red-200 bg-red-50'>
                  <AlertCircle className='h-4 w-4 text-red-600' />
                  <AlertDescription className='text-red-800'>
                    {consumablesError}
                  </AlertDescription>
                </Alert>
              )}

              <ConsumableTable
                consumables={consumables}
                onEdit={handleEditConsumable}
                onDelete={handleDeleteConsumable}
                onView={handleViewConsumable}
                isLoading={consumablesLoading}
              />
            </TabsContent>
          </Tabs>

          {/* Equipment Dialogs */}
          <EquipmentEditDialog
            equipment={null}
            isOpen={showEquipmentForm}
            onClose={() => setShowEquipmentForm(false)}
            onSubmit={handleUpdateEquipment}
            onCreate={handleCreateEquipment}
            mode='create'
          />

          <EquipmentEditDialog
            equipment={editingEquipment}
            isOpen={!!editingEquipment}
            onClose={() => setEditingEquipment(null)}
            onSubmit={handleUpdateEquipment}
            mode='edit'
          />

          <EquipmentViewDialog
            equipment={viewingEquipment}
            isOpen={showEquipmentView}
            onClose={() => {
              setShowEquipmentView(false)
              setViewingEquipment(null)
            }}
            onEdit={(equipment) => {
              setShowEquipmentView(false)
              setViewingEquipment(null)
              setEditingEquipment(equipment)
            }}
          />

          {/* Consumable Dialogs */}
          <ConsumableEditDialog
            consumable={null}
            isOpen={showConsumableForm}
            onClose={() => setShowConsumableForm(false)}
            onSubmit={handleUpdateConsumable}
            onCreate={handleCreateConsumable}
            mode='create'
          />

          <ConsumableEditDialog
            consumable={editingConsumable}
            isOpen={!!editingConsumable}
            onClose={() => setEditingConsumable(null)}
            onSubmit={handleUpdateConsumable}
            mode='edit'
          />

          <ConsumableViewDialog
            consumable={viewingConsumable}
            isOpen={showConsumableView}
            onClose={() => {
              setShowConsumableView(false)
              setViewingConsumable(null)
            }}
            onEdit={(consumable) => {
              setShowConsumableView(false)
              setViewingConsumable(null)
              setEditingConsumable(consumable)
            }}
          />
        </div>
      </section>
    </Main>
  )
}
