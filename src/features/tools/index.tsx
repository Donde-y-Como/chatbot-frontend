import React, { useState } from 'react';
import { TabType, Equipment, Consumable, CreateEquipmentData, UpdateEquipmentData, CreateConsumableData, UpdateConsumableData, EquipmentStatus } from './types';
import { useEquipment } from './hooks/useEquipment';
import { useConsumables } from './hooks/useConsumables';
import { EquipmentForm } from './components/EquipmentForm';
import { ConsumableForm } from './components/ConsumableForm';
import { EquipmentTable } from './components/EquipmentTable';
import { ConsumableTable } from './components/ConsumableTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Settings, Package, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Tools() {
  const [activeTab, setActiveTab] = useState<TabType>('equipment');
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [showConsumableForm, setShowConsumableForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [editingConsumable, setEditingConsumable] = useState<Consumable | null>(null);
  const [viewingEquipment, setViewingEquipment] = useState<Equipment | null>(null);
  const [viewingConsumable, setViewingConsumable] = useState<Consumable | null>(null);

  const {
    equipment,
    loading: equipmentLoading,
    error: equipmentError,
    createEquipment,
    updateEquipment,
    deleteEquipment
  } = useEquipment();

  const {
    consumables,
    loading: consumablesLoading,
    error: consumablesError,
    createConsumable,
    updateConsumable,
    deleteConsumable
  } = useConsumables();

  // Equipment handlers
  const handleCreateEquipment = async (data: CreateEquipmentData | UpdateEquipmentData) => {
    const result = await createEquipment(data as CreateEquipmentData);
    if (result) {
      setShowEquipmentForm(false);
      toast(`${(data as CreateEquipmentData).name} ha sido creado exitosamente.`);
    }
  };

  const handleUpdateEquipment = async (data: CreateEquipmentData | UpdateEquipmentData) => {
    if (!editingEquipment) return;
    
    const result = await updateEquipment(editingEquipment.id, data as UpdateEquipmentData);
    if (result) {
      setEditingEquipment(null);
      toast('Los cambios han sido guardados exitosamente.');
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    const equipmentToDelete = equipment.find(e => e.id === id);
    const success = await deleteEquipment(id);
    if (success && equipmentToDelete) {
      toast(`${equipmentToDelete.name} ha sido eliminado.`);
    }
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment);
  };

  const handleViewEquipment = (equipment: Equipment) => {
    setViewingEquipment(equipment);
  };

  // Consumable handlers
  const handleCreateConsumable = async (data: CreateConsumableData | UpdateConsumableData) => {
    const result = await createConsumable(data as CreateConsumableData);
    if (result) {
      setShowConsumableForm(false);
      toast(`${(data as CreateConsumableData).name} ha sido creado exitosamente.`);
    }
  };

  const handleUpdateConsumable = async (data: CreateConsumableData | UpdateConsumableData) => {
    if (!editingConsumable) return;
    
    const result = await updateConsumable(editingConsumable.id, data as UpdateConsumableData);
    if (result) {
      setEditingConsumable(null);
      toast('Los cambios han sido guardados exitosamente.');
    }
  };

  const handleDeleteConsumable = async (id: string) => {
    const consumableToDelete = consumables.find(c => c.id === id);
    const success = await deleteConsumable(id);
    if (success && consumableToDelete) {
      toast(`${consumableToDelete.name} ha sido eliminado.`);
    }
  };

  const handleEditConsumable = (consumable: Consumable) => {
    setEditingConsumable(consumable);
  };

  const handleViewConsumable = (consumable: Consumable) => {
    setViewingConsumable(consumable);
  };

  // Get stats
  const lowStockConsumables = consumables.filter(c => c.stock < 10 && c.stock > 0);
  const outOfStockConsumables = consumables.filter(c => c.stock === 0);
  const inUseEquipment = equipment.filter(e => e.status === EquipmentStatus.IN_USE);
  const activeEquipment = equipment.filter(e => e.status === EquipmentStatus.ACTIVE);

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Equipos</p>
              <p className="text-2xl font-bold">{equipment.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Consumibles</p>
              <p className="text-2xl font-bold">{consumables.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
              <p className="text-2xl font-bold">{lowStockConsumables.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sin Stock</p>
              <p className="text-2xl font-bold">{outOfStockConsumables.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-4 mb-6">
      {outOfStockConsumables.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{outOfStockConsumables.length} consumibles sin stock:</strong>{' '}
            {outOfStockConsumables.slice(0, 3).map(c => c.name).join(', ')}
            {outOfStockConsumables.length > 3 && ` y ${outOfStockConsumables.length - 3} más`}
          </AlertDescription>
        </Alert>
      )}

      {lowStockConsumables.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>{lowStockConsumables.length} consumibles con stock bajo:</strong>{' '}
            {lowStockConsumables.slice(0, 3).map(c => c.name).join(', ')}
            {lowStockConsumables.length > 3 && ` y ${lowStockConsumables.length - 3} más`}
          </AlertDescription>
        </Alert>
      )}

      {inUseEquipment.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>{inUseEquipment.length} equipos en uso actualmente</strong>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Herramientas</h1>
          <p className="text-gray-600">Administra equipos, insumos y consumibles</p>
        </div>
      </div>

      {renderStatsCards()}
      {renderAlerts()}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList className="grid w-full sm:w-auto grid-cols-2">
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Settings size={16} />
              Equipos o Insumos
            </TabsTrigger>
            <TabsTrigger value="consumables" className="flex items-center gap-2">
              <Package size={16} />
              Consumibles
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            {activeTab === 'equipment' && (
              <Button onClick={() => setShowEquipmentForm(true)} className="flex items-center gap-2">
                <Plus size={16} />
                Nuevo Equipo
              </Button>
            )}
            {activeTab === 'consumables' && (
              <Button onClick={() => setShowConsumableForm(true)} className="flex items-center gap-2">
                <Plus size={16} />
                Nuevo Consumible
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="equipment" className="space-y-6">
          {equipmentError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Error al cargar equipos: {equipmentError}
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

        <TabsContent value="consumables" className="space-y-6">
          {consumablesError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Error al cargar consumibles: {consumablesError}
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
      <Dialog open={showEquipmentForm} onOpenChange={setShowEquipmentForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Equipo</DialogTitle>
          </DialogHeader>
          <EquipmentForm
            onSubmit={handleCreateEquipment}
            onCancel={() => setShowEquipmentForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingEquipment} onOpenChange={() => setEditingEquipment(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Equipo</DialogTitle>
          </DialogHeader>
          {editingEquipment && (
            <EquipmentForm
              equipment={editingEquipment}
              onSubmit={handleUpdateEquipment}
              onCancel={() => setEditingEquipment(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Consumable Dialogs */}
      <Dialog open={showConsumableForm} onOpenChange={setShowConsumableForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Consumible</DialogTitle>
          </DialogHeader>
          <ConsumableForm
            onSubmit={handleCreateConsumable}
            onCancel={() => setShowConsumableForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingConsumable} onOpenChange={() => setEditingConsumable(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Consumible</DialogTitle>
          </DialogHeader>
          {editingConsumable && (
            <ConsumableForm
              consumable={editingConsumable}
              onSubmit={handleUpdateConsumable}
              onCancel={() => setEditingConsumable(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialogs */}
      <Dialog open={!!viewingEquipment} onOpenChange={() => setViewingEquipment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Equipo</DialogTitle>
          </DialogHeader>
          {viewingEquipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Nombre:</p>
                  <p>{viewingEquipment.name}</p>
                </div>
                <div>
                  <p className="font-semibold">Estado:</p>
                  <p>{viewingEquipment.status}</p>
                </div>
                <div>
                  <p className="font-semibold">Categoría:</p>
                  <p>{viewingEquipment.category || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold">Marca:</p>
                  <p>{viewingEquipment.brand || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold">Modelo:</p>
                  <p>{viewingEquipment.model || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold">Número de Serie:</p>
                  <p>{viewingEquipment.serialNumber || 'N/A'}</p>
                </div>
              </div>
              {viewingEquipment.description && (
                <div>
                  <p className="font-semibold">Descripción:</p>
                  <p>{viewingEquipment.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingConsumable} onOpenChange={() => setViewingConsumable(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Consumible</DialogTitle>
          </DialogHeader>
          {viewingConsumable && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Nombre:</p>
                  <p>{viewingConsumable.name}</p>
                </div>
                <div>
                  <p className="font-semibold">Stock:</p>
                  <p>{viewingConsumable.stock} unidades</p>
                </div>
                <div>
                  <p className="font-semibold">Categoría:</p>
                  <p>{viewingConsumable.category || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold">Marca:</p>
                  <p>{viewingConsumable.brand || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold">Modelo:</p>
                  <p>{viewingConsumable.model || 'N/A'}</p>
                </div>
              </div>
              {viewingConsumable.description && (
                <div>
                  <p className="font-semibold">Descripción:</p>
                  <p>{viewingConsumable.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
