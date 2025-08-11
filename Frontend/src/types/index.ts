// Tipos base
export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de usuário
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'ADMIN' | 'EDITOR';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface CreateDocumentData {
  name: string;
  documentId?: string;
  slides?: any[];
  metadata?: Record<string, any>;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  active?: boolean;
}

export interface UserStats {
  total: number;
  active: number;
  admins: number;
  editors: number;
}

// Tipos de campo
export interface Field {
  id: number;
  templateId: number;
  name: string;
  type: string;
  label: string;
  required: boolean;
  defaultValue?: string;
  accept?: string;
  fields?: any;
}

export type MediaType = 'image' | 'video' | 'audio' | 'document';

// Tipos de slide
export interface Slide {
  templateId: number;
  templateKey: string;
  order: number;
  fields: SlideField[];
  publishedAt?: Date;
}

export interface SlideField {
  fieldId: number;
  fieldName: string;
  fieldType: string;
  value: any;
  mediaUrl?: string;
  mediaAlt?: string;
}

// Tipos de template
export interface SlideTemplate {
  id: number;
  name: string;
  icon: string;
  templateKey: string;
  fields: any[];
  createdBy?: User;
  createdById: number;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de documento
export interface Document extends BaseEntity {
  documentId: string;
  name: string;
  slides: any[];
  publishedAt: Date | null;
  ownerId: number;
  owner?: User;
  status: DocumentStatus;
  deletedAt?: Date | null;
}

export type DocumentStatus = 'RASCUNHO' | 'PUBLICADO';

// Tipos de mídia
export interface Media {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  caption?: string;
  mediaType: MediaType;
  dimensions?: {
    width: number;
    height: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMediaData {
  file: File;
  alt?: string;
  caption?: string;
}

export interface UpdateMediaData {
  alt?: string;
  caption?: string;
}

// Tipos de autenticação
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenData {
  refreshToken: string;
}

// Tipos de API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// Tipos de formulário
export interface FormField {
  name: string;
  value: any;
  error?: string;
  touched: boolean;
}

export interface FormState {
  fields: Record<string, FormField>;
  isValid: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

// Tipos de notificação
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// Tipos de navegação
export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  required?: string | string[];
  badge?: number;
}

// Tipos de configuração
export interface AppConfig {
  apiUrl: string;
  uploadMaxSize: number;
  allowedFileTypes: string[];
  pagination: {
    defaultLimit: number;
    maxLimit: number;
  };
} 