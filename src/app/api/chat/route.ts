import { notesIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import openai, { getEmbedding } from "@/lib/openai";
import { auth } from "@clerk/nextjs";
import { ChatCompletionMessage } from "openai/resources/index.mjs";
import { OpenAIStream, StreamingTextResponse } from "ai";

export async function POST(req: Request) {
  try {
    console.log("Start sending openai request.");
    const body = await req.json();
    console.log("body: ", JSON.stringify(body));
    const messages: ChatCompletionMessage[] = body.messages;

    console.log("messages: ", JSON.stringify(messages));

    const messageTruncated = messages.slice(-6);

    const embedding = await getEmbedding(
      messageTruncated.map((message) => message.content).join("\n"),
    );

    const { userId } = auth();

    const vectorQueryResponse = await notesIndex.query({
      vector: embedding,
      topK: 1,
      filter: { userId },
    });

    console.log("vectorQueryResponse: ", JSON.stringify(vectorQueryResponse));

    const relevantNotes = await prisma.note.findMany({
      where: {
        id: {
          in: vectorQueryResponse.matches.map((match) => match.id),
        },
      },
    });

    console.log("Relevant notes found: ", relevantNotes);

    const systemMessage: ChatCompletionMessage = {
      role: "assistant",
      content:
        "Your are an intelligent note-taking app. You answer the user's questions based on their existing notes." +
        "The relevant notes for this query are:\n" +
        relevantNotes
          .map((note) => `Title: ${note.title}\n\nContent:\n${note.content}`)
          .join("\n\n"),
    };

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [systemMessage, ...messageTruncated],
    });

    const stream = OpenAIStream(response);

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
