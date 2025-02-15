"use client";

import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import React from "react";
import { toast } from "sonner";

const ArchiveButton = () => {
  const { projectId } = useProject();

  const archiveProject = api.project.archiveProject.useMutation();

  const refetch = useRefetch();

  return (
    <Button
      variant={"destructive"}
      size={"sm"}
      disabled={archiveProject.isPending}
      onClick={() => {
        const confirm = window.confirm("are you sure to archive this project");

        if (confirm)
          archiveProject.mutate(
            { projectId },
            {
              onSuccess: () => {
                toast.success("project archived");
                refetch();
              },
              onError: () => {
                toast.error("failed to archive this project");
              },
            },
          );
      }}
    >
      Archive
    </Button>
  );
};

export default ArchiveButton;
