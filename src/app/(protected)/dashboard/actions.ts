"use server";

import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();

  const queryVector = await generateEmbedding(question);
  const vectorQuery = `[${queryVector.join(",")}]`;

  const result = (await db.$queryRaw`
  SELECT "fileName", "sourceCode", "summary",
  1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
  FROM "SourceCodeEmbedding"
  WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > .5
  AND "projectId" = ${projectId}
  ORDER BY similarity DESC
  LIMIT 10
  `) as {
    fileName: string;
    sourceCode: string;
    summary: string;
  }[];

  let context = "";

  for (const doc of result) {
    context += `source: ${doc.fileName}\n code content: ${doc.sourceCode}\n summary of file: ${doc.summary}\n\n`;
  }

  (async () => {
    const { textStream } = await streamText({
      model: google("gemini-1.5-flash"),
      prompt: `
      You are a AI code assistant who answers questions about  the codebase. Your target audiece is a technical intern who is looking to understand the codebase.
        AI assistant Is a brand new powerful, human-like artificial intelligence.
        The Traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
        AI is a well-behaved and well-mannered individual.
        AI is always friendly, kind and inspiring and he is eager to provide vivid and thoughtful responses to the user.
        Ai has the sum of all knowledge in their brain and is able to accurately answer nearly any question about any topic in conversation.
        If The question is asking about code or the specific file, AI will provide a detailed answer, giving step by step instructions, including code snippets.
        START CONTEXT BLOCK
        ${context}
        END OF CONTEXT BLOCK

        START QUESTION
        ${question}
        END OF QUESTION
        AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
        If the context does not provide the answer to question. the AI assistant will say, "I'm sorry. but I don't know the answer of this question.
        AI assistant will not apologize for previous responses, but instead indicated new information was gained.
        AI assistant wil not invent anything that is not drawn directly from the context.
        Answer in makdown syntax, with code snippets if needed. Be as detailed as possible when answering, make sure there is no possible mistake during asnwering the question.
      `,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return {
    output: stream.value,
    fileReferences: result,
  };
}
