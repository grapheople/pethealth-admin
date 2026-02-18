"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";

interface JsonViewerProps {
  data: unknown;
  label?: string;
}

export function JsonViewer({ data, label = "JSON" }: JsonViewerProps) {
  const [open, setOpen] = useState(false);

  if (data == null) return <span className="text-muted-foreground">-</span>;

  const preview =
    Array.isArray(data) ? `[${data.length}건]` : typeof data === "object" ? "{...}" : String(data);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="xs" className="gap-1 font-mono">
          <Eye className="size-3" />
          {preview}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>
        <pre className="overflow-auto rounded-md bg-muted p-4 text-xs max-h-[60vh]">
          {JSON.stringify(data, null, 2)}
        </pre>
      </DialogContent>
    </Dialog>
  );
}
