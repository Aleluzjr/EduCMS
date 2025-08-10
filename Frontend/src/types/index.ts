export interface Document {
  id: number;
  documentId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  slides: any[];
}

export interface SlideTemplate {
  id: number;
  name: string;
  icon: string;
  templateKey: string;
  fields: any[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR';
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'EDITOR';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'ADMIN' | 'EDITOR';
  active?: boolean;
}

export interface UserStats {
  total: number;
  active: number;
  admins: number;
  editors: number;
} 