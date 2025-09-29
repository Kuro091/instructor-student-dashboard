export interface User {
  id: string
  phone: string
  email: string
  name: string
  role: 'INSTRUCTOR' | 'STUDENT'
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginRequest {
  phone?: string
  email?: string
  accessCode: string
}

export interface LoginResponse {
  success: boolean
  data: {
    user: User
  }
  message: string
}

export interface CreateAccessCodeRequest {
  phone?: string
  email?: string
}

export interface StudentSetupRequest {
  setupToken: string
  username: string
  password: string
}

export interface StudentSetupResponse {
  success: boolean
  data: {
    user: User
  }
  message: string
}
