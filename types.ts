
export type Role = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: Role;
  measurements?: Measurements;
}

export interface Measurements {
  bust: number;
  waist: number;
  hips: number;
  inseam: number;
  shoulder: number;
  height: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: 'Dress' | 'Suit' | 'Shirt' | 'Other';
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  productName: string;
  status: 'pending' | 'sewing' | 'ready' | 'completed';
  date: string;
  price: number;
}

export interface Appointment {
  id: string;
  userId: string;
  userName: string;
  date: string;
  time: string;
  purpose: 'Fitting' | 'Consultation' | 'Measurement';
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'appointment' | 'order';
  date: string;
  read: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
