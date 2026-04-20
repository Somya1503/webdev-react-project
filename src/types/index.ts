export type Role = 'user' | 'volunteer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  bloodType?: string;
  isAvailable?: boolean;
}

export interface Coordinates {
  lat: number;
  lng: number;
}
