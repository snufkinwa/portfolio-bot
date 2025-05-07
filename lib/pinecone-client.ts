import { Pinecone } from "@pinecone-database/pinecone";

let pineconeClient: Pinecone | null = null;

export async function getPineconeClient() {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }

  return pineconeClient;
}

export const PINECONE_INDEX_NAME =
  process.env.PINECONE_INDEX_NAME || "resume-embeddings";
