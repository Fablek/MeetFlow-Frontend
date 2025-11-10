export interface AvailableSlot {
  start: string; // ISO datetime
  end: string;
}

export interface EventTypeInfo {
  name: string;
  slug: string;
  durationMinutes: number;
  location: string;
  description?: string;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  availableSlots: AvailableSlot[];
  eventType: EventTypeInfo;
}

export interface CreateBookingRequest {
  guestEmail: string;
  guestName: string;
  guestPhone?: string;
  notes?: string;
  startTime: string; // ISO datetime
}

export interface BookingConfirmation {
  bookingId: string;
  guestName: string;
  guestEmail: string;
  startTime: string;
  endTime: string;
  eventTypeName: string;
  location: string;
  locationDetails?: string;
  durationMinutes: number;
  status: string;
  message: string;
}