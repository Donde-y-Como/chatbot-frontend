import { useState } from 'react'
import { io } from 'socket.io-client'

export const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000')

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false)

  return { socket, isConnected, setIsConnected }
}
