import type { 
  LoginRequest, 
  LoginResponse, 
  CreateAccessCodeRequest, 
  StudentSetupRequest, 
  StudentSetupResponse 
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Generic fetch wrapper with error handling
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
      body: JSON.stringify(data),
    })
  },

  loginEmail: async (data: { email: string }) => {
    return apiRequest('/api/auth/loginEmail', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  validateAccessCode: async (data: LoginRequest): Promise<LoginResponse> => {
    return apiRequest('/api/auth/validateAccessCode', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  studentSetup: async (data: StudentSetupRequest): Promise<StudentSetupResponse> => {
    return apiRequest('/api/student-auth/setup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  validateToken: async (token: string) => {
    return apiRequest(`/api/student-auth/validate-token/${token}`)
  },

  studentLogin: async (data: { username: string; password: string }): Promise<LoginResponse> => {
    return apiRequest('/api/student-auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}
