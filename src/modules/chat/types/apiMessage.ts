export interface ApiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
