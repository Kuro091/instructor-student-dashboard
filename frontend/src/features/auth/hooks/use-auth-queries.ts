import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api'
import type { LoginRequest, StudentSetupRequest } from '../types'

export const authKeys = {
  validateToken: (token: string) => ['validate-token', token] as const,
  validateAuthToken: () => ['validate-auth-token'] as const,
}

export function useValidateToken(token: string | undefined) {
  return useQuery({
    queryKey: authKeys.validateToken(token || ''),
    queryFn: () => authApi.validateToken(token!),
    enabled: !!token,
    retry: false,
  })
}

export function useValidateAuthToken() {
  return useQuery({
    queryKey: authKeys.validateAuthToken(),
    queryFn: () => authApi.validateAuthToken(),
    retry: false,
    staleTime: 5 * 60 * 1000, 
  })
}

export function useCreateAccessCode() {
  return useMutation({
    mutationFn: (data: { phone: string }) => authApi.createAccessCode(data),
  })
}

export function useLoginEmail() {
  return useMutation({
    mutationFn: (data: { email: string }) => authApi.loginEmail(data),
  })
}

export function useValidateAccessCode() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.validateAccessCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.validateAuthToken() })
    },
  })
}

export function useStudentSetup() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: StudentSetupRequest) => authApi.studentSetup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.validateAuthToken() })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.clear()
    },
  })
}
