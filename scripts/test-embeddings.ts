import "dotenv/config";
import { Pinecone } from "@pinecone-database/pinecone";

const INDEX_NAME = "resume-embeddings";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "",
});

async function testEmbeddings() {
  try {
    const index = pinecone.index(INDEX_NAME);

    const queryResponse = await index.query({
      vector: Array(1536).fill(0),
      topK: 100,
      includeMetadata: true,
    });

    const formattedResults = queryResponse.matches.map((match) => ({
      topic_id: match.metadata?.topic_id,
      suggestion: match.metadata?.suggestion,
    }));

    console.table(formattedResults);
    console.log(
      `Found ${formattedResults.length} embeddings in Pinecone index.`
    );
  } catch (error) {
    console.error("Error testing embeddings:", error);
  }
}

testEmbeddings().catch(console.error);
