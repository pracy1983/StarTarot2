import { getResolvedPrompt } from '@/config/prompts/chatAgentPrompt'
import { Message } from '../types/message'
import { useOraculistasStore } from '@/modules/oraculistas/store/oraculistasStore'
import { supabase } from '@/lib/supabase'

export class ChatService {
  private messages: Message[] = []
  private apiUrl = 'https://api.deepseek.com/v1/chat/completions'

  constructor() {
    this.initializeChat()
  }

  private async initializeChat() {
    // Carrega os oraculistas primeiro
    const { carregarOraculistas } = useOraculistasStore.getState()
    await carregarOraculistas()
    
    // Depois pega o prompt já com os oraculistas carregados
    const systemPrompt = await getResolvedPrompt()
    this.messages = [
      { role: 'system', content: systemPrompt }
    ]
  }

  async retrieveHistory(userId: string): Promise<Message[]> {
    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    } catch (error) {
      console.error('Erro ao recuperar histórico:', error)
      return []
    }
  }

  async sendMessage(content: string, userId: string): Promise<Message> {
    try {
      // Primeiro, recupera o histórico de mensagens
      const history = await this.retrieveHistory(userId)
      
      // Reseta as mensagens com o prompt do sistema e o histórico
      const systemPrompt = await getResolvedPrompt()
      this.messages = [
        { role: 'system', content: systemPrompt },
        ...history
      ]

      // Adiciona a nova mensagem do usuário
      const userMessage: Message = { role: 'user', content }
      this.messages.push(userMessage)

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: this.messages,
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      })

      if (!response.ok) {
        throw new Error('Erro na chamada da API')
      }

      const data = await response.json()
      const assistantMessage = data.choices[0].message

      // Salva a mensagem no Supabase
      await this.saveMessage(userMessage, userId)
      await this.saveMessage(assistantMessage, userId)

      return assistantMessage
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      throw error
    }
  }

  private async saveMessage(message: Message, userId: string) {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            user_id: userId,
            role: message.role,
            content: message.content,
            created_at: new Date().toISOString()
          }
        ])

      if (error) throw error
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error)
    }
  }
}
