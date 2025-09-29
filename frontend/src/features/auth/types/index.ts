export interface User {
  id: string
  phone: string
  email: string
  name: string
  role: 'instructor' | 'student'
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginRequest {
  phone?: string
  email?: string
  accessCode: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface CreateAccessCodeRequest {
  phone?: string
  email?: string
}

export interface StudentSetupRequest {
  token: string
  username: string
  password: string
}

export interface StudentSetupResponse {
  user: User
  token: string
}
