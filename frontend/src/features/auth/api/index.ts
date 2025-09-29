import type { 
  LoginRequest, 
  LoginResponse, 
  CreateAccessCodeRequest, 
  StudentSetupRequest, 
  StudentSetupResponse,
  User
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export const authApi = {
  createAccessCode: async (data: CreateAccessCodeRequest) => {
    return apiRequest('/api/auth/createAccessCode', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber: data.phone }),
    })
  },

  loginEmail: async (data: { email: string }) => {
    return apiRequest('/api/auth/loginEmail', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  validateAccessCode: async (data: LoginRequest): Promise<LoginResponse> => {
    const requestData = data.phone 
      ? { phoneNumber: data.phone, accessCode: data.accessCode }
      : { email: data.email, accessCode: data.accessCode }
    
    return apiRequest('/api/auth/validateAccessCode', {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  },

  studentSetup: async (data: StudentSetupRequest): Promise<StudentSetupResponse> => {
    return apiRequest('/api/student-auth/setup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  validateToken: async (token: string) => {
    return apiRequest<{ success: boolean; data: { isValid: boolean; email: string } }>(`/api/student-auth/validate-token/${token}`)
  },

  studentLogin: async (data: { username: string; password: string }): Promise<LoginResponse> => {
    return apiRequest('/api/student-auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  logout: async () => {
    return apiRequest('/api/auth/logout', {
      method: 'POST',
    })
  },

  validateAuthToken: async () => {
    return apiRequest<{ success: boolean; data: { user: User } }>('/api/auth/validate-token')
  },
}
