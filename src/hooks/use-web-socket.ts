import { useState } from 'react';
import { io } from 'socket.io-client';
import { Message } from '@/features/chats/ChatTypes.ts';


export const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000')

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false)

  const sendMessage = (data: { conversationId: string, message: Message }) => {
    socket.emit('newBusinessMessage', data)
  }

  return { socket, isConnected, setIsConnected, sendMessage }
}
