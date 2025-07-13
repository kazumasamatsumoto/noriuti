export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: string;
  prefecture: string;
  city: string;
  bio?: string;
  favoriteSlots?: string[];
  budget?: string;
  frequency?: string;
  timeSlots?: string[];
  profileImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  age: number;
  gender: string;
  prefecture: string;
  city: string;
  bio?: string;
  favoriteSlots?: string[];
  playStyle?: {
    budget: string;
    frequency: string;
    timeSlot: string[];
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}