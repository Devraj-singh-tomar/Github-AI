"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { InfoIcon } from "lucide-react";
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

  const checkCredits = api.project.checkCredits.useMutation();

  const hasEnoughCredits = checkCredits?.data?.userCredits
    ? checkCredits.data.fileCount <= checkCredits.data.userCredits
    : true;

  const refetch = useRefetch();

  function onSubmit(data: FormInput) {
    // window.alert(JSON.stringify(data));

    if (!!checkCredits.data) {
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
    } else {
      checkCredits.mutate({
        githubUrl: data.repoUrl,
        githubToken: data.githubToken,
      });
    }
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

            {!!checkCredits.data && (
              <>
                <div className="mt-4 rounded-md border bg-orange-100 px-4 py-2 text-purple-800">
                  <div className="flex items-center gap-2">
                    <InfoIcon className="size-4" />

                    <p className="text-sm">
                      You will be charged{" "}
                      <strong>{checkCredits.data?.fileCount}</strong> credits
                      for this repo.
                    </p>
                  </div>

                  <div className="text-sm">
                    You have <strong>{checkCredits.data?.userCredits}</strong>{" "}
                    credits remaining
                  </div>
                </div>
              </>
            )}

            <div className="h-4"></div>

            <p className="mb-2 text-sm text-gray-500">
              check credits and then create project
            </p>

            <Button
              type="submit"
              className="w-full"
              disabled={
                createProject.isPending ||
                checkCredits.isPending ||
                !hasEnoughCredits
              }
            >
              {!!checkCredits.data ? "Create Project" : "Check credits"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
