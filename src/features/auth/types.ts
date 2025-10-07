import { PlatformName } from '@/features/chats/ChatTypes.ts'
import { Permission } from '@/api/permissions.ts'

export interface LoginData {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  userId: string
  user: UserData
}

export interface UpdateCredentialsData {
  currentPassword: string
  email?: string
  newPassword?: string
}

export interface Role {
  id: string
  businessId: string
  name: string
  description: string
  permissions: Permission[]
  createdAt: string
}

export interface CreateRoleData {
  name: string
  description: string
  permissions: string[]
}

export interface UpdateRoleData {
  name: string
  description: string
  permissions: string[]
}

export interface PermissionsResponse {
  permissions: Permission[]
}

export type PlatformConfig = {
  platformId: string
  token: string
  platformName: PlatformName
  displayName?: string
  extra?: any
}

export interface UserData {
  id: string
  email: string
  isOwner: boolean
  businessId: string
  roleIds: string[]
}

export interface BusinessData {
  id: string
  name: string
  logo?: string
  phone?: string
  email?: string
  address?: string
  plan: BillingPlan
  assistantConfig: {
    id: string
    name: string
    prompt: string
    vectorStorageId: string
    enabled: boolean
  }
  socialPlatforms: PlatformConfig[]
  notificationsEnabled: boolean
}

export interface BillingPlan {
  active: boolean
  endTimestamp: number
  leftMessages: number
  usedMessages: number
  totalMessages: number
  name: 'Trial' | 'Basic' | 'Pro' | 'StartUp'
  startTimestamp: number
  status: 'active' | 'inactive'
  type: string
}

export interface BusinessRegisterRequest {
  email: string
  password: string
  name: string
  address?: string
  phone?: string
  assistantConfig?: {
    id?: string
    name: string
    prompt?: string
    vectorStorageId?: string
    enabled: boolean
    batchTimeout?: number
  }
  socialPlatforms?: PlatformConfig[]
  plan?: {
    active: boolean
    endTimestamp: number
    startTimestamp: number
    name: string
    type: 'monthly' | 'yearly'
    totalMessages: number
    usedMessages: number
  }
  notificationsEnabled?: boolean
  logo?: string
}

export interface BusinessRegisterResponse {
  message: string
}
