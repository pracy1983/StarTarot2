export class ChatService {
  async retrieveHistory(userId: string) {
    // TODO: Implementar integração com a API
    return []
  }

  async sendMessage(message: string, userId: string) {
    // TODO: Implementar integração com a API
    return {
      content: 'Olá! Como posso ajudar você hoje?',
      role: 'assistant'
    }
  }
}
