import { BufferMemory } from "langchain/memory";

// In-memory store
// Might upgrade to a database
const memoryStore: Record<string, BufferMemory> = {};

export function getMemory(sessionId: string): BufferMemory {
  if (!memoryStore[sessionId]) {
    memoryStore[sessionId] = new BufferMemory({
      returnMessages: true,
      memoryKey: "chat_history",
      inputKey: "question",
    });
  }

  return memoryStore[sessionId];
}
