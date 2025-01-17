'use client'

import { useRef, useEffect, useState } from 'react'
import { MinusIcon, ArrowsPointingOutIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { useChatStore } from './store/chatStore'
import { v4 as uuidv4 } from 'uuid'

export function ChatModule() {
  const { isMinimized, messages, setMinimized, addMessage, threadId, setThreadId, resetChat } = useChatStore()
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  // Auto scroll para última mensagem
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, isMinimized])

  // Inicializa thread se não existir
  useEffect(() => {
    if (!threadId) {
      const newThreadId = uuidv4();
      setThreadId(newThreadId);
      addMessage({
        id: uuidv4(),
        content: `Nova thread iniciada: ${newThreadId}.`,
        sender: 'agent',
        timestamp: new Date()
      });
    }
  }, [threadId, setThreadId, addMessage])

  const handleSend = async () => {
    if (!inputMessage.trim() || isTyping) return

    setIsTyping(true)
    const messageText = inputMessage.trim()
    setInputMessage('')

    // Adiciona mensagem do usuário
    const userMessage = {
      id: uuidv4(),
      content: messageText,
      sender: 'user' as const,
      timestamp: new Date()
    }
    addMessage(userMessage)

    try {
      // Simula resposta do agente
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      addMessage({
        id: uuidv4(),
        content: 'Estou processando sua mensagem...',
        sender: 'agent',
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      addMessage({
        id: uuidv4(),
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        sender: 'agent',
        timestamp: new Date()
      })
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 w-96 bg-surface rounded-xl shadow-lg border border-primary/20 transition-all duration-300 ${
        isMinimized ? 'h-14' : 'h-[600px]'
      }`}
    >
      {/* Header do Chat */}
      <div className="flex items-center justify-between p-4 border-b border-primary/20">
        <h3 className="text-lg font-bold text-primary">Chat StarTarot</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMinimized(!isMinimized)}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            {isMinimized ? <ArrowsPointingOutIcon className="h-5 w-5" /> : <MinusIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Área de Mensagens */}
      {!isMinimized && (
        <>
          <div 
            ref={chatRef}
            className="flex-1 p-4 overflow-y-auto h-[calc(100%-8rem)] space-y-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-black'
                      : 'bg-surface border border-primary/20'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg bg-surface border border-primary/20">
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input de Mensagem */}
          <div className="p-4 border-t border-primary/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-2 rounded-lg bg-black/40 border border-primary/20 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleSend}
                disabled={isTyping}
                className="p-2 bg-primary text-black rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
