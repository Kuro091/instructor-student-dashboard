import React, { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { AuthAction, AuthContextType } from './auth-types'
import { initialState } from './auth-types'
import type { AuthState, User } from '../types'
import { useValidateAuthToken, useLogout } from '../hooks/use-auth-queries'

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null }
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: null, 
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    
    case 'LOGIN_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      }
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }
    
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const { data: tokenData, isLoading: isValidatingToken } = useValidateAuthToken()
  const logoutMutation = useLogout()

  React.useEffect(() => {
    if (isValidatingToken) {
      dispatch({ type: 'LOGIN_START' })
    } else if (tokenData?.success && tokenData?.data?.user) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: tokenData.data.user, token: null } })
    } else {
      dispatch({ type: 'LOGOUT' })
    }
  }, [tokenData, isValidatingToken])

  const login = (user: User) => {
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: null } })
  }

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      dispatch({ type: 'LOGOUT' })
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const setLoading = (loading: boolean) => {
    if (loading) {
      dispatch({ type: 'LOGIN_START' })
    }
  }

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    setLoading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
