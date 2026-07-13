"use client";

import React, { useEffect, useState } from "react";
import { telemetry, TelemetryMetrics, ExecutionTraceEvent } from "@/lib/telemetry";
import {
  Activity,
  Database,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Terminal,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
} from "lucide-react";

interface DbInspectResult {
  success: boolean;
  databaseStatus: string;
  queryDurationMs: number;
  totalRowsInGlobalState: number;
  individualImageCount: number;
  hasLegacyImageMap: boolean;
  imageKeysSample: string[];
  syncVersion: number;
  syncStateSummary: Record<string, unknown>;
  error?: string;
}

export default function DebugObservabilityPage() {
  const [metrics, setMetrics] = useState<TelemetryMetrics>(telemetry.getMetrics());
  const [traces, setTraces] = useState<ExecutionTraceEvent[]>(telemetry.getTraces());
  const [dbInspect, setDbInspect] = useState<DbInspectResult | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);

  useEffect(() => {
    const unsubscribe = telemetry.subscribe(() => {
      setMetrics({ ...telemetry.getMetrics() });
      setTraces([...telemetry.getTraces()]);
    });
    return () => unsubscribe();
  }, []);

  const inspectDatabase = async () => {
    setIsInspecting(true);
    try {
      const res = await fetch("/api/debug/inspect", { cache: "no-store" });
      const data = await res.json();
      setDbInspect(data);
    } catch {
      setDbInspect({
        success: false,
        databaseStatus: "ERROR",
        queryDurationMs: 0,
        totalRowsInGlobalState: 0,
        individualImageCount: 0,
        hasLegacyImageMap: false,
        imageKeysSample: [],
        syncVersion: 0,
        syncStateSummary: {},
        error: "Gagal memanggil /api/debug/inspect",
      });
    } finally {
      setIsInspecting(false);
    }
  };

  useEffect(() => {
    inspectDatabase();
  }, []);

  const stageColors: Record<string, string> = {
    ZIP_SELECT: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    ZIP_EXTRACT_COMPLETED: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    REACT_STATE_UPDATE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    INDEXEDDB_WRITE: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
    INDEXEDDB_READ: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
    API_UPLOAD_START: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    API_UPLOAD_CHUNK_SUCCESS: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    API_UPLOAD_CHUNK_FAILED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    API_IMAGE_FETCH_START: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
    API_IMAGE_FETCH_SUCCESS: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    API_IMAGE_FETCH_FAILED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-8 text-zinc-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-mono text-lg font-bold text-white shadow-lg shadow-blue-600/30">
                SRE
              </span>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Digital Forensic & Observability Console
                </h1>
                <p className="text-xs font-mono text-zinc-400">
                  End-to-End Image Dataset Lifecycle & Synchronization Telemetry
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={inspectDatabase}
              disabled={isInspecting}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isInspecting ? "animate-spin" : ""}`} />
              Inspect PostgreSQL
            </button>

            <button
              type="button"
              onClick={() => telemetry.clearTraces()}
              className="inline-flex items-center gap-2 rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-900/40 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Bersihkan Trace
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-semibold uppercase">ZIP Extracted</span>
              <HardDrive className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 font-mono text-2xl font-bold text-white">
              {metrics.zipExtractedCount}
            </div>
            <p className="mt-1 text-[10px] text-zinc-500">Gambar diekstrak dari memori ZIP</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-semibold uppercase">React State</span>
              <Layers className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 font-mono text-2xl font-bold text-emerald-400">
              {metrics.reactStateImageCount}
            </div>
            <p className="mt-1 text-[10px] text-zinc-500">Gambar aktif di imageMap client</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-semibold uppercase">IndexedDB Cache</span>
              <Database className="h-4 w-4 text-teal-400" />
            </div>
            <div className="mt-2 font-mono text-2xl font-bold text-teal-400">
              {metrics.indexedDbImageCount}
            </div>
            <p className="mt-1 text-[10px] text-zinc-500">Tersimpan lokal di browser storage</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-semibold uppercase">PostgreSQL DB</span>
              <Database className="h-4 w-4 text-blue-400" />
            </div>
            <div className="mt-2 font-mono text-2xl font-bold text-blue-400">
              {dbInspect ? dbInspect.individualImageCount : "..."}
            </div>
            <p className="mt-1 text-[10px] text-zinc-500">Baris img_* di tabel GlobalState</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-semibold uppercase">Thumbnails Rendered</span>
              <Activity className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 font-mono text-2xl font-bold text-amber-400">
              {metrics.renderedThumbnailCount}
            </div>
            <p className="mt-1 text-[10px] text-zinc-500">Total penampilan preview di UI</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-semibold uppercase">Cloud Sync Status</span>
              <RefreshCw
                className={`h-4 w-4 ${
                  metrics.cloudSyncStatus === "SYNCING"
                    ? "animate-spin text-blue-400"
                    : "text-zinc-400"
                }`}
              />
            </div>
            <div className="mt-2 font-mono text-base font-bold text-white">
              {metrics.cloudSyncStatus}
            </div>
            <p className="mt-1 text-[10px] font-mono text-zinc-500">
              Ver: {metrics.cloudVersion || 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <ArrowUpRight className="h-4 w-4 text-amber-400" />
              Upload Telemetry (Client -&gt; PostgreSQL)
            </h2>
            <div className="mt-4 grid grid-cols-4 gap-4">
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3">
                <span className="text-[10px] text-zinc-400 font-mono">Requests</span>
                <div className="font-mono text-xl font-bold text-white">
                  {metrics.uploadRequestCount}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3">
                <span className="text-[10px] text-emerald-400 font-mono">Success</span>
                <div className="font-mono text-xl font-bold text-emerald-400">
                  {metrics.uploadSuccessCount}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3">
                <span className="text-[10px] text-red-400 font-mono">Failed</span>
                <div className="font-mono text-xl font-bold text-red-400">
                  {metrics.uploadFailCount}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3">
                <span className="text-[10px] text-amber-400 font-mono">Pending</span>
                <div className="font-mono text-xl font-bold text-amber-400">
                  {metrics.uploadPendingCount}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <ArrowDownRight className="h-4 w-4 text-blue-400" />
              Download Telemetry (PostgreSQL -&gt; Client)
            </h2>
            <div className="mt-4 grid grid-cols-4 gap-4">
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3">
                <span className="text-[10px] text-zinc-400 font-mono">Requests</span>
                <div className="font-mono text-xl font-bold text-white">
                  {metrics.downloadRequestCount}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3">
                <span className="text-[10px] text-emerald-400 font-mono">Success</span>
                <div className="font-mono text-xl font-bold text-emerald-400">
                  {metrics.downloadSuccessCount}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3">
                <span className="text-[10px] text-red-400 font-mono">Failed</span>
                <div className="font-mono text-xl font-bold text-red-400">
                  {metrics.downloadFailCount}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3">
                <span className="text-[10px] text-blue-400 font-mono">Pending</span>
                <div className="font-mono text-xl font-bold text-blue-400">
                  {metrics.downloadPendingCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {dbInspect && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                <h3 className="text-sm font-bold text-white">
                  Live PostgreSQL Inspection Status ({dbInspect.queryDurationMs}ms)
                </h3>
              </div>
              <span
                className={`rounded-full px-3 py-1 font-mono text-xs font-bold ${
                  dbInspect.success
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    : "bg-red-950 text-red-300 border border-red-800"
                }`}
              >
                {dbInspect.databaseStatus}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-zinc-950/70 p-4">
                <span className="text-xs text-zinc-400">Total Rows in GlobalState</span>
                <div className="mt-1 font-mono text-xl font-bold text-white">
                  {dbInspect.totalRowsInGlobalState}
                </div>
              </div>
              <div className="rounded-xl bg-zinc-950/70 p-4">
                <span className="text-xs text-zinc-400">Individual Images (img_*)</span>
                <div className="mt-1 font-mono text-xl font-bold text-blue-400">
                  {dbInspect.individualImageCount}
                </div>
              </div>
              <div className="rounded-xl bg-zinc-950/70 p-4">
                <span className="text-xs text-zinc-400">Legacy Monolithic imageMap</span>
                <div className="mt-1 font-mono text-xl font-bold text-amber-400">
                  {dbInspect.hasLegacyImageMap ? "PRESENT" : "ABSENT"}
                </div>
              </div>
              <div className="rounded-xl bg-zinc-950/70 p-4">
                <span className="text-xs text-zinc-400">Server Sync Version</span>
                <div className="mt-1 font-mono text-xl font-bold text-purple-400">
                  {dbInspect.syncVersion}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">
                End-to-End Execution Trace Feed ({traces.length} events)
              </h3>
            </div>
          </div>

          <div className="max-h-[520px] overflow-y-auto divide-y divide-zinc-800/60">
            {traces.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-500">
                <ShieldAlert className="h-8 w-8 text-zinc-600 mb-2" />
                <p className="text-xs font-mono">
                  Belum ada log trace. Unggah file ZIP atau navigasikan antar halaman untuk merekam lifecycle data.
                </p>
              </div>
            ) : (
              traces.map((t) => (
                <div key={t.id} className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 font-mono text-[10px] font-bold ${
                        stageColors[t.stage] || "bg-zinc-800 text-zinc-300"
                      }`}
                    >
                      {t.stage}
                    </span>

                    <div>
                      <p className="text-xs font-semibold text-zinc-200">{t.message}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-4 text-[11px] font-mono text-zinc-400">
                        <span>Waktu: {new Date(t.timestamp).toLocaleTimeString()}</span>
                        {t.count > 0 && <span>Count: {t.count}</span>}
                        {t.durationMs > 0 && (
                          <span className="flex items-center gap-1 text-amber-400">
                            <Clock className="h-3 w-3" />
                            {t.durationMs} ms
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                        t.status === "SUCCESS"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : t.status === "FAILED"
                          ? "bg-red-950 text-red-400 border border-red-800"
                          : "bg-blue-950 text-blue-400 border border-blue-800"
                      }`}
                    >
                      {t.status === "SUCCESS" && <CheckCircle2 className="h-3 w-3" />}
                      {t.status === "FAILED" && <XCircle className="h-3 w-3" />}
                      {t.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
