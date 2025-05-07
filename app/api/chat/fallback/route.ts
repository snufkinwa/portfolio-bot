import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { retrieveDocuments, formatDocumentsAsString } from "@/lib/retrieval";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Get the last user message for retrieval
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    const query = lastUserMessage?.content.toString() || "";

    // Retrieve relevant documents
    const relevantDocs = await retrieveDocuments(query);
    const contextText = formatDocumentsAsString(relevantDocs);

    // Create a system message with context
    const systemMessage = `You are Janay Harris's AI portfolio assistant. You help people learn about Janay's background, skills, projects, and experience.
Use the following information to answer questions about Janay. Be friendly, professional, conversational, and personable.

${contextText}

If you don't know the answer to a question, you can say you don't have that information about Janay yet.`;

    // Use streamText instead of OpenAIStream and StreamingTextResponse
    const result = streamText({
      model: openai("gpt-3.5-turbo-0125"),
      system: systemMessage,
      messages,
    });

    // Return the response as a data stream
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response("An error occurred during the conversation", {
      status: 500,
    });
  }
}
