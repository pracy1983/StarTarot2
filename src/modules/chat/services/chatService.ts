import { getResolvedPrompt } from '@/config/prompts/chatAgentPrompt'
import { Message, ApiMessage } from '../types/message'
import { useOraculistasStore } from '@/modules/oraculistas/store/oraculistasStore'
import { supabase } from '@/lib/supabase'

export class ChatService {
  private messages: ApiMessage[] = []
  private apiUrl = 'https://api.deepseek.com/v1/chat/completions'
  private oraculistas: any[] = []

  constructor() {
    // Removemos o initializeChat do constructor
  }

  // Novo método para inicializar com os oraculistas
  async initialize(oraculistas: any[]) {
    this.oraculistas = oraculistas
    const oraculistasList = useOraculistasStore.getState().oraculistas;
    const systemPrompt = await getResolvedPrompt(oraculistasList)
    this.messages = [
      { role: 'system', content: systemPrompt }
    ]
  }

  async retrieveHistory(userId: string): Promise<ApiMessage[]> {
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
      // Se não tiver sido inicializado ainda, usa um prompt padrão
      if (this.messages.length === 0) {
        this.messages = [
          {
            role: 'system',
            content: "Você é uma assistente do StarTarot, especializada em ajudar pessoas a encontrarem o oraculista ideal para suas necessidades."
          }
        ]
      }

      // Adiciona a mensagem do usuário
      const userMessage: ApiMessage = { role: 'user', content }
      this.messages.push(userMessage)

      // Faz a chamada para a API do DeepSeek
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
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantMessage: ApiMessage = {
        role: 'assistant',
        content: data.choices[0].message.content
      };

      // Salva as mensagens
      await this.saveMessage(userMessage, userId)
      await this.saveMessage(assistantMessage, userId)

      // Retorna no formato Message para compatibilidade
      return {
        role: assistantMessage.role,
        content: assistantMessage.content
      } as any;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      throw error
    }
  }

  private async saveMessage(message: ApiMessage, userId: string) {
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
