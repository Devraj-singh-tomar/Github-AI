"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React, { Fragment, useState } from "react";
import AskQuestionCard from "../dashboard/ask-question-card";
import MDEditor from "@uiw/react-md-editor";
import CodeRefrences from "../dashboard/code-refrences";

const QaPage = () => {
  const { projectId } = useProject();

  const { data: questions } = api.project.getQuestion.useQuery({ projectId });

  const [questionIndex, setQuestionIndex] = useState(0);

  const question = questions?.[questionIndex];

  return (
    <Sheet>
      <AskQuestionCard />

      <div className="h-4"></div>

      <h1 className="text-xl font-semibold">Saved questions</h1>

      <div className="h-2"></div>

      <div className="flex flex-col gap-2">
        {questions?.map((question, index) => {
          return (
            <Fragment key={question.id}>
              <SheetTrigger onClick={() => setQuestionIndex(index)}>
                <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow">
                  <img
                    src={question.user.imageUrl ?? ""}
                    alt="avatar"
                    className="rounded-full"
                    height={40}
                    width={40}
                  />

                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-gary-700 line-clamp-1 text-lg font-medium">
                        {question.question}
                      </p>

                      <span className="whitespace-nowrap text-xs text-gray-400">
                        {question.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gary-500 line-clamp-1 text-sm">
                      {question.answer}
                    </p>
                  </div>
                </div>
              </SheetTrigger>
            </Fragment>
          );
        })}
      </div>

      {question && (
        <SheetContent className="sm:max-w-[80vw]">
          <SheetHeader>
            <SheetTitle>{question.question}</SheetTitle>

            <MDEditor.Markdown
              source={question.answer}
              className="!bg-white !text-black"
            />

            <CodeRefrences
              fileRefrences={(question.filesReferences ?? []) as any}
            />
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  );
};

export default QaPage;
