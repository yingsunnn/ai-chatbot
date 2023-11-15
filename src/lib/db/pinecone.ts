import { Pinecone } from "@pinecone-database/pinecone";

const apiKey = process.env.PINECONE_API_KEY;

if (!apiKey) {
  throw Error("PINECONE_API_KEY doesn't exist.");
}

const pinecone = new Pinecone({
  environment: "gcp-starter",
  apiKey
});

export const notesIndex = pinecone.Index("chatbot");
