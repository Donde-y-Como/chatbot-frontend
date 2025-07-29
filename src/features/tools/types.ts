export enum EquipmentStatus {
  IN_USE = 'EN USO',
  ACTIVE = 'ACTIVO',
  INACTIVE = 'INACTIVO'
}

export interface Equipment {
  id: string;
  name: string;
  status: EquipmentStatus;
  category?: string | null;
  description?: string | null;
  photo?: string | null;
  serialNumber?: string | null;
  model?: string | null;
  brand?: string | null;
  purchaseDate?: string | null;
  lastMaintenanceDate?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateEquipmentData {
  name: string;
  status?: EquipmentStatus;
  category?: string;
  description?: string;
  photo?: string;
  serialNumber?: string;
  model?: string;
  brand?: string;
  purchaseDate?: string;
  lastMaintenanceDate?: string;
}

export interface UpdateEquipmentData {
  name?: string;
  status?: EquipmentStatus;
  category?: string;
  description?: string;
  photo?: string;
  serialNumber?: string;
  model?: string;
  brand?: string;
  purchaseDate?: string;
  lastMaintenanceDate?: string;
}

export interface Consumable {
  id: string;
  name: string;
  stock: number;
  description?: string | null;
  photo?: string | null;
  brand?: string | null;
  model?: string | null;
  category?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateConsumableData {
  name: string;
  stock?: number;
  description?: string;
  photo?: string;
  brand?: string;
  model?: string;
  category?: string;
}

export interface UpdateConsumableData {
  name?: string;
  stock?: number;
  description?: string;
  photo?: string;
  brand?: string;
  model?: string;
  category?: string;
}

export type TabType = 'equipment' | 'consumables';

export interface ToolsFormState {
  equipment: CreateEquipmentData;
  consumables: CreateConsumableData;
}
