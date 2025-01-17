interface Message {
  role: 'user' | 'assistant'
  content: string
}

export class ChatService {
  async retrieveHistory(userId: string): Promise<Message[]> {
    // TODO: Implementar integração com a API
    return []
  }

  async sendMessage(message: string, userId: string): Promise<Message> {
    // TODO: Implementar integração com a API
    return {
      content: 'Olá! Como posso ajudar você hoje?',
      role: 'assistant' as const
    }
  }
}
