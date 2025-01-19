// Definindo também o tipo para as mensagens da API
export interface ApiMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  role: 'user' | 'assistant' | 'system';
}
