import { io, type Socket } from 'socket.io-client'
import { config } from '@/config/env'
import type { SocketEvents } from '@/features/chat/types'

class SocketManager {
  private socket: Socket | null = null

  connect() {
    if (this.socket?.connected) {
      return this.socket
    }
    
    this.socket = io(config.socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }

  emit<K extends keyof SocketEvents>(event: K, data: SocketEvents[K]) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }

  on<K extends keyof SocketEvents>(
    event: K, 
    callback: (data: SocketEvents[K]) => void
  ) {
    if (this.socket) {
      this.socket.on(event as string, callback as (...args: unknown[]) => void)
    }
  }

  off<K extends keyof SocketEvents>(
    event: K, 
    callback?: (data: SocketEvents[K]) => void
  ) {
    if (this.socket) {
      this.socket.off(event as string, callback as (...args: unknown[]) => void)
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  onConnect(callback: () => void) {
    if (this.socket) {
      this.socket.on('connect', callback)
    }
  }

  onDisconnect(callback: () => void) {
    if (this.socket) {
      this.socket.on('disconnect', callback)
    }
  }

  onConnectError(callback: (error: Error) => void) {
    if (this.socket) {
      this.socket.on('connect_error', callback)
    }
  }
}

export const socketManager = new SocketManager()

export function useSocket() {
  return socketManager
}
