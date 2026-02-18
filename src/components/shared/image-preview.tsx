"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ImagePreviewProps {
  src: string | null;
  alt?: string;
  size?: number;
}

export function ImagePreview({
  src,
  alt = "이미지",
  size = 40,
}: ImagePreviewProps) {
  const [open, setOpen] = useState(false);

  if (!src) return <span className="text-muted-foreground">-</span>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="overflow-hidden rounded border hover:opacity-80 transition-opacity">
          <Image
            src={src}
            alt={alt}
            width={size}
            height={size}
            className="object-cover"
            style={{ width: size, height: size }}
          />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg p-2">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <Image
          src={src}
          alt={alt}
          width={600}
          height={600}
          className="w-full h-auto rounded"
        />
      </DialogContent>
    </Dialog>
  );
}
