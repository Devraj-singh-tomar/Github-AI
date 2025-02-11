import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const aiSummarizeCommit = async (diff: string) => {
  const response = await model.generateContent([
    `you are an expert programmer, and you are trying to summarize a git diff.
      Reminders about the git diff format:
      for every file, there are a few metadata lines, like (for example):
      \`\`\`
      diff --git a/lib/index.js b/lib/index.js
      index aadf891..bfef603 100644
      --- a/lib/index.js
      +++ b/lib/index.js
      \`\`\`
      This means that \`lib/index.js\` was Modifiedin this commitnote that this is only an example.
      Then there is a specifier of the lines that were modified.
      A Line starting with \`+\` means it was added.
      A Line that starting with \`-\` means that line  was deleted.
      A Line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
      It is not part of the diff.
      [...]
      EXAMPLE SUMMARY COMMENTS:
      \`\`\`
      * Raise the amount of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts], [packages/server/constants.ts]
      * Fixed a typo in the github action name [.github/workflows/gpt-summarizer.yml]
      * Add an openAI api for completions [packages/utils/apis/apenai.ts]
      * Lowered numeric tolerance for test files
      \`\`\`
      Most commits will have less comments than these examples list.
      The last commentdoes not include the file names.
      Because there were more than two relevant files in the hypothetical commit.
      Do not include parts of the example in your summary.
      It is given only as an example of appropriate comments.`,
    `Please summarise the following diff file: \n\n${diff}`,
  ]);

  return response.response.text();
};

export async function summarizeCode(doc: Document) {
  console.log("getting summary fro", doc.metadata.source);

  try {
    // limit to 10000 characters ==================================
    const code = doc.pageContent.slice(0, 10000);

    const response = await model.generateContent([
      `You are an intelligent senior software engineer who specialises junior software engineers onto projects`,
      `You arre onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file 
    Here is the code:
    ---
    ${code}
    ---
          Give a summary no more than 120 words of the code above`,
    ]);

    return response.response.text();
  } catch (error) {
    return "";
  }
}

export async function generateEmbedding(summary: string) {
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });

  const result = await model.embedContent(summary);

  const embedding = result.embedding;

  return embedding.values;
}
// console.log(await generateEmbedding("hello world"));
