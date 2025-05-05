import { z } from "zod";

export type PlatformIdentity = {
    platformId: string;
    platformName: PlatformName;
    profileName: string;
}

export type Annex = {
    name: string;
    media: Media;
}

export enum PlatformName {
    Whatsapp = "whatsapp",
    Facebook = "facebook",
    Instagram = "instagram",
    WhatsappWeb = "whatsappWeb",
}

export type Media = {
    url: string
    type: string
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

// Exporting ClientPrimitives as Client for easier usage across the application
export type Client = ClientPrimitives;