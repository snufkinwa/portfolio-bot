import type { Message } from "ai";
import { generateChatResponse } from "@/lib/chat-model";

export async function POST(req: Request) {
  try {
    const { messages, id }: { messages: Message[]; id?: string } =
      await req.json();

    // Get or create a session ID
    const sessionId = id || "default-session";

    // Generate a response using streamText
    const result = await generateChatResponse(messages, sessionId);

    // Return the response as a data stream
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response("An error occurred during the conversation", {
      status: 500,
    });
  }
}
