export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  appName: import.meta.env.VITE_APP_NAME || 'Classroom Management',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  isDev: import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV,
} as const
