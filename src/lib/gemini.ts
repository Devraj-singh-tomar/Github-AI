import { GoogleGenerativeAI } from "@google/generative-ai";

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
