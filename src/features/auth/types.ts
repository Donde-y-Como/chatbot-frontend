import { PlatformIdentity, PlatformName } from '@/features/clients/types.ts'

export interface LoginData {
  email: string
  password: string
}

export type PlatformConfig = {
  platformId: string
  token: string
  platformName: PlatformName
}

export interface UserData {
  id: string
  logo: string
  name: string
  plan: BillingPlan
  assistantConfig: {
    id: string
    enabled: boolean
  }
  socialPlatforms: PlatformConfig[]
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
