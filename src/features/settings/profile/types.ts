export interface UserData {
  id: string
  logo: string
  name: string
  plan: BillingPlan
  socialPlatforms?: { // <- Aquí el "?" indica que es opcional
    facebook?: string; // <- También puedes hacer que las propiedades internas sean opcionales
    instagram?: string;
    whatsapp?: string;
  };
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

export interface UpdateUserRequest {
  name?: string;
  logo?: string;
}


export type WeekDay =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface WorkDay {
  startAt: number; // minutos desde medianoche (ej. 540 = 9:00 AM)
  endAt: number;   // minutos desde medianoche (ej. 1080 = 6:00 PM)
}

interface NonWorkDate {
  date: string;        // Formato ISO (ej. "2024-12-25")
  reason: string;      // Motivo por el que no se trabaja
  recurrent: boolean;  // Si se repite cada año
}

export interface BusinessSchedule {
  id: string;
  businessId: string;
  weeklyWorkDays: Partial<Record<WeekDay, WorkDay>>; // Si no aparece un día, no se trabaja ese día
  nonWorkDates: NonWorkDate[];
}

export interface UpdateBusinessScheduleRequest {
  weeklyWorkDays?: Partial<Record<WeekDay, WorkDay>>;
  nonWorkDates?: NonWorkDate[];
}
