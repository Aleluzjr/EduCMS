// Tipos base
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

// Tipos de usuário
export interface User extends BaseEntity {
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  lastLoginAt: string | null;
}

export type UserRole = 'ADMIN' | 'EDITOR';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
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
export interface Field extends BaseEntity {
  name: string;
  type: FieldType;
  label: string;
  required: boolean;
  defaultValue?: FieldValue;
  allowedMediaTypes?: MediaType[];
  fields?: Field[]; // Para campos repetíveis
  rows?: number; // Para textarea
  placeholder?: string;
  validation?: FieldValidation;
}

export type FieldType = 'text' | 'textarea' | 'html' | 'media' | 'repeatable' | 'number' | 'select' | 'checkbox' | 'date';

export type FieldValue = string | number | boolean | string[] | null;

export type MediaType = 'image' | 'video' | 'audio' | 'document';

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  required?: boolean;
}

// Tipos de slide
export interface Slide extends BaseEntity {
  templateId: number;
  templateKey: string;
  order: number;
  fields: SlideField[];
  isPublished: boolean;
  publishedAt?: string;
}

export interface SlideField {
  fieldId: number;
  fieldName: string;
  fieldType: FieldType;
  value: FieldValue;
  mediaUrl?: string;
  mediaAlt?: string;
}

// Tipos de template
export interface SlideTemplate extends BaseEntity {
  name: string;
  icon: string;
  templateKey: string;
  description?: string;
  fields: Field[];
  isActive: boolean;
  version: number;
}

// Tipos de documento
export interface Document extends BaseEntity {
  documentId: string;
  name: string;
  description?: string;
  slides: Slide[];
  publishedAt: string | null;
  isPublished: boolean;
  authorId: number;
  author?: User;
  tags?: string[];
  status: DocumentStatus;
}

export type DocumentStatus = 'draft' | 'review' | 'published' | 'archived';

// Tipos de mídia
export interface Media extends BaseEntity {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  caption?: string;
  uploadedBy: number;
  uploadedByUser?: User;
  mediaType: MediaType;
  dimensions?: {
    width: number;
    height: number;
  };
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
  value: FieldValue;
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