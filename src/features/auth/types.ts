export interface LoginData {
  email: string
  password: string
}

export interface UserData {
  id: string
  logo: string
  name: string
  plan: BillingPlan
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
