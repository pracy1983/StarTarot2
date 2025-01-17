export interface Message {
  id: string
  content: string
  sender: 'user' | 'agent'
  timestamp: Date
}

export interface ChatState {
  isMinimized: boolean
  messages: Message[]
  threadId: string | null
  setMinimized: (isMinimized: boolean) => void
  addMessage: (message: Message) => void
  setThreadId: (threadId: string) => void
  resetChat: () => void
}
