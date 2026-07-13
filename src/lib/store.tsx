"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import JSZip from "jszip";
import {
  Submission,
  DatasetItem,
  ClassLabel,
  UserProfile,
  GroundTruthHistory,
  ActivityLog,
} from "@/types";
import { evaluatePredictions, computeAutomaticTags } from "./evaluator";
import { telemetry } from "./telemetry";
import {
  DEFAULT_USERS,
  INITIAL_DATASET,
  INITIAL_SUBMISSIONS,
  INITIAL_GT_HISTORY,
  INITIAL_ACTIVITY_LOGS,
  generateDemoDataset,
} from "./seed";

interface AddSubmissionParams {
  name: string;
  leaderboardName: string;
  modelName: string;
  strategyDescription: string;
  validationMacroF1: number;
  predictions: Record<number, ClassLabel>;
  parentId?: string | null;
  reasonOfRevision?: string;
}

interface AppStoreContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  login: (email: string) => boolean;
  loginAsLeaderboardName: (leaderboardName: string) => void;
  register: (user: UserProfile) => void;
  logout: () => void;

  dataset: DatasetItem[];
  activeGtVersion: string;
  uploadTestZip: (file: File) => Promise<number>;
  updateGroundTruthDataset: (
    newDataset: DatasetItem[],
    reason: string
  ) => void;
  updateSingleGroundTruthLabel: (
    itemId: number,
    newLabel: ClassLabel,
    reason: string
  ) => void;
  updateGroundTruthBatch: (
    changes: Record<number, ClassLabel>,
    reason: string
  ) => number;

  submissions: Submission[];
  addSubmission: (params: AddSubmissionParams) => Submission;
  deleteSubmission: (id: string) => void;
  setOfficialSubmission: (id: string, slot?: 1 | 2 | 3) => void;
  setOfficialActualF1: (id: string, actualF1: number) => void;
  switchActiveGtVersion: (version: string) => void;

  gtHistory: GroundTruthHistory[];
  activityLogs: ActivityLog[];

  previewImageModalId: number | null;
  setPreviewImageModalId: (id: number | null) => void;

  resetToDefaultSeeds: () => void;
  resetAllProcessToZero: () => void;
}

const AppStoreContext = createContext<AppStoreContextType | undefined>(
  undefined
);

const LOCAL_STORAGE_KEY = "cv_dsp_store_state_v3";

function getFormattedWIB(): { dateWIB: string; timeWIB: string; full: string } {
  const now = new Date();
  const dateWIB = now.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeWIB =
    now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";
  return { dateWIB, timeWIB, full: `${dateWIB} ${timeWIB}` };
}

export const AppStoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [users, setUsers] = useState<UserProfile[]>(DEFAULT_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(
    DEFAULT_USERS[0]
  );
  const [dataset, setDataset] = useState<DatasetItem[]>(INITIAL_DATASET);
  const [activeGtVersion, setActiveGtVersion] = useState<string>("v1.0");
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const initial = INITIAL_SUBMISSIONS;
    const tagsMap = computeAutomaticTags(initial);
    return initial.map((s) => ({ ...s, tags: tagsMap[s.id] || [] }));
  });
  const [gtHistory, setGtHistory] =
    useState<GroundTruthHistory[]>(INITIAL_GT_HISTORY);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(
    INITIAL_ACTIVITY_LOGS
  );
  const [previewImageModalId, setPreviewImageModalId] = useState<number | null>(
    null
  );

  const lastWriteTimestampRef = useRef(0);
  const cloudVersionRef = useRef(0);

  const stateRef = useRef({
    users: DEFAULT_USERS as UserProfile[],
    submissions: INITIAL_SUBMISSIONS as Submission[],
    dataset: INITIAL_DATASET as DatasetItem[],
    activeGtVersion: "v1.0",
    gtHistory: INITIAL_GT_HISTORY as GroundTruthHistory[],
    activityLogs: INITIAL_ACTIVITY_LOGS as ActivityLog[],
  });

  useEffect(() => {
    stateRef.current = {
      users,
      submissions,
      dataset,
      activeGtVersion,
      gtHistory,
      activityLogs,
    };
  }, [users, submissions, dataset, activeGtVersion, gtHistory, activityLogs]);

  const applyCloudState = useCallback((state: Record<string, unknown>) => {
    if (Array.isArray(state.users)) setUsers(state.users as UserProfile[]);
    if (Array.isArray(state.submissions)) setSubmissions(state.submissions as Submission[]);
    if (Array.isArray(state.dataset)) setDataset(state.dataset as DatasetItem[]);
    if (typeof state.activeGtVersion === "string") setActiveGtVersion(state.activeGtVersion);
    if (Array.isArray(state.gtHistory)) setGtHistory(state.gtHistory as GroundTruthHistory[]);
    if (Array.isArray(state.activityLogs)) setActivityLogs(state.activityLogs as ActivityLog[]);
  }, []);

  const syncFromCloud = useCallback(() => {
    if (Date.now() - lastWriteTimestampRef.current < 1200) return;

    telemetry.updateMetrics({ cloudSyncStatus: "SYNCING" });
    fetch(`/api/sync?_t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.success || !data.state) {
          telemetry.updateMetrics({ cloudSyncStatus: "IDLE" });
          return;
        }
        if (Date.now() - lastWriteTimestampRef.current < 1200) return;
        const serverVersion = data.version || 0;
        if (serverVersion > cloudVersionRef.current) {
          cloudVersionRef.current = serverVersion;
          applyCloudState(data.state);
          telemetry.updateMetrics({
            cloudSyncStatus: "SYNCED",
            cloudVersion: serverVersion,
          });
        } else {
          telemetry.updateMetrics({ cloudSyncStatus: "IDLE" });
        }
      })
      .catch(() => {
        telemetry.updateMetrics({ cloudSyncStatus: "ERROR" });
      });
  }, [applyCloudState]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.users) setUsers(p.users);
        if (p.currentUser) setCurrentUser(p.currentUser);
        if (p.dataset) setDataset(p.dataset);
        if (p.activeGtVersion) setActiveGtVersion(p.activeGtVersion);
        if (p.submissions) setSubmissions(p.submissions);
        if (p.gtHistory) setGtHistory(p.gtHistory);
        if (p.activityLogs) setActivityLogs(p.activityLogs);
      }
    } catch { /* ignore */ }

    syncFromCloud();

    const iv = setInterval(() => {
      syncFromCloud();
    }, 1500);

    const hv = () => {
      if (document.visibilityState === "visible") {
        syncFromCloud();
      }
    };
    window.addEventListener("focus", hv);
    document.addEventListener("visibilitychange", hv);
    return () => {
      clearInterval(iv);
      window.removeEventListener("focus", hv);
      document.removeEventListener("visibilitychange", hv);
    };
  }, [syncFromCloud]);

  const pushStateToCloud = useCallback((overrides?: Record<string, unknown>) => {
    lastWriteTimestampRef.current = Date.now();

    const s = stateRef.current;
    const state = {
      users: s.users,
      submissions: s.submissions,
      dataset: s.dataset,
      activeGtVersion: s.activeGtVersion,
      gtHistory: s.gtHistory,
      activityLogs: s.activityLogs,
      ...(overrides || {}),
    };

    fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && typeof data.version === "number") {
          cloudVersionRef.current = Math.max(cloudVersionRef.current, data.version);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          users,
          currentUser,
          dataset,
          activeGtVersion,
          submissions,
          gtHistory,
          activityLogs,
        })
      );
    } catch {
      // Abaikan kesalahan penulisan penyimpanan lokal
    }
  }, [
    users,
    currentUser,
    dataset,
    activeGtVersion,
    submissions,
    gtHistory,
    activityLogs,
  ]);

  const login = useCallback(
    (email: string) => {
      const found = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (found) {
        setCurrentUser(found);
        return true;
      }
      return false;
    },
    [users]
  );

  const loginAsLeaderboardName = useCallback(
    (leaderboardName: string) => {
      const found = users.find(
        (u) =>
          u.leaderboardName.toLowerCase() ===
          leaderboardName.trim().toLowerCase()
      );
      if (found) {
        setCurrentUser(found);
      }
    },
    [users]
  );

  const register = useCallback(
    (user: UserProfile) => {
      setUsers((prev) => [...prev, user]);
      setCurrentUser(user);
    },
    []
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const uploadTestZip = useCallback(async (file: File): Promise<number> => {
    const startTime = Date.now();
    telemetry.logTrace({
      stage: "ZIP_SELECT",
      count: 1,
      successCount: 1,
      failedCount: 0,
      durationMs: 0,
      status: "INFO",
      message: `Memeriksa berkas ZIP Dataset: ${file.name} (${Math.round(file.size / 1024)} KB)`,
    });

    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    const idSet = new Set<number>();

    const fileEntries = Object.keys(contents.files);
    for (const relativePath of fileEntries) {
      const zipEntry = contents.files[relativePath];
      if (zipEntry.dir) continue;

      const filename = relativePath.split("/").pop() || "";
      const match = filename.match(/^(\d+)\.(jpg|jpeg|png|webp|gif|bmp)$/i);
      if (match) {
        const id = parseInt(match[1], 10);
        if (!isNaN(id)) {
          idSet.add(id);
        }
      }
    }

    const ids = Array.from(idSet).sort((a, b) => a - b);
    const extractedCount = ids.length;

    const extractionDurationMs = Date.now() - startTime;
    telemetry.updateMetrics({ zipExtractedCount: extractedCount });
    telemetry.logTrace({
      stage: "ZIP_EXTRACT_COMPLETED",
      count: extractedCount,
      successCount: extractedCount,
      failedCount: 0,
      durationMs: extractionDurationMs,
      status: "SUCCESS",
      message: `Inisialisasi metadata selesai: ${extractedCount} ID sampel terdeteksi dalam ${extractionDurationMs}ms.`,
    });

    const existingGtLabelMap: Record<number, ClassLabel> = {};
    for (const item of dataset) {
      existingGtLabelMap[item.id] = item.groundTruthLabel;
    }

    const updatedDataset: DatasetItem[] = ids.map((id) => ({
      id,
      imageNumber: id,
      groundTruthLabel: existingGtLabelMap[id] || "Recyclable",
    }));

    if (ids.length > 0) {
      setDataset(updatedDataset);
    }

    const { full } = getFormattedWIB();
    const logItem = {
      id: `log-zip-${Date.now()}`,
      timestampWIB: full,
      title: "Daftar Sampel Dataset Diinisialisasi",
      description: `Berhasil mendaftarkan ${extractedCount} sampel ID dataset dan mensinkronkan metadata ke semua device pengguna.`,
      type: "system" as const,
    };

    setActivityLogs((prev) => {
      const nextLogs = [logItem, ...prev];
      pushStateToCloud({
        dataset: updatedDataset,
        activityLogs: nextLogs,
      });
      return nextLogs;
    });

    return extractedCount;
  }, [dataset, pushStateToCloud]);

  const recomputeAllSubmissions = useCallback(
    (currentDataset: DatasetItem[]) => {
      const gtMap: Record<number, ClassLabel> = {};
      for (const item of currentDataset) {
        gtMap[item.id] = item.groundTruthLabel;
      }

      setSubmissions((prev) => {
        const recomputed = prev.map((sub) => {
          const evalSummary = evaluatePredictions(gtMap, sub.predictions);
          const gap =
            sub.validationMacroF1 > 0
              ? evalSummary.macroF1 - sub.validationMacroF1
              : 0;
          return {
            ...sub,
            testMacroF1: evalSummary.macroF1,
            generalizationGap: gap,
            evaluationSummary: evalSummary,
          };
        });

        recomputed.sort((a, b) => b.testMacroF1 - a.testMacroF1);
        const ranked = recomputed.map((s, idx) => ({
          ...s,
          rank: idx + 1,
        }));
        const tagsMap = computeAutomaticTags(ranked);
        const nextSubs = ranked.map((s) => ({
          ...s,
          tags: tagsMap[s.id] || [],
        }));
        pushStateToCloud({ submissions: nextSubs });
        return nextSubs;
      });
    },
    [pushStateToCloud]
  );

  const updateGroundTruthDataset = useCallback(
    (newDataset: DatasetItem[], reason: string) => {
      setDataset(newDataset);
      const nextVerNum =
        parseFloat(activeGtVersion.replace("v", "")) + 1.0;
      const nextVerStr = `v${nextVerNum.toFixed(1)}`;
      setActiveGtVersion(nextVerStr);

      const { dateWIB, timeWIB, full } = getFormattedWIB();
      const author = currentUser
        ? currentUser.leaderboardName
        : "System";

      const oldSubmissions = [...submissions];
      const prevAvgMacroF1 =
        oldSubmissions.length > 0
          ? oldSubmissions.reduce((acc, s) => acc + s.testMacroF1, 0) /
            oldSubmissions.length
          : 0;

      const gtMap: Record<number, ClassLabel> = {};
      for (const item of newDataset) {
        gtMap[item.id] = item.groundTruthLabel;
      }

      let maxDelta = 0;
      let maxSubName = "-";
      let posChangedCount = 0;
      let officialOldRank = 0;
      let officialNewRank = 0;

      const oldRankMap = new Map<string, number>();
      oldSubmissions.forEach((s) => oldRankMap.set(s.id, s.rank));

      const recomputed = oldSubmissions.map((sub) => {
        const evalSummary = evaluatePredictions(gtMap, sub.predictions);
        const delta = evalSummary.macroF1 - sub.testMacroF1;
        if (Math.abs(delta) > Math.abs(maxDelta)) {
          maxDelta = delta;
          maxSubName = sub.name;
        }
        if (sub.isOfficial) {
          officialOldRank = sub.rank;
        }
        return {
          ...sub,
          testMacroF1: evalSummary.macroF1,
          evaluationSummary: evalSummary,
        };
      });

      recomputed.sort((a, b) => b.testMacroF1 - a.testMacroF1);
      const rankedNew = recomputed.map((s, idx) => {
        const newRank = idx + 1;
        const oldR = oldRankMap.get(s.id) || newRank;
        if (oldR !== newRank) posChangedCount += 1;
        if (s.isOfficial) officialNewRank = newRank;
        return { ...s, rank: newRank };
      });

      const newAvgMacroF1 =
        rankedNew.length > 0
          ? rankedNew.reduce((acc, s) => acc + s.testMacroF1, 0) /
            rankedNew.length
          : 0;

      const gtEntry = {
        version: nextVerStr,
        dateWIB,
        timeWIB,
        changedByLeaderboardName: author,
        changedCount: newDataset.length,
        reason,
        previousAvgMacroF1: prevAvgMacroF1,
        newAvgMacroF1: newAvgMacroF1,
        maxScoreChangeSubmissionName: maxSubName,
        maxScoreChangeDelta: maxDelta,
        rankingChanged: posChangedCount > 0,
        officialSubmissionPositionChanged: officialOldRank !== officialNewRank,
        officialSubmissionOldRank: officialOldRank,
        officialSubmissionNewRank: officialNewRank,
        positionChangedCount: posChangedCount,
      };

      const logEntry = {
        id: `log-gt-${Date.now()}`,
        timestampWIB: full,
        title: `Ground Truth Diperbarui (${nextVerStr})`,
        description: `${author} memperbarui Ground Truth (${newDataset.length} sampel). Alasan: ${reason}`,
        type: "gt_update" as const,
      };

      const nextGtHistory = [gtEntry, ...gtHistory];
      const nextLogs = [logEntry, ...activityLogs];
      setGtHistory(nextGtHistory);
      setActivityLogs(nextLogs);

      pushStateToCloud({
        dataset: newDataset,
        activeGtVersion: nextVerStr,
        gtHistory: nextGtHistory,
        activityLogs: nextLogs,
      });

      recomputeAllSubmissions(newDataset);
    },
    [activeGtVersion, currentUser, pushStateToCloud, recomputeAllSubmissions, submissions, gtHistory, activityLogs]
  );

  const updateSingleGroundTruthLabel = useCallback(
    (itemId: number, newLabel: ClassLabel, reason: string) => {
      const updated = dataset.map((item) =>
        item.id === itemId ? { ...item, groundTruthLabel: newLabel } : item
      );
      updateGroundTruthDataset(updated, reason);
    },
    [dataset, updateGroundTruthDataset]
  );

  const updateGroundTruthBatch = useCallback(
    (changes: Record<number, ClassLabel>, reason: string): number => {
      const changeCount = Object.keys(changes).length;
      if (changeCount === 0) return 0;
      const updated = dataset.map((item) =>
        changes[item.id] !== undefined
          ? { ...item, groundTruthLabel: changes[item.id] }
          : item
      );
      updateGroundTruthDataset(updated, reason);
      return changeCount;
    },
    [dataset, updateGroundTruthDataset]
  );

  const addSubmission = useCallback(
    (params: AddSubmissionParams): Submission => {
      const gtMap: Record<number, ClassLabel> = {};
      for (const item of dataset) {
        gtMap[item.id] = item.groundTruthLabel;
      }

      const evalSummary = evaluatePredictions(gtMap, params.predictions);
      const gap =
        params.validationMacroF1 > 0
          ? evalSummary.macroF1 - params.validationMacroF1
          : 0;
      const { full } = getFormattedWIB();

      const newSub: Submission = {
        id: `sub-${Date.now()}`,
        name: params.name,
        leaderboardName: params.leaderboardName,
        modelName: params.modelName,
        strategyDescription: params.strategyDescription,
        validationMacroF1: params.validationMacroF1,
        testMacroF1: evalSummary.macroF1,
        generalizationGap: gap,
        predictions: params.predictions,
        evaluationSummary: evalSummary,
        uploadTimestampWIB: full,
        rank: 1,
        parentId: params.parentId || null,
        reasonOfRevision: params.reasonOfRevision || "",
      };

      const logItem = {
        id: `log-sub-${Date.now()}`,
        timestampWIB: full,
        title: `Submission Baru Diunggah (${params.name})`,
        description: `${params.leaderboardName} mengunggah model "${params.modelName}" dengan Macro F1 Test ${(
          evalSummary.macroF1 * 100
        ).toFixed(2)}%.`,
        type: "submission" as const,
      };
      const nextLogs = [logItem, ...activityLogs];
      setActivityLogs(nextLogs);

      setSubmissions((prev) => {
        const list = [newSub, ...prev];
        list.sort((a, b) => b.testMacroF1 - a.testMacroF1);
        const ranked = list.map((s, idx) => ({ ...s, rank: idx + 1 }));
        const tagsMap = computeAutomaticTags(ranked);
        const nextSubs = ranked.map((s) => ({ ...s, tags: tagsMap[s.id] || [] }));
        pushStateToCloud({ submissions: nextSubs, activityLogs: nextLogs });
        return nextSubs;
      });

      return newSub;
    },
    [dataset, pushStateToCloud, activityLogs]
  );

  const deleteSubmission = useCallback((id: string) => {
    setSubmissions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      const ranked = filtered.map((s, idx) => ({ ...s, rank: idx + 1 }));
      const tagsMap = computeAutomaticTags(ranked);
      const nextSubs = ranked.map((s) => ({ ...s, tags: tagsMap[s.id] || [] }));
      pushStateToCloud({ submissions: nextSubs });
      return nextSubs;
    });
  }, [pushStateToCloud]);

  const setOfficialSubmission = useCallback((id: string, slot: 1 | 2 | 3 = 1) => {
    const { full } = getFormattedWIB();
    const logItem = {
      id: `log-official-${Date.now()}`,
      timestampWIB: full,
      title: `Official Submission #${slot} Ditetapkan`,
      description: `Submission dengan ID #${id} dipilih sebagai Official Submission #${slot} untuk evaluasi kalibrasi akhir.`,
      type: "system" as const,
    };
    const nextLogs = [logItem, ...activityLogs];
    setActivityLogs(nextLogs);

    setSubmissions((prev) => {
      const updated = prev.map((s) => {
        if (s.id === id) {
          return { ...s, isOfficial: true, officialSlot: slot };
        }
        if (s.officialSlot === slot) {
          return { ...s, isOfficial: false, officialSlot: null };
        }
        return s;
      });
      const tagsMap = computeAutomaticTags(updated);
      const nextSubs = updated.map((s) => ({ ...s, tags: tagsMap[s.id] || [] }));
      pushStateToCloud({ submissions: nextSubs, activityLogs: nextLogs });
      return nextSubs;
    });
  }, [activityLogs, pushStateToCloud]);

  const switchActiveGtVersion = useCallback((version: string) => {
    const { full } = getFormattedWIB();
    const logItem = {
      id: `log-gt-switch-${Date.now()}`,
      timestampWIB: full,
      title: `Ground Truth Aktif Berubah (${version})`,
      description: `Versi Ground Truth aktif dikembalikan / disetel ke ${version}.`,
      type: "gt_update" as const,
    };
    const nextLogs = [logItem, ...activityLogs];
    setActiveGtVersion(version);
    setActivityLogs(nextLogs);
    pushStateToCloud({ activeGtVersion: version, activityLogs: nextLogs });
  }, [activityLogs, pushStateToCloud]);

  const setOfficialActualF1 = useCallback((id: string, actualF1: number) => {
    setSubmissions((prev) => {
      const updated = prev.map((s) =>
        s.id === id ? { ...s, officialActualF1: actualF1 } : s
      );
      pushStateToCloud({ submissions: updated });
      return updated;
    });
  }, [pushStateToCloud]);

  const resetToDefaultSeeds = useCallback(() => {
    const demoDataset = generateDemoDataset(120);
    const logs = [{ id: "log-reset", timestampWIB: getFormattedWIB().full, title: "Dataset Contoh Dimuat", description: "120 sampel contoh telah dimuat ke dalam platform.", type: "system" as const }];
    setUsers(DEFAULT_USERS);
    setCurrentUser(DEFAULT_USERS[0]);
    setDataset(demoDataset);
    setActiveGtVersion("v1.0");
    setSubmissions([]);
    setGtHistory([]);
    setActivityLogs(logs);
    pushStateToCloud({ users: DEFAULT_USERS, submissions: [], dataset: demoDataset, activeGtVersion: "v1.0", gtHistory: [], activityLogs: logs });
  }, [pushStateToCloud]);

  const resetAllProcessToZero = useCallback(() => {
    const logs = [{ id: `log-reset-zero-${Date.now()}`, timestampWIB: getFormattedWIB().full, title: "Reset Seluruh Data ke 0", description: "Seluruh data submission dan ground truth telah direset ke 0.", type: "system" as const }];
    setSubmissions([]);
    setDataset([]);
    setActiveGtVersion("v1.0");
    setGtHistory([]);
    setActivityLogs(logs);
    try { localStorage.removeItem(LOCAL_STORAGE_KEY); } catch { /* ignore */ }
    pushStateToCloud({ submissions: [], dataset: [], activeGtVersion: "v1.0", gtHistory: [], activityLogs: logs });
  }, [pushStateToCloud]);

  return (
    <AppStoreContext.Provider
      value={{
        currentUser,
        users,
        login,
        loginAsLeaderboardName,
        register,
        logout,

        dataset,
        activeGtVersion,
        uploadTestZip,
        updateGroundTruthDataset,
        updateSingleGroundTruthLabel,
        updateGroundTruthBatch,

        submissions,
        addSubmission,
        deleteSubmission,
        setOfficialSubmission,
        setOfficialActualF1,
        switchActiveGtVersion,

        gtHistory,
        activityLogs,

        previewImageModalId,
        setPreviewImageModalId,

        resetToDefaultSeeds,
        resetAllProcessToZero,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  );
};

export function useAppStore(): AppStoreContextType {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore must be used inside AppStoreProvider");
  }
  return context;
}
