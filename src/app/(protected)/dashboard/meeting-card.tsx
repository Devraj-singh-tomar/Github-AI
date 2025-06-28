"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { uploadFile } from "@/lib/firebase";
import { MonitorIcon, UploadCloudIcon } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { api } from "@/trpc/react";
import useProject from "@/hooks/use-project";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const MeetingCard = () => {
  const { project } = useProject();
  const router = useRouter();

  const processMeeting = useMutation({
    mutationFn: async (data: {
      meetingUrl: string;
      meetingId: string;
      projectId: string;
    }) => {
      const { meetingId, meetingUrl, projectId } = data;

      const response = await axios.post("/api/process-meeting", {
        meetingUrl,
        meetingId,
        projectId,
      });

      return response.data;
    },
  });

  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadMeeting = api.project.uploadMeeting.useMutation();

  const { getInputProps, getRootProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a"],
    },
    multiple: false,
    maxFiles: 50_000_000,

    onDrop: async (acceptedFiles) => {
      if (!project) return;

      setIsUploading(true);
      // console.log(acceptedFiles);
      const file = acceptedFiles[0];

      if (!file) return;

      const downloadURL = (await uploadFile(
        file as File,
        setProgress,
      )) as string;

      uploadMeeting.mutate(
        {
          projectId: project.id,
          meetingUrl: downloadURL,
          name: file?.name,
        },
        {
          onSuccess: (meeting) => {
            toast.success("Meeting uploaded successfully");

            router.push("/meetings");

            processMeeting.mutateAsync({
              meetingUrl: downloadURL,
              meetingId: meeting.id,
              projectId: project.id,
            });
          },
          onError: () => {
            toast.error("Failed to upload");
          },
        },
      );

      setIsUploading(false);
    },
  });

  return (
    <Card
      className="col-span-2 flex flex-col items-center justify-center"
      {...getRootProps()}
    >
      {isUploading ? (
        <div className="flex flex-col items-center">
          <CircularProgressbar
            value={progress}
            text={`${progress}%`}
            className="mb-3 size-10"
            styles={buildStyles({
              pathColor: "#7C3AED",
              textColor: "#7C3AED",
              textSize: "0px",
            })}
          />

          <p className="text-center text-sm text-gray-500">
            {`${progress}%`} Uploading your meeting
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-4">
          <MonitorIcon className="h-10 w-10 animate-pulse" />

          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Create a new meeting
          </h3>

          <p className="mt-1 text-center text-xs text-gray-500">
            Analyse your meeting with GithubAI
          </p>

          <div className="mt-4">
            <Button disabled={isUploading}>
              <UploadCloudIcon className="-ml-0.5 mr-0.5 size-4" />
              Upload Meeting
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MeetingCard;

{
  /* {!isUploading && (
        <>
          <MonitorIcon className="h-10 w-10 animate-pulse" />

          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Create a new meeting
          </h3>

          <p className="mt-1 text-center text-xs text-gray-500">
            Analyse your meeting with GithubAI
          </p>

          <div className="mt-4">
            <Button disabled={isUploading}>
              <UploadCloudIcon className="-ml-0.5 mr-0.5 size-4" />
              Upload Meeting
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>
        </>
      )}

      {isUploading && (
        <div className="">
          <CircularProgressbar
            value={progress}
            text={`${progress}`}
            className="size-20"
          />

          <p className="text-center text-sm text-gray-500">
            Uploading your meeting
          </p>
        </div>
      )} */
}
