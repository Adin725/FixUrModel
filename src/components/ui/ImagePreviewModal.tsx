"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { mapClassLabelToNumeric } from "@/lib/evaluator";
import { X, Image as ImageIcon, Database, Check } from "lucide-react";

export const ImagePreviewModal: React.FC = () => {
  const { previewImageModalId, setPreviewImageModalId, dataset, imageMap } =
    useAppStore();

  if (previewImageModalId === null) return null;

  const item = dataset.find((d) => d.id === previewImageModalId) || {
    id: previewImageModalId,
    imageNumber: previewImageModalId,
    groundTruthLabel: "Recyclable" as const,
  };

  const numericCode = mapClassLabelToNumeric(item.groundTruthLabel);
  const realImageUrl = imageMap[previewImageModalId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <ImageIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Preview Gambar Test ID #{item.id}
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                File: {item.imageNumber}.jpg
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPreviewImageModalId(null)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center bg-zinc-100 p-6 dark:bg-zinc-950 min-h-[300px]">
          {realImageUrl ? (
            <img
              src={realImageUrl}
              alt={`Gambar ID #${item.id}`}
              className="max-h-80 w-auto rounded-xl object-contain shadow-md"
            />
          ) : (
            <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-white/70 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
              <ImageIcon className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
              <p className="mt-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Gambar asli belum diunggah via file ZIP Data Test
              </p>
              <p className="mt-1 text-[11px] text-zinc-400">
                Menampilkan placeholder untuk ID #{item.id} ({item.imageNumber}.jpg)
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-zinc-100 bg-zinc-50/60 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-500">
              Label Ground Truth:
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-mono">
              <Check className="h-3.5 w-3.5 text-blue-600" />
              Angka {numericCode} ({item.groundTruthLabel})
            </span>
          </div>

          <button
            type="button"
            onClick={() => setPreviewImageModalId(null)}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Tutup Preview
          </button>
        </div>
      </div>
    </div>
  );
};
