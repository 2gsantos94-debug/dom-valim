export enum ServiceType {
  HAIRCUT = 'HAIRCUT',
  BEARD = 'BEARD',
  COMBO = 'COMBO',
  FINISHING = 'FINISHING'
}

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'PIX' | 'CARD' | 'PENDING';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  type: ServiceType;
}

export interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  serviceId: string;
  createdAt: number;
  status: AppointmentStatus; // Novo campo
  paymentMethod: PaymentMethod; // Novo campo
  clientPreferences?: string;
  barberNotes?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  validUntil?: string; // YYYY-MM-DD
  type: 'PROMO' | 'NEWS';
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string;
}