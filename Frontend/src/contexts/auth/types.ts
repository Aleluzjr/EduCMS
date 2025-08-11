export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR';
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  authReady: boolean;
  permissions: string[];
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: (refreshToken?: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  can: (permission: string) => boolean;
  canAny: (permissions: string[]) => boolean;
  canAll: (permissions: string[]) => boolean;
}

export interface AuthBroadcastMessage {
  type: 'login' | 'refresh' | 'logout';
  timestamp: number;
  data?: {
    user?: User;
    accessToken?: string;
    refreshToken?: string;
  };
}

export type LogoutReason = 'expiration' | 'failed_refresh' | 'user_action';
