'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MinusIcon, ArrowsPointingOutIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { ChatService } from '../services/chatService'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { useOraculistasStore } from '@/modules/oraculistas/store/oraculistasStore'
import { v4 as uuidv4 } from 'uuid'

export function ChatWindow() {
  const router = useRouter()
  const { isMinimized, messages, setMinimized, addMessage, threadId, setThreadId, resetChat } = useChatStore()
  const user = useAuthStore(state => state.user)
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const chatService = useRef<ChatService | null>(null)
  const oraculistas = useOraculistasStore(state => state.oraculistas)

  // Inicializa o serviço de chat e carrega o histórico
  useEffect(() => {
    if (!chatService.current) {
      chatService.current = new ChatService()
    }
    
    if (user?.id && chatService.current) {
      chatService.current.retrieveHistory(user.id).then(history => {
        if (history.length > 0) {
          history.forEach(msg => {
            addMessage({
              id: uuidv4(),
              content: msg.content,
              sender: msg.role === 'assistant' ? 'agent' : 'user',
              timestamp: new Date()
            })
          })
        }
      })
    }
  }, [user?.id, addMessage])

  // Auto scroll para última mensagem
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  // Inicializa thread ID se não existir
  useEffect(() => {
    if (!threadId) {
      setThreadId(uuidv4())
    }
  }, [threadId, setThreadId])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !chatService.current || !user?.id) return

    const userMessage = {
      id: uuidv4(),
      content: inputMessage,
      sender: 'user' as const,
      timestamp: new Date()
    }

    addMessage(userMessage)
    setInputMessage('')
    setIsTyping(true)

    try {
      const response = await chatService.current.sendMessage(inputMessage, user.id)
      
      // Quebra a resposta em balões separados
      const sentences = response.content.split(/(?<=[.!?])\s+/)
      
      for (const sentence of sentences) {
        if (sentence.trim()) {
          // Calcula o tempo de digitação baseado no tamanho da mensagem
          const baseTime = Math.min(Math.max(sentence.length * 50, 1500), 3000)
          const randomVariation = Math.random() * 500
          const typingTime = baseTime + randomVariation
          
          await new Promise(resolve => setTimeout(resolve, typingTime))
          
          addMessage({
            id: uuidv4(),
            content: sentence.trim(),
            sender: 'agent',
            timestamp: new Date()
          })
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      addMessage({
        id: uuidv4(),
        content: 'Desculpe, tive um problema para processar sua mensagem. Pode tentar novamente?',
        sender: 'agent',
        timestamp: new Date()
      })
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className={`fixed bottom-4 right-4 w-96 bg-black border border-primary rounded-lg shadow-lg transition-all duration-300 ${isMinimized ? 'h-12' : 'h-[600px]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary">
        <h2 className="text-lg font-semibold text-primary">Chat</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setMinimized(!isMinimized)}
            className="text-primary hover:text-primary-dark"
          >
            {isMinimized ? (
              <ArrowsPointingOutIcon className="h-5 w-5" />
            ) : (
              <MinusIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div
            ref={chatRef}
            className="flex-1 p-4 space-y-4 overflow-y-auto h-[calc(600px-8rem)]"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-black'
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-white p-3 rounded-lg">
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-primary">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex space-x-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 p-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="p-2 text-primary hover:text-primary-dark disabled:opacity-50"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
