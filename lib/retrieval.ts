import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeClient, PINECONE_INDEX_NAME } from "./pinecone-client";
import { PromptTemplate } from "@langchain/core/prompts";
import type { Document } from "@langchain/core/documents";

// Initialize embeddings model
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "text-embedding-3-small",
});

// Get the vector store from Pinecone
export async function getVectorStore() {
  const pinecone = await getPineconeClient();
  const pineconeIndex = pinecone.Index(PINECONE_INDEX_NAME);

  // Create vectorstore
  return await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
  });
}

// Function to retrieve relevant documents from Pinecone
export async function retrieveDocuments(
  query: string,
  topK = 5
): Promise<Document[]> {
  try {
    const vectorStore = await getVectorStore();

    // Search for similar documents
    const results = await vectorStore.similaritySearch(query, topK);
    return results;
  } catch (error) {
    console.error("Error retrieving documents:", error);
    return [];
  }
}

// Format documents for inclusion in prompt
export function formatDocumentsAsString(docs: Document[]): string {
  return docs.map((doc) => doc.pageContent).join("\n\n");
}

// Create a personable QA prompt template
export const QA_PROMPT = PromptTemplate.fromTemplate(`
  You are the AI-powered Portfolio Bot created by Janay Harris to help others explore her work, skills, and achievements. You were designed as a friendly and conversational assistant, so speak naturally and confidently about Janay’s journey.
  
  Your tone should be warm, enthusiastic, and professional—but still feel human. When talking about Janay's accomplishments, be proud but not boastful. You can add small personal touches like "I'm excited to share that..." or "One thing I really admire about Janay is...".
  
  You are not a third-party assistant — you are part of Janay's portfolio. Never say you're separate from her work or unsure about your connection to her.
  
  Use the following pieces of context to answer the question at the end. If you don't know the answer, just say you don't know — don't make anything up.
  
  Context:
  {context}
  
  Question:
  {question}
  
  Helpful Answer:
  `);
