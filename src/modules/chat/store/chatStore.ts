import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Message } from '../types/message'

const INITIAL_MESSAGE: Message = {
  id: '0',
  content: 'Olá, vamos escolher o melhor oraculista...',
  sender: 'agent' as const,
  timestamp: new Date()
}

interface ChatState {
  isMinimized: boolean
  messages: Message[]
  threadId: string | null
  setMinimized: (state: boolean) => void
  addMessage: (message: Message) => void
  setThreadId: (threadId: string) => void
  resetChat: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      isMinimized: false,
      messages: [INITIAL_MESSAGE],
      threadId: null,
      setMinimized: (state) => set({ isMinimized: state }),
      addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message] 
      })),
      setThreadId: (threadId) => set({ threadId }),
      resetChat: () => set({ 
        messages: [INITIAL_MESSAGE],
        isMinimized: false,
        threadId: null
      })
    }),
    {
      name: 'chat-storage',
    }
  )
)
