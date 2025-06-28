"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
import Image from "next/image";
import React, { FormEvent, useState } from "react";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import MDEditor from "@uiw/react-md-editor";
import CodeRefrences from "./code-refrences";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";

const AskQuestionCard = () => {
  const { project } = useProject();

  const saveAnswer = api.project.saveAnswer.useMutation();

  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");

  const [fileReferences, setFileReferences] = useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setAnswer("");

    setFileReferences([]);

    if (!project?.id) return;

    setLoading(true);

    const { output, fileReferences } = await askQuestion(question, project.id);

    // const response = await askQuestion(question, project.id); // Await the function
    // const { fileReferences, output } = response; // Now destructure safely

    setOpen(true);

    setFileReferences(fileReferences);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((ans) => ans + delta);
      }
    }

    setLoading(false);
  };

  const refetch = useRefetch();

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-y-scroll sm:max-w-[75vw]">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <DialogTitle>
                <Image
                  src={"/intelligence.png"}
                  width={40}
                  height={40}
                  alt="GithubAI"
                />
              </DialogTitle>

              <Button
                onClick={() => {
                  saveAnswer.mutate(
                    {
                      projectId: project!.id,
                      question,
                      answer,
                      filesReferences: fileReferences,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Answer saved");

                        refetch();
                      },
                      onError: () => {
                        toast.error("failed to save answer");
                      },
                    },
                  );
                }}
                variant={"default"}
                disabled={saveAnswer.isPending}
              >
                Save answer
              </Button>
            </div>
          </DialogHeader>

          <MDEditor.Markdown
            source={answer}
            className="!h-full max-h-[40vh] max-w-[70vw] overflow-scroll !bg-white !text-black"
          />

          <div className="h-4"></div>

          <CodeRefrences fileRefrences={fileReferences} />

          <Button type="button" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>

      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to change about page"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="max-h-44"
            />

            <div className="h-4"></div>

            <Button type="submit" disabled={question.length === 0 || loading}>
              Ask GithubAI
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
