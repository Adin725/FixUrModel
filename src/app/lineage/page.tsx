"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Submission } from "@/types";
import {
  GitCommit,
  ArrowRight,
  Target,
  GitBranch,
} from "lucide-react";

interface TreeNode {
  submission: Submission;
  children: TreeNode[];
}

export default function ExperimentLineagePage() {
  const { submissions } = useAppStore();
  const [selectedSubId, setSelectedSubId] = useState<string | null>(
    submissions.length > 0 ? submissions[0].id : null
  );

  const treeRoots = useMemo(() => {
    const map = new Map<string, TreeNode>();
    submissions.forEach((s) => {
      map.set(s.id, { submission: s, children: [] });
    });

    const roots: TreeNode[] = [];
    submissions.forEach((s) => {
      const node = map.get(s.id)!;
      if (s.parentId && map.has(s.parentId)) {
        map.get(s.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [submissions]);

  const selectedSub = useMemo(() => {
    if (!selectedSubId) return null;
    return submissions.find((s) => s.id === selectedSubId) || null;
  }, [selectedSubId, submissions]);

  const renderTreeNode = (node: TreeNode, depth = 0) => {
    const { submission: sub, children } = node;
    const isSelected = selectedSubId === sub.id;
    const parentSub = sub.parentId
      ? submissions.find((p) => p.id === sub.parentId)
      : null;
    const deltaParent = parentSub
      ? (sub.testMacroF1 - parentSub.testMacroF1) * 100
      : 0;

    return (
      <div key={sub.id} className="relative">
        <div
          className={`group flex items-start gap-4 rounded-2xl border p-5 transition-all cursor-pointer ${
            isSelected
              ? "border-blue-600 bg-blue-600 text-white shadow-md dark:border-blue-500 dark:bg-blue-600"
              : "border-zinc-200/80 bg-white hover:border-blue-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          }`}
          style={{ marginLeft: `${depth * 32}px` }}
          onClick={() => setSelectedSubId(sub.id)}
        >
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-black ${
              isSelected
                ? "bg-white/20 text-white"
                : "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300"
            }`}
          >
            #{sub.rank}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-sm truncate">{sub.name}</span>
                {sub.isOfficial && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isSelected
                        ? "bg-white text-blue-600"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                    }`}
                  >
                    <Target className="h-3 w-3" />
                    <span>Official</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {parentSub && (
                  <span
                    className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-mono font-bold ${
                      deltaParent >= 0
                        ? isSelected
                          ? "bg-white/20 text-white"
                          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : isSelected
                        ? "bg-white/20 text-white"
                        : "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                    }`}
                  >
                    {deltaParent >= 0 ? "+" : ""}
                    {deltaParent.toFixed(2)}% vs Parent
                  </span>
                )}
                <span className="font-mono text-base font-black">
                  {(sub.testMacroF1 * 100).toFixed(2)}%
                </span>
              </div>
            </div>

            <div
              className={`mt-1 text-xs font-medium truncate ${
                isSelected ? "text-blue-100" : "text-zinc-500"
              }`}
            >
              Arsitektur: {sub.modelName} &bull; Pengirim: {sub.leaderboardName}
            </div>

            {sub.reasonOfRevision && (
              <div
                className={`mt-2.5 rounded-xl p-2.5 text-xs italic ${
                  isSelected
                    ? "bg-white/10 text-white"
                    : "bg-zinc-50 text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800"
                }`}
              >
                &ldquo;{sub.reasonOfRevision}&rdquo;
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-1.5">
              {sub.tags?.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-semibold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {children.length > 0 && (
          <div
            className="mt-3 space-y-3 border-l-2 border-blue-200 pl-4 dark:border-blue-900/60"
            style={{ marginLeft: `${depth * 32 + 18}px` }}
          >
            {children.map((c) => renderTreeNode(c, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800/80">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
            <GitBranch className="h-3.5 w-3.5" />
            <span>Silsilah Eksperimen Model</span>
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Experiment Lineage Tree Studio
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500">
            Peta evolusi percabangan eksperimen, revisi model, dan peningkatan Macro F1
          </p>
        </div>

        <Link
          href="/leaderboard"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
        >
          Kembali ke Leaderboard
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          Belum ada eksperimen dalam silsilah. Silakan unggah submission baru.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-4">
              {treeRoots.map((root) => renderTreeNode(root, 0))}
            </div>
          </div>

          <div className="sticky top-24 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900 space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
              <GitCommit className="h-4 w-4" />
              <span>Inspektor Silsilah Node Terpilih</span>
            </div>

            {selectedSub ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                    {selectedSub.name}
                  </h3>
                  <p className="text-xs font-semibold text-zinc-500">
                    {selectedSub.modelName} &bull; Oleh {selectedSub.leaderboardName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-950">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">
                      Test Macro F1
                    </span>
                    <span className="block mt-1 text-xl font-black font-mono text-zinc-900 dark:text-white">
                      {(selectedSub.testMacroF1 * 100).toFixed(2)}%
                    </span>
                  </div>

                  <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-950">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">
                      Gen. Gap
                    </span>
                    <span className="block mt-1 text-xl font-black font-mono text-zinc-900 dark:text-white">
                      {(selectedSub.generalizationGap * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>

                {selectedSub.reasonOfRevision && (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                      Alasan Revisi
                    </span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300">
                      {selectedSub.reasonOfRevision}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1.5">
                    Strategi &amp; Augmentasi
                  </span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {selectedSub.strategyDescription}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <Link
                    href="/analysis"
                    className="flex items-center justify-between rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all"
                  >
                    <span>Inspeksi Prediksi di Analisis GT</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-zinc-400">
                Klik salah satu node pada pohon eksperimen di sebelah kiri untuk melihat rincian lengkap.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
