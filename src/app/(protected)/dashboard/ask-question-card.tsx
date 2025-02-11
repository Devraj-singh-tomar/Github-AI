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

const AskQuestionCard = () => {
  const { project } = useProject();

  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setOpen(true);

    window.alert(question);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <Image
                src={"/intelligence.png"}
                width={40}
                height={40}
                alt="GithubAI"
              />
            </DialogTitle>
          </DialogHeader>
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

            <Button type="submit">Ask GithubAI</Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
