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
  Sparkles,
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
          onClick={() => setSelectedSubId(sub.id)}
          className={`pin-card cursor-pointer p-5 transition-all ${
            isSelected
              ? "border-[#4d3fa3] bg-[#4d3fa3] text-white shadow-xl dark:border-indigo-500 dark:bg-indigo-600"
              : "pin-card-hover bg-white dark:bg-zinc-900"
          }`}
          style={{ marginLeft: `${depth * 28}px` }}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl font-mono text-xs font-black ${
                isSelected
                  ? "bg-white/20 text-white"
                  : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
              }`}
            >
              #{sub.rank}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tracking-tight">
                    {sub.name}
                  </span>
                  {sub.isOfficial && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                        isSelected
                          ? "bg-white text-[#4d3fa3]"
                          : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                      }`}
                    >
                      <Target className="h-3 w-3" />
                      <span>Resmi</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {parentSub && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-black ${
                        deltaParent >= 0
                          ? isSelected
                            ? "bg-white/20 text-white"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : isSelected
                          ? "bg-white/20 text-white"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      }`}
                    >
                      {deltaParent >= 0 ? "+" : ""}
                      {deltaParent.toFixed(2)}%
                    </span>
                  )}
                  <span className="font-mono text-base font-black">
                    {(sub.testMacroF1 * 100).toFixed(2)}%
                  </span>
                </div>
              </div>

              <div
                className={`mt-1 text-xs font-medium ${
                  isSelected ? "text-indigo-100" : "text-zinc-500"
                }`}
              >
                Arsitektur: {sub.modelName} &bull; Anggota Tim:{" "}
                {sub.leaderboardName}
              </div>

              {sub.reasonOfRevision && (
                <div
                  className={`mt-3 rounded-2xl p-3 text-xs italic ${
                    isSelected
                      ? "bg-white/10 text-white"
                      : "bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  &ldquo;{sub.reasonOfRevision}&rdquo;
                </div>
              )}
            </div>
          </div>
        </div>

        {children.length > 0 && (
          <div
            className="mt-3 space-y-3 border-l-2 border-indigo-200 pl-4 dark:border-indigo-900"
            style={{ marginLeft: `${depth * 28 + 18}px` }}
          >
            {children.map((c) => renderTreeNode(c, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-14">
      {/* Hero Bento Banner */}
      <div className="pin-card pin-card-lavender flex flex-wrap items-center justify-between gap-6 p-7">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
            <Sparkles className="h-3 w-3" />
            <span>Riwayat Silsilah</span>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Pohon Alur Eksperimen Model
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
            Peta evolusi percabangan eksperimen, iterasi arsitektur, dan
            perbandingan performa antar versi.
          </p>
        </div>

        <Link
          href="/leaderboard"
          className="rounded-2xl bg-[#4d3fa3] px-5 py-3 text-xs font-black text-white shadow-lg transition-transform active:scale-95 hover:bg-[#3e3188]"
        >
          Lihat Peringkat
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="pin-card p-14 text-center text-xs font-semibold text-zinc-400">
          Belum ada eksperimen tercatat dalam silsilah.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          <div className="space-y-4 lg:col-span-7">
            {treeRoots.map((root) => renderTreeNode(root, 0))}
          </div>

          <div className="sticky top-24 lg:col-span-5">
            <div className="pin-card space-y-5 p-6">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <GitCommit className="h-4 w-4" />
                <span>Inspeksi Node Terpilih</span>
              </div>

              {selectedSub ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                      {selectedSub.name}
                    </h3>
                    <p className="text-xs font-semibold text-zinc-500">
                      {selectedSub.modelName} &bull; Anggota Tim:{" "}
                      {selectedSub.leaderboardName}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                      <span className="text-[10px] font-black uppercase text-zinc-400">
                        Test Macro F1
                      </span>
                      <div className="mt-1 font-mono text-xl font-black text-zinc-900 dark:text-white">
                        {(selectedSub.testMacroF1 * 100).toFixed(2)}%
                      </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                      <span className="text-[10px] font-black uppercase text-zinc-400">
                        Generalization Gap
                      </span>
                      <div className="mt-1 font-mono text-xl font-black text-zinc-900 dark:text-white">
                        {(selectedSub.generalizationGap * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {selectedSub.reasonOfRevision && (
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                      <span className="mb-1 block text-[10px] font-black uppercase text-zinc-400">
                        Alasan Revisi
                      </span>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300">
                        {selectedSub.reasonOfRevision}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="mb-1.5 block text-[10px] font-black uppercase text-zinc-400">
                      Strategi Eksperimen
                    </span>
                    <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {selectedSub.strategyDescription}
                    </p>
                  </div>

                  <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    <Link
                      href="/analysis"
                      className="flex items-center justify-between rounded-2xl bg-[#4d3fa3] px-5 py-3 text-xs font-black text-white shadow-md hover:bg-[#3e3188]"
                    >
                      <span>Inspeksi Prediksi di Analisis</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-zinc-400">
                  Pilih salah satu bereksperimen di sebelah kiri untuk meninjau
                  detail.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
