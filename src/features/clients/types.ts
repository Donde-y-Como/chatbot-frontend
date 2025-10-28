import { z } from "zod";
import { Media, PlatformName } from '@/features/chats/ChatTypes.ts'

export type PlatformIdentity = {
    platformId: string;
    platformName: PlatformName;
    profileName: string;
}

export type Annex = {
    name: string;
    media: Media;
}

export const platformIdentitySchema = z.object({
    platformId: z.string(),
    platformName: z.nativeEnum(PlatformName),
    profileName: z.string(),
})

export const annexSchema = z.object({
    name: z.string(),
    media: z.object({
        type: z.string(),
        url: z.string()
    }),
})

export const createClientSchema = z.object({
    platformIdentities: z.array(platformIdentitySchema).default([]),
    name: z.string().min(1, { message: "El nombre es obligatorio" }),
    tagIds: z.array(z.string()).default([]),
    annexes: z.array(annexSchema).default([]),
    photo: z.string().default(""),
    notes: z.string().default(""),
    email: z.string().refine(
        (val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        { message: "El correo electrónico no es válido" }
    ).default(""),
    address: z.string().default(""),
    favoriteEmployeeId: z.string().optional(),
    birthdate: z.string().optional(),
})

export type CreateClientForm = z.infer<typeof createClientSchema>
export const editClientSchema = createClientSchema.partial()

export type ClientPrimitives = {
    id: string;
    businessId: string;
    name: string;
    platformIdentities: PlatformIdentity[];
    tagIds: string[];
    annexes: Annex[];
    photo: string;
    notes: string;
    email: string;
    address: string;
    birthdate?: string;
    favoriteEmployeeId?: string
    createdAt: string;
    updatedAt: string;
}

export type Tag = {
    id: string
    businessId: string
    name: string
}

export const createTagSchema = z.object({
    name: z.string().min(1, { message: "El nombre es obligatorio" }),
})

export type CreateTagForm = z.infer<typeof createTagSchema>

// Exporting ClientPrimitives as Client for easier usage across the application
export type Client = ClientPrimitives;

export { PlatformName };

// Pending Services API Types
export interface PricePrimitives {
  amount: number;
  currency: string;
}

export interface ServiceItem {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: PricePrimitives;
  finalPrice: PricePrimitives;
  notes?: string;
  // New fields for appointment tracking
  scheduledCount: number;        // Number of scheduled appointments
  pendingCount: number;          // Number still needing appointments  
  appointmentIds: string[];      // Array of appointment IDs
}

export interface PendingServiceInfo {
  orderId: string;
  orderCreatedAt: string;
  clientId: string;
  businessId: string;
  serviceItem: ServiceItem;
}

export interface ServiceSelection {
  orderId: string;
  serviceItemIds: string[];
}

export interface GetPendingServicesResponse {
  success: boolean;
  data: PendingServiceInfo[];
  message: string;
  total: number;
}

export interface ScheduleClientServicesRequest {
  serviceSelections: ServiceSelection[];
  appointmentId: string;
}

export interface ScheduleClientServicesResponse {
  success: boolean;
  message: string;
}

// Portal Access Types
export interface SendPortalAccessLinkRequest {
  businessId: string;
  clientId: string;
  expirationTimeInHours?: number;
  customMessage?: string;
}

export interface GenerateAccessLinkResponse {
  accessToken: string;
  accessLink: string;
  expiresAt: string;
  clientId: string;
}
