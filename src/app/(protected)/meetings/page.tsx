"use client";

import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";
import MeetingCard from "../dashboard/meeting-card";
import { Loader2Icon, LoaderIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";

const MeetingsPage = () => {
  const { projectId } = useProject();

  const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
    {
      projectId,
    },
    {
      refetchInterval: 5000,
    },
  );

  const deleteMeeting = api.project.deleteMeeting.useMutation();

  const refetch = useRefetch();

  return (
    <>
      <MeetingCard />
      <div className="h-6"></div>
      <h1 className="text-xl font-semibold">Meetings</h1>

      {meetings && meetings.length === 0 && (
        <div className="text-center">No meetings found</div>
      )}

      {isLoading && (
        <div className="mt-5 flex items-center justify-center">
          <Loader2Icon className="size-10 animate-spin" />
        </div>
      )}

      <ul className="divide-y divide-gray-400">
        {meetings?.map((meeting) => (
          <li
            key={meeting.id}
            className="flex items-center justify-between gap-x-6 py-5"
          >
            <div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/meetings/${meeting.id}`}
                    target="_blank"
                    className="text-sm font-semibold"
                  >
                    {meeting.name}
                  </Link>

                  {meeting.status === "PROCESSING" && (
                    <Badge className="">
                      Processing{" "}
                      <LoaderIcon className="ml-1 size-4 animate-spin" />
                    </Badge>
                  )}

                  {meeting.status === "COMPLETED" && (
                    <Badge className="bg-green-600/95">Completed</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-x-2 text-xs text-gray-600">
                <p className="whitespace-nowrap">
                  {meeting.createdAt.toLocaleDateString()}
                </p>

                <p className="truncate">{meeting.issues.length} issues</p>
              </div>
            </div>

            <div className="flex flex-none items-center gap-x-4">
              <Link href={`/meetings/${meeting.id}`}>
                <Button size={"sm"} variant={"default"}>
                  View meeting
                </Button>
              </Link>

              <Button
                size={"sm"}
                title="delete meeting"
                variant={"destructive"}
                disabled={deleteMeeting.isPending}
                onClick={() =>
                  deleteMeeting.mutate(
                    { meetingId: meeting.id },
                    {
                      onSuccess: () => {
                        toast.success("Meeting deleted successfully");

                        refetch();
                      },
                    },
                  )
                }
              >
                <Trash2Icon className="" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default MeetingsPage;
