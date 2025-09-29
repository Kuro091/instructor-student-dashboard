import type { User, AuthState } from '../types'

export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string | null } }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }

export interface AuthContextType extends AuthState {
  login: (user: User) => void
  logout: () => void
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}
