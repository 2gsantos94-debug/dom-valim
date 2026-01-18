import { Appointment, TimeSlot, Expense } from '../types';
import { BUSINESS_HOURS } from '../constants';

const APPOINTMENTS_KEY = 'dom_vailm_appointments_v2'; // Bump version to force refresh or handle migration logic if needed
const EXPENSES_KEY = 'dom_vailm_expenses_v1';

export const getAppointments = (): Appointment[] => {
  try {
    const stored = localStorage.getItem(APPOINTMENTS_KEY);
    if (!stored) return [];
    
    const apps: Appointment[] = JSON.parse(stored);
    // Migration helper: ensure all appointments have status
    return apps.map(a => ({
      ...a,
      status: a.status || 'SCHEDULED',
      paymentMethod: a.paymentMethod || 'PENDING'
    }));
  } catch (error) {
    console.error("Error loading appointments", error);
    return [];
  }
};

export const saveAppointment = (appointment: Appointment): void => {
  const appointments = getAppointments();
  appointments.push(appointment);
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
};

export const updateAppointment = (updatedAppointment: Appointment): void => {
  const appointments = getAppointments();
  const index = appointments.findIndex(a => a.id === updatedAppointment.id);
  if (index !== -1) {
    appointments[index] = updatedAppointment;
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  }
};

export const deleteAppointment = (id: string): void => {
  const appointments = getAppointments();
  // Instead of hard delete, we might want to mark as cancelled, but user asked to "desmarcar"
  // For admin stats, maybe keeping cancelled is better, but let's stick to hard delete for "desmarcar" unless specified
  // Actually, to filter by "Cancelado", we should update status instead of deleting.
  // But if the user clicks "Desmarcar" (delete), we remove. 
  // Let's change delete to update status to CANCELLED for history purposes if it's the admin doing it.
  // For now, keep hard delete for the 'delete' function, but admin will use updateAppointment to Cancel.
  const filtered = appointments.filter(a => a.id !== id);
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(filtered));
};

// --- Expenses ---

export const getExpenses = (): Expense[] => {
  try {
    const stored = localStorage.getItem(EXPENSES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

export const saveExpense = (expense: Expense): void => {
  const expenses = getExpenses();
  expenses.push(expense);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
};

export const deleteExpense = (id: string): void => {
  const expenses = getExpenses();
  const filtered = expenses.filter(e => e.id !== id);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(filtered));
};

// --- Slots ---

export const generateTimeSlots = (date: string, appointments: Appointment[]): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = BUSINESS_HOURS.start;
  const endHour = BUSINESS_HOURS.end;
  const interval = BUSINESS_HOURS.intervalMinutes;

  let currentMinutes = startHour * 60;
  const endMinutes = endHour * 60;

  // Filter only active appointments (Scheduled or Completed)
  // Cancelled ones should free up the slot
  const takenTimes = appointments
    .filter(a => a.date === date && a.status !== 'CANCELLED')
    .map(a => a.time);

  while (currentMinutes < endMinutes) {
    const h = Math.floor(currentMinutes / 60);
    const m = currentMinutes % 60;
    const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

    slots.push({
      time: timeString,
      available: !takenTimes.includes(timeString)
    });

    currentMinutes += interval;
  }

  return slots;
};

export const getNext7Days = (): { display: string; value: string }[] => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() === 0) continue;

    const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' });
    const dayNum = d.getDate();
    const month = d.toLocaleDateString('pt-BR', { month: 'short' });
    
    const year = d.getFullYear();
    const monthIso = (d.getMonth() + 1).toString().padStart(2, '0');
    const dayIso = d.getDate().toString().padStart(2, '0');

    days.push({
      display: `${dayName}, ${dayNum} ${month}`,
      value: `${year}-${monthIso}-${dayIso}`
    });
  }
  return days;
};

export const checkReminders = (): Appointment[] => {
    const appointments = getAppointments();
    const now = new Date();
    
    return appointments.filter(app => {
        if (app.status === 'CANCELLED' || app.status === 'COMPLETED') return false;
        
        const appDate = new Date(`${app.date}T${app.time}`);
        const diffHours = (appDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        return diffHours > 0 && diffHours <= 24;
    });
};