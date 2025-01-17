interface Message {
  role: 'user' | 'assistant'
  content: string
}

export class ChatService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async sendMessage(message: string, history: Message[]): Promise<string> {
    // Por enquanto, vamos retornar uma resposta mock
    // Em produção, isso seria uma chamada real à API do Deepseek
    const responses = [
      'Entendi sua necessidade. Posso recomendar uma consulta com um de nossos oraculistas especializados.',
      'Baseado no que você me contou, acho que o Baralho Cigano seria perfeito para sua situação.',
      'Os Daemons podem te ajudar muito com essa questão específica.',
      'O Oráculo dos Anjos seria uma excelente escolha para esse momento que você está vivendo.',
      'Que tal começarmos com uma consulta para entender melhor seu caminho?'
    ]

    // Simula um delay para parecer mais natural
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Retorna uma resposta aleatória
    return responses[Math.floor(Math.random() * responses.length)]
  }
}
