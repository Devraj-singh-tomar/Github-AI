import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summarizeCode } from "./gemini";
import { db } from "@/server/db";
import { Octokit } from "octokit";

const getFileCount = async (
  path: string,
  octokit: Octokit,
  githubOwner: string,
  githubRepo: string,
  acc: number = 0,
) => {
  const { data } = await octokit.rest.repos.getContent({
    owner: githubOwner,
    repo: githubRepo,
    path,
  });

  if (!Array.isArray(data) && data.type === "file") {
    return acc + 1;
  }

  if (Array.isArray(data)) {
    let fileCount = 0;

    const directories: string[] = [];

    for (const item of data) {
      if (item.type === "dir") {
        directories.push(item.path);
      } else {
        fileCount++;
      }
    }

    if (directories.length > 0) {
      const directoryCount = await Promise.all(
        directories.map((dirPath) =>
          getFileCount(dirPath, octokit, githubOwner, githubRepo, 0),
        ),
      );

      fileCount += directoryCount.reduce((acc, count) => acc + count, 0);
    }

    return fileCount + acc;
  }

  return acc;
};

export const checkCredits = async (githubUrl: string, githubToken?: string) => {
  // find out how many files are in the repo

  const octokit = new Octokit({ auth: githubToken });

  const githubOwner = githubUrl.split("/")[3];
  const githubRepo = githubUrl.split("/")[4];

  if (!githubOwner || !githubRepo) {
    return 0;
  }

  const fileCount = await getFileCount("", octokit, githubOwner, githubRepo, 0);

  return fileCount;
};

export const loadGithubRepository = async (
  githubUrl: string,
  githubToken?: string,
) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || "",
    branch: "master",
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });

  const docs = await loader.load();

  return docs;
};
// console.log(
//   await loadGithubRepository(
//     "https://github.com/Devraj-singh-tomar/react-project-1",
//   ),
// );

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) => {
  const docs = await loadGithubRepository(githubUrl, githubToken);

  const allEmbeddings = await generateEmbeddings(docs);

  await Promise.allSettled(
    allEmbeddings.map(async (embedding, index) => {
      console.log(`processing ${index} of ${allEmbeddings.length}`);

      if (!embedding) return;

      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          summary: embedding.summary,
          sourceCode: embedding.sourceCode,
          fileName: embedding.fileName,
          projectId,
        },
      });

      await db.$executeRaw`
      UPDATE "SourceCodeEmbedding"
      SET "summaryEmbedding" = ${embedding.embedding}::vector
      WHERE "id" = ${sourceCodeEmbedding.id}
      `;
    }),
  );
};

const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(
    docs.map(async (doc) => {
      const summary = await summarizeCode(doc);

      const embedding = await generateEmbedding(summary);

      return {
        summary,
        embedding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
        fileName: doc.metadata.source,
      };
    }),
  );
};

// =======================================================

// export const loadGithubRepository = async (
//   githubUrl: string,
//   githubToken?: string,
// ) => {
//   try {
//     console.log(`Loading repository: ${githubUrl}`);

//     const loader = new GithubRepoLoader(githubUrl, {
//       accessToken: githubToken || "",
//       branch: "master", // Consider checking if this should be "main"
//       ignoreFiles: [
//         "package-lock.json",
//         "yarn.lock",
//         "pnpm-lock.yaml",
//         "bun.lockb",
//       ],
//       recursive: true,
//       unknown: "warn",
//       maxConcurrency: 2, // Reduce to avoid rate limits
//     });

//     const docs = await loader.load();
//     console.log(`Successfully loaded ${docs.length} documents`);

//     // Log first few files to see what's being loaded
//     docs.slice(0, 5).forEach((doc, index) => {
//       console.log(`File ${index + 1}: ${doc.metadata?.source}`);
//     });

//     return docs;
//   } catch (error) {
//     console.error("Error in loadGithubRepository:", error);
//     throw error;
//   }
// };

// export const indexGithubRepo = async (
//   projectId: string,
//   githubUrl: string,
//   githubToken?: string,
// ) => {
//   try {
//     const docs = await loadGithubRepository(githubUrl, githubToken);
//     console.log(`Repository loaded with ${docs.length} files`);

//     if (docs.length === 0) {
//       console.warn("No documents were loaded from the repository");
//       return;
//     }

//     const allEmbeddings = await generateEmbeddings(docs);
//     console.log(`Generated ${allEmbeddings.length} embeddings`);

//     const results = await Promise.allSettled(
//       allEmbeddings.map(async (embedding, index) => {
//         console.log(`Saving to DB: ${index + 1} of ${allEmbeddings.length}`);

//         if (!embedding) {
//           console.warn(`Skipping null embedding at index ${index}`);
//           return;
//         }

//         try {
//           const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
//             data: {
//               summary: embedding.summary,
//               sourceCode: embedding.sourceCode,
//               fileName: embedding.fileName,
//               projectId,
//             },
//           });

//           await db.$executeRaw`
//             UPDATE "SourceCodeEmbedding"
//             SET "summaryEmbedding" = ${embedding.embedding}::vector
//             WHERE "id" = ${sourceCodeEmbedding.id}
//           `;

//           console.log(`Successfully saved: ${embedding.fileName}`);
//         } catch (dbError) {
//           console.error(`Database error for ${embedding.fileName}:`, dbError);
//           throw dbError;
//         }
//       }),
//     );

//     const successful = results.filter((r) => r.status === "fulfilled").length;
//     const failed = results.filter((r) => r.status === "rejected").length;

//     console.log(
//       `Database insertion complete: ${successful} successful, ${failed} failed`,
//     );
//   } catch (error) {
//     console.error("Error in indexGithubRepo:", error);
//     throw error;
//   }
// };

// const generateEmbeddings = async (docs: Document[]) => {
//   console.log(`Generating embeddings for ${docs.length} documents`);

//   const results = await Promise.allSettled(
//     docs.map(async (doc, index) => {
//       try {
//         console.log(
//           `Processing document ${index + 1}/${docs.length}: ${doc.metadata?.source}`,
//         );

//         const summary = await summarizeCode(doc);
//         const embedding = await generateEmbedding(summary);

//         return {
//           summary,
//           embedding,
//           sourceCode: doc.pageContent, // Remove JSON.parse/stringify - not needed
//           fileName: doc.metadata.source,
//         };
//       } catch (error) {
//         console.error(`Error processing document ${index + 1}:`, error);
//         return null;
//       }
//     }),
//   );

//   // Filter out failed results
//   const successfulResults = results
//     .filter(
//       (result): result is PromiseFulfilledResult<any> =>
//         result.status === "fulfilled" && result.value !== null,
//     )
//     .map((result) => result.value);

//   console.log(
//     `Successfully processed ${successfulResults.length} out of ${docs.length} documents`,
//   );
//   return successfulResults;
// };
