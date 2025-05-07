import type { Message } from "ai"
import { generateId } from "ai"

// In-memory store for demo purposes
// In a real app, you'd use a database
const chatStore: Record<string, Message[]> = {}

export async function createChat(): Promise<string> {
  const id = generateId()
  chatStore[id] = []
  return id
}

export async function getChats(): Promise<{ id: string; messages: Message[] }[]> {
  return Object.entries(chatStore).map(([id, messages]) => ({
    id,
    messages,
  }))
}

export async function getChat(id: string): Promise<Message[]> {
  return chatStore[id] || []
}

export async function saveChat(id: string, messages: Message[]): Promise<void> {
  chatStore[id] = messages
}
