export interface User {
  id: string;
  email: string;
  fullName: string;
  username: string;
  profileImageUrl?: string;
  createdAt: string;
}

export interface EventType {
  id: string;
  userId: string;
  name: string;
  slug: string;
  durationMinutes: number;
  description?: string;
  location: string;
  locationDetails?: string;
  color: string;
  isActive: boolean;
  bufferMinutes: number;
  minNoticeHours: number;
  maxDaysInAdvance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Availability {
  id: string;
  userId: string;
  dayOfWeek: number;
  dayOfWeekName: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface DayAvailability {
  dayOfWeek: number;
  dayName: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}