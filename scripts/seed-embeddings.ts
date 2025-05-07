import "dotenv/config";
import { embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { v4 as uuidv4 } from "uuid";
import { Pinecone } from "@pinecone-database/pinecone";
import resumeData from "./resume-data.json";

const MAX_DIMENSIONS = 1536; // text-embedding-3-small has 1536 dimensions
const INDEX_NAME = "resume-embeddings";

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

type ResumeChunk = {
  topic_id: string;
  text: string;
  suggestion?: string;
};

function generateResumeChunks(): ResumeChunk[] {
  const grouped: Record<string, string[]> = {
    about: [],
    education: [],
    experience: [],
    professional_development: [],
    projects: [],
    skills: [],
    "ai-ml": [],
    blockchain: [],
    systems: [],
    certification: [],
    awards: [],
    memberships: [],
    personality: [],
  };

  for (const item of resumeData) {
    switch (item.type) {
      case "personal_info":
        grouped.about.push(
          `Name: ${item.name}\nLinkedIn: ${item.linkedin}\nGitHub: ${item.github}\nSummary: ${item.summary}`
        );
        break;
      case "background_summary":
        if ("text" in item && typeof item.text === "string") {
          grouped.about.push(item.text);
        }
        break;
      case "education":
        grouped.education.push(
          `${item.degree ?? item.program ?? ""} - ${item.institution ?? ""} (${
            item.date_range ?? ""
          })`
        );
        break;
      case "experience":
        const description = Array.isArray(item.description)
          ? item.description.join("\n")
          : item.description ?? "";
        grouped.experience.push(
          `${item.position ?? ""} at ${item.company ?? ""} (${
            item.date_range ?? ""
          }):\n${description}`
        );
        break;
      case "training":
        const trainingDesc = Array.isArray(item.description)
          ? item.description.join("\n")
          : item.description ?? "";
        grouped.professional_development.push(
          `${item.position ?? ""} at ${item.company ?? ""} (${
            item.date_range ?? ""
          }):\n${trainingDesc}`
        );
        break;

      case "project":
        const projectDescription = Array.isArray(item.description)
          ? item.description.join("\n")
          : item.description ?? "";
        const technologies = Array.isArray(item.technologies)
          ? item.technologies.join(", ")
          : "";
        grouped.projects.push(
          `${item.name ?? ""} (${technologies}):\n${projectDescription}`
        );
        break;
      case "technical_skills":
        const proficient = Array.isArray(item.proficient)
          ? item.proficient.join(", ")
          : "";
        const familiar = Array.isArray(item.familiar)
          ? item.familiar.join(", ")
          : "";
        const experience = Array.isArray(item.experience)
          ? item.experience.join(", ")
          : "";
        const tech = Array.isArray(item.technologies)
          ? item.technologies.join(", ")
          : "";
        grouped.skills.push(
          `Proficient: ${proficient}\nFamiliar: ${familiar}\nExperience: ${experience}\nTechnologies: ${tech}`
        );
        break;
      case "ai_ml_experience":
        grouped["ai-ml"].push(item.name ?? "");
        break;
      case "blockchain_experience":
        grouped.blockchain.push(item.name ?? "");
        break;
      case "systems_programming_experience":
        grouped.systems.push(item.name ?? "");
        break;
      case "certification":
        grouped.certifications = grouped.certifications || [];
        grouped.certifications.push(
          `CERTIFICATION: ${item.name ?? ""} - ${
            item.issuer ?? "Unknown Issuer"
          } (${item.date ?? "No Date"})`
        );
        break;

      case "honor_award":
        grouped.awards = grouped.awards || [];
        grouped.awards.push(
          `AWARD: ${item.name ?? ""} - ${item.issuer ?? "Unknown Issuer"} (${
            item.date ?? "No Date"
          }). ${item.details ?? ""}`
        );
        break;

      case "membership":
        grouped.memberships.push(
          `${item.organization} (${
            item.date_range ?? item.date ?? ""
          })\nRole: ${item.role ?? ""}`
        );
        break;
      case "personality":
        if (
          item.type === "personality" &&
          (Array.isArray((item as any).skills) ||
            Array.isArray((item as any).strengths))
        ) {
          const softSkills = Array.isArray((item as any).skills)
            ? `Soft Skills: ${(item as any).skills.join(", ")}`
            : "";
          const strengths = Array.isArray((item as any).strengths)
            ? `Key Strengths: ${(item as any).strengths.join(", ")}`
            : "";

          const combined = [softSkills, strengths].filter(Boolean).join("\n");
          if (combined) grouped.personality.push(combined);
        }
        break;
      default:
        console.warn(`⚠️ Unrecognized item type: ${item.type}`);
        break;
    }
  }

  return Object.entries(grouped)
    .filter(([_, entries]) => entries.length > 0)
    .map(([topic_id, entries]) => ({
      topic_id,
      text: entries.join("\n\n").trim(),
    }))
    .filter((chunk) => !!chunk.text && chunk.text.length > 0);
}

async function createIndexIfNotExists() {
  const indexList = await pinecone.listIndexes();

  if (!indexList.indexes?.find((index) => index.name === INDEX_NAME)) {
    console.log(`Creating index: ${INDEX_NAME}`);

    await pinecone.createIndex({
      name: INDEX_NAME,
      dimension: MAX_DIMENSIONS,
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });

    // Wait for index initialization (can take up to 1-2 minutes)
    console.log("Waiting for index initialization...");
    let isReady = false;
    while (!isReady) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const indexDescription = await pinecone.describeIndex(INDEX_NAME);
      isReady = indexDescription.status?.ready === true;
      if (!isReady) {
        console.log("Index still initializing, waiting...");
      }
    }
    console.log("Index is ready!");
  } else {
    console.log(`Index ${INDEX_NAME} already exists.`);
  }

  return pinecone.index(INDEX_NAME);
}

async function seedEmbeddings() {
  const index = await createIndexIfNotExists();

  // Generate resume chunks
  const chunks = generateResumeChunks();
  const texts = chunks
    .map((chunk) => chunk.text?.trim())
    .filter((text) => !!text && text.length > 0);

  console.log(`Generating embeddings for ${texts.length} chunks...`);

  // Generate embeddings
  const { embeddings } = await embedMany({
    model: openai.embedding("text-embedding-3-small"),
    values: texts,
  });

  console.log("Embeddings generated, upserting to Pinecone...");

  // Prepare records for Pinecone
  const records = chunks
    .map((chunk, i) => {
      const { topic_id, text } = chunk;
      const embedding = embeddings[i];

      if (!embedding || !text?.trim()) return null;

      return {
        id: `resume-${topic_id}-${i}`,
        values: embedding,
        metadata: {
          text,
          topic_id,
        },
      };
    })
    .filter((record) => record !== null);

  // Upsert records in batches of 100
  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await index.upsert(batch);
    console.log(
      `Upserted batch ${i / batchSize + 1} of ${Math.ceil(
        records.length / batchSize
      )}`
    );
  }

  console.log("✅ Embeddings seeded into Pinecone.");
}

seedEmbeddings().catch(console.error);
