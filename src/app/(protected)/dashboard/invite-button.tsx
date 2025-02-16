"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useProject from "@/hooks/use-project";
import { useState } from "react";
import { toast } from "sonner";

const InviteButton = () => {
  const { projectId } = useProject();

  const [open, setOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite members</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-500">
            Ask them to copy and paste the link (click to copy)
          </p>

          <Input
            className=""
            readOnly
            value={`${window.location.origin}/join/${projectId}`}
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/join/${projectId}`,
              );
              toast.success("Copied to clipboard");
            }}
          />
        </DialogContent>
      </Dialog>

      <Button size={"sm"} onClick={() => setOpen(true)}>
        Invite members
      </Button>
    </>
  );
};

export default InviteButton;
