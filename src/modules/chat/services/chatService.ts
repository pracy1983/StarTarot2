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

  async sendMessage(content: string, userId: string): Promise<ApiMessage> {
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

      // Por enquanto, vamos usar respostas mock para teste
      const mockResponse: ApiMessage = {
        role: 'assistant',
        content: this.getMockResponse(content)
      }

      // Salva as mensagens
      await this.saveMessage(userMessage, userId)
      await this.saveMessage(mockResponse, userId)

      return mockResponse
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      throw error
    }
  }

  private getMockResponse(userMessage: string): string {
    if (this.messages.length <= 2) {
      return "Oie! Como posso te ajudar hoje? Seja direto no tipo de questão que você precisa de ajuda, pra eu poder te ajudar da melhor forma possível te indicando a energia certa pro seu caso."
    }

    const responses = [
      "Entendi sua preocupação. Temos alguns oraculistas especializados que podem te ajudar com isso:",
      "Baseado no que você me contou, posso te recomendar alguns de nossos melhores oraculistas:",
      "Para sua situação, temos algumas opções excelentes:"
    ]

    const oraculistas = [
      "\n\n- A **Cigana Flora** trabalha com baralho cigano e tem uma abordagem mais intuitiva. A consulta está em promoção por R$13.",
      "\n\n- O **Mago Negro** usa o tarot dos daemons e é mais direto e prático. A consulta com ele está por R$17.",
      "\n\n- A **Vó Cleusa** é especialista em destino e missão de vida, usando o tarot dos anjos. A consulta está por R$20."
    ]

    return responses[Math.floor(Math.random() * responses.length)] + 
           oraculistas.join('') +
           "\n\nQual você prefere? [CONSULTAR:Cigana Flora] [CONSULTAR:Mago Negro] [CONSULTAR:Vó Cleusa]"
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
