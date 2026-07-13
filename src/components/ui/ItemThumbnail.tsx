"use client";

import React from "react";
import { ClassLabel } from "@/types";
import { mapClassLabelToNumeric } from "@/lib/evaluator";
import { Hash } from "lucide-react";

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
  const numericCode = mapClassLabelToNumeric(label);

  const sizeClasses = {
    sm: "h-11 px-2.5 text-[11px]",
    md: "h-13 px-3.5 text-xs",
    lg: "h-16 px-4 text-sm",
  }[size];

  const badgeColor =
    numericCode === 0
      ? "bg-emerald-600 text-white border-emerald-500/30"
      : numericCode === 1
      ? "bg-amber-600 text-white border-amber-500/30"
      : "bg-red-600 text-white border-red-500/30";

  return (
    <div
      className={`group relative flex items-center justify-between gap-2 overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100/90 dark:border-zinc-800 dark:bg-zinc-900/90 ${sizeClasses}`}
      title={`Sampel ID #${id} (${imageNumber}.jpg) - Ground Truth: Angka ${numericCode} (${label})`}
    >
      <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-200">
        <Hash className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
        <span className="font-mono font-bold tracking-tight">
          {id}
        </span>
      </div>

      <div
        className={`rounded-md px-1.5 py-0.5 text-[10px] font-mono font-bold shadow-xs ${badgeColor}`}
      >
        GT: {numericCode}
      </div>
    </div>
  );
};
