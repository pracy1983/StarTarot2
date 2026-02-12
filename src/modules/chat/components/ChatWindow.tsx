'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MinusIcon, ArrowsPointingOutIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { ChatService } from '@/modules/chat/services/chatService'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { useOraculistasStore } from '@/modules/oraculistas/store/oraculistasStore'
import { v4 as uuidv4 } from 'uuid'
import { Message, ApiMessage } from '../types/message'

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
    console.log('Estado atual:', {
      isAuthenticated: !!user?.id,
      userId: user?.id,
      hasChatService: !!chatService.current
    })

    if (!chatService.current) {
      console.log('Inicializando chatService...')
      chatService.current = new ChatService()
      console.log('ChatService inicializado')
    }

    if (user?.id && chatService.current) {
      chatService.current.retrieveHistory(user.id).then(history => {
        if (history.length > 0) {
          history.forEach((message: ApiMessage) => {
            const newMessage: Message = {
              id: uuidv4(),
              content: message.content,
              sender: message.role === 'user' ? 'user' : 'assistant',
              timestamp: new Date(),
              role: message.role
            }
            addMessage(newMessage)
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

  useEffect(() => {
    // Mensagem inicial quando o chat é montado
    if (user?.id && !messages.length) {
      const initialMessage: Message = {
        id: uuidv4(),
        content: "Oie! Como posso te ajudar hoje? Seja direto no tipo de questão que você precisa de ajuda, pra eu poder te ajudar da melhor forma possível te indicando a energia certa pro seu caso.",
        sender: 'assistant' as const,
        timestamp: new Date(),
        role: 'assistant'
      }
      addMessage(initialMessage)
    }
  }, [user?.id, messages.length, addMessage])

  useEffect(() => {
    const initChat = async () => {
      if (!chatService.current) {
        console.log('Inicializando chatService...')
        chatService.current = new ChatService()
        console.log('ChatService inicializado')

        // Inicializa com os oraculistas atuais
        await chatService.current.initialize(oraculistas)
        console.log('ChatService inicializado')
      }
    }

    initChat()
  }, [oraculistas])

  const handleSendMessage = async () => {
    console.log('=== DEBUG CHAT ===')
    console.log('1. Estado inicial:', {
      inputMessage,
      userId: user?.id,
      hasChatService: !!chatService.current
    })

    if (!inputMessage.trim() || !user?.id) {
      console.log('2. Validação falhou:', {
        hasInput: !!inputMessage.trim(),
        hasUser: !!user?.id
      })
      return
    }

    const userMessage: Message = {
      id: uuidv4(),
      content: inputMessage,
      sender: 'user' as const,
      timestamp: new Date(),
      role: 'user'
    }

    console.log('3. Mensagem do usuário:', userMessage)
    addMessage(userMessage)
    setInputMessage('')
    setIsTyping(true)

    try {
      if (!chatService.current) {
        console.log('4. Criando novo chatService...')
        chatService.current = new ChatService()
      }

      console.log('5. Enviando para chatService:', inputMessage)
      const response = await chatService.current.sendMessage(inputMessage, user.id)
      console.log('6. Resposta bruta recebida:', response)

      if (response?.content) {
        console.log('7. Processando resposta:', response.content)
        const paragraphs = response.content.split('\n\n')

        for (const paragraph of paragraphs) {
          if (paragraph.trim()) {
            console.log('8. Adicionando parágrafo:', paragraph.trim())
            await new Promise(resolve => setTimeout(resolve, 1000))

            const agentMessage: Message = {
              id: uuidv4(),
              content: paragraph.trim(),
              sender: 'assistant' as const,
              timestamp: new Date(),
              role: 'assistant'
            }
            addMessage(agentMessage)
          }
        }
      } else {
        console.log('7. Sem conteúdo na resposta')
        throw new Error('Resposta sem conteúdo')
      }
    } catch (error) {
      console.error('9. Erro detalhado:', error)
      const errorMessage: Message = {
        id: uuidv4(),
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        sender: 'assistant' as const,
        timestamp: new Date(),
        role: 'assistant'
      }
      addMessage(errorMessage)
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 w-96 bg-black/95 backdrop-blur-sm rounded-xl shadow-xl border border-primary/20 transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[600px]'
        }`}
    >
      {/* Header do Chat */}
      <div
        className="flex items-center justify-between p-4 border-b border-primary/20 bg-black/95"
      >
        <h3 className="text-lg font-bold text-primary">Chat StarTarot</h3>
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

      {/* Área de Mensagens */}
      {!isMinimized && (
        <>
          <div
            ref={chatRef}
            className="flex-1 p-4 overflow-y-auto h-[calc(100%-8rem)] space-y-4 bg-black/95"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-lg shadow-md ${message.sender === 'user'
                    ? 'bg-primary text-black'
                    : 'bg-[rgba(0,0,0,0.98)] text-white border border-primary/10'
                    }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[rgba(0,0,0,0.98)] text-white p-3 rounded-lg border border-primary/10 shadow-md">
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input área */}
          <div className="p-4 border-t border-primary/20 bg-black/95">
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
                className="flex-1 p-2 rounded-lg bg-[rgba(0,0,0,0.98)] text-white border border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
