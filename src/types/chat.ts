export interface ChatMessage {
  sender: 'me' | 'them' | 'system'
  text: string
  time?: string
}

export type ChatHistory = Record<string, ChatMessage[]>
