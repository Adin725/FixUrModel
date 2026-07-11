"use client";

import React, { useEffect } from "react";
import { ClassLabel } from "@/types";
import { useAppStore } from "@/lib/store";
import { mapClassLabelToNumeric } from "@/lib/evaluator";
import { Image as ImageIcon } from "lucide-react";

interface ItemThumbnailProps {
  id: number;
  imageNumber: number;
  label: ClassLabel;
  size?: "sm" | "md" | "lg";
}

export const ItemThumbnail: React.FC<ItemThumbnailProps> = ({
  id,
  imageNumber,
  label,
  size = "md",
}) => {
  const { imageMap, setPreviewImageModalId, fetchImageById } = useAppStore();
  const realImage = imageMap[id];
  const numericCode = mapClassLabelToNumeric(label);

  useEffect(() => {
    if (!realImage) {
      fetchImageById(id);
    }
  }, [id, realImage, fetchImageById]);

  const sizeClasses = {
    sm: "h-11 w-11",
    md: "h-14 w-14",
    lg: "h-20 w-20",
  }[size];

  return (
    <button
      type="button"
      onClick={() => setPreviewImageModalId(id)}
      className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100 hover:border-blue-500 hover:shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900 ${sizeClasses}`}
      title={`Klik untuk lihat preview asli Gambar #${id} (${imageNumber}.jpg) - Label: Angka ${numericCode} (${label})`}
    >
      {realImage ? (
        <img
          src={realImage}
          alt={`#${id}`}
          loading="lazy"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-zinc-500">
          <ImageIcon className="h-4 w-4 text-zinc-400 group-hover:text-blue-500 transition-colors" />
          <span className="mt-0.5 text-[10px] font-mono font-bold">
            #{id}
          </span>
        </div>
      )}

      <div className="absolute bottom-0 right-0 rounded-tl-md bg-black/75 px-1 py-0.2 text-[9px] font-mono font-bold text-white">
        {numericCode}
      </div>
    </button>
  );
};

