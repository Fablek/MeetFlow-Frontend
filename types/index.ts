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