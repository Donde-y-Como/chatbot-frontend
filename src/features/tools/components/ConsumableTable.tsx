import React, { useState } from 'react';
import { Consumable } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MoreHorizontal, Edit, Trash2, Eye, Search, Package, AlertTriangle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ConsumableTableProps {
  consumables: Consumable[];
  onEdit: (consumable: Consumable) => void;
  onDelete: (id: string) => void;
  onView?: (consumable: Consumable) => void;
  isLoading?: boolean;
}

export const ConsumableTable: React.FC<ConsumableTableProps> = ({
  consumables,
  onEdit,
  onDelete,
  onView,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');

  const filteredConsumables = consumables.filter(item => {
    const nameMatch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const categoryMatch = item.category ? item.category.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const brandMatch = item.brand ? item.brand.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    
    const matchesSearch = nameMatch || categoryMatch || brandMatch;
    
    let matchesStock = true;
    if (stockFilter === 'LOW') {
      matchesStock = item.stock > 0 && item.stock < 10;
    } else if (stockFilter === 'OUT') {
      matchesStock = item.stock === 0;
    }
    
    return matchesSearch && matchesStock;
  });

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <Badge className="bg-red-100 text-red-800">
          <AlertTriangle size={12} className="mr-1" />
          Sin stock
        </Badge>
      );
    } else if (stock < 10) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <AlertTriangle size={12} className="mr-1" />
          Stock bajo
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-100 text-green-800">
          Stock normal
        </Badge>
      );
    }
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600 font-semibold';
    if (stock < 10) return 'text-yellow-600 font-semibold';
    return 'text-green-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package size={20} />
          Consumibles
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Buscar consumibles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as 'ALL' | 'LOW' | 'OUT')}
            className="px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="ALL">Todos los stocks</option>
            <option value="LOW">Stock bajo</option>
            <option value="OUT">Sin stock</option>
          </select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredConsumables.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {consumables.length === 0 ? 'No hay consumibles registrados' : 'No se encontraron consumibles con los filtros aplicados'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden md:table-cell">Categoría</TableHead>
                  <TableHead className="hidden lg:table-cell">Marca</TableHead>
                  <TableHead className="hidden lg:table-cell">Modelo</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsumables.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={getStockColor(item.stock)}>
                        {item.stock} unidades
                      </span>
                    </TableCell>
                    <TableCell>{getStockBadge(item.stock)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {item.category || '-'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {item.brand || '-'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {item.model || '-'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onView && (
                            <DropdownMenuItem onClick={() => onView(item)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onEdit(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                                <span className="text-red-500">Eliminar</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. El consumible "{item.name}" será eliminado permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDelete(item.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
