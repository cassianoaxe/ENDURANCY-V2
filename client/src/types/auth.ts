/**
 * Authentication related type definitions
 */

/**
 * User role types in the system
 */
export type UserRole = 
  | 'admin' 
  | 'organization' 
  | 'doctor' 
  | 'patient' 
  | 'researcher'
  | 'pharmacist'
  | 'laboratory'
  | 'supplier';

/**
 * Interface for user data from authentication endpoints
 */
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: number | null;
  profilePhoto: string | null;
  phoneNumber: string | null;
  bio: string | null;
  lastPasswordChange: string | null;
  createdAt: string;
  redirectUrl?: string | null;
}

/**
 * Login credentials structure
 */
export interface LoginCredentials {
  email: string;
  password: string;
  userType?: UserRole;
  organizationCode?: string;
}

/**
 * Authentication state interface
 */
export interface AuthState {
  /** Whether authentication state is being checked */
  loading: boolean;
  /** Current authenticated user or null if not authenticated */
  user: User | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Last occurred authentication error */
  error: string | null;
}

/**
 * Login attempt response from the API
 */
export interface LoginResponse {
  id: number;
  username: string;
  role: UserRole;
  name: string;
  email: string;
  organizationId: number | null;
  profilePhoto: string | null;
  redirectUrl?: string | null;
  [key: string]: any;
}

/**
 * Authentication context interface
 */
export interface AuthContextType {
  /** Current authentication state */
  authState: AuthState;
  /** Attempt to login with credentials */
  login: (credentials: LoginCredentials) => Promise<User>;
  /** Log out current user */
  logout: () => Promise<void>;
  /** Check current authentication status */
  checkAuth: () => Promise<User | null>;
  /** Update current user data */
  updateUser: (updates: Partial<User>) => void;
}