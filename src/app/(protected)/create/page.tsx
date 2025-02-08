"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();

  const createProject = api.project.createProject.useMutation();

  const refetch = useRefetch();

  function onSubmit(data: FormInput) {
    // window.alert(JSON.stringify(data));

    createProject.mutate(
      {
        githubUrl: data.repoUrl,
        name: data.projectName,
        githubToken: data.githubToken,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully");
          refetch();
          reset();
        },
        onError: () => {
          toast.error("Failed to create project");
        },
      },
    );

    return true;
  }

  return (
    <div className="flex h-full items-center justify-center gap-12">
      <img
        src="/undraw_dev-productivity_5wps.svg"
        alt="image"
        className="h-56 w-auto"
      />
      <div className="">
        <div className="">
          <h1 className="text-2xl font-semibold">
            Link your github repository
          </h1>

          <p className="text-sm text-muted-foreground">
            Enter the url of your respository to link it to github-AI
          </p>
        </div>

        <div className="h-4"></div>

        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("projectName", { required: true })}
              placeholder="Project name"
              required
            />

            <div className="h-2"></div>

            <Input
              {...register("repoUrl", { required: true })}
              placeholder="Repo url"
              type="url"
              required
            />

            <div className="h-2"></div>

            <Input
              {...register("githubToken")}
              placeholder="Github token (Optional)"
            />

            <div className="h-4"></div>

            <Button
              type="submit"
              className="w-full"
              disabled={createProject.isPending}
            >
              Create Project
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
