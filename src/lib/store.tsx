"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
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

  resetToDefaultSeeds: () => void;
  resetAllProcessToZero: () => void;
}

const AppStoreContext = createContext<AppStoreContextType | undefined>(
  undefined
);

const LOCAL_STORAGE_KEY = "cv_dsp_store_state_v4";

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
    if (Array.isArray(state.users)) {
      stateRef.current.users = state.users as UserProfile[];
      setUsers(state.users as UserProfile[]);
    }
    if (Array.isArray(state.submissions)) {
      stateRef.current.submissions = state.submissions as Submission[];
      setSubmissions(state.submissions as Submission[]);
    }
    if (Array.isArray(state.dataset)) {
      stateRef.current.dataset = state.dataset as DatasetItem[];
      setDataset(state.dataset as DatasetItem[]);
    }
    if (typeof state.activeGtVersion === "string") {
      stateRef.current.activeGtVersion = state.activeGtVersion;
      setActiveGtVersion(state.activeGtVersion);
    }
    if (Array.isArray(state.gtHistory)) {
      stateRef.current.gtHistory = state.gtHistory as GroundTruthHistory[];
      setGtHistory(state.gtHistory as GroundTruthHistory[]);
    }
    if (Array.isArray(state.activityLogs)) {
      stateRef.current.activityLogs = state.activityLogs as ActivityLog[];
      setActivityLogs(state.activityLogs as ActivityLog[]);
    }
  }, []);

  const syncFromCloud = useCallback(() => {
    if (Date.now() - lastWriteTimestampRef.current < 1500) return;

    telemetry.updateMetrics({ cloudSyncStatus: "SYNCING" });
    fetch(`/api/sync?_t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.success || !data.state) {
          telemetry.updateMetrics({ cloudSyncStatus: "IDLE" });
          return;
        }
        if (Date.now() - lastWriteTimestampRef.current < 1500) return;
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
        if (p.users) {
          stateRef.current.users = p.users;
          setUsers(p.users);
        }
        if (p.currentUser) setCurrentUser(p.currentUser);
        if (p.dataset) {
          stateRef.current.dataset = p.dataset;
          setDataset(p.dataset);
        }
        if (p.activeGtVersion) {
          stateRef.current.activeGtVersion = p.activeGtVersion;
          setActiveGtVersion(p.activeGtVersion);
        }
        if (p.submissions) {
          stateRef.current.submissions = p.submissions;
          setSubmissions(p.submissions);
        }
        if (p.gtHistory) {
          stateRef.current.gtHistory = p.gtHistory;
          setGtHistory(p.gtHistory);
        }
        if (p.activityLogs) {
          stateRef.current.activityLogs = p.activityLogs;
          setActivityLogs(p.activityLogs);
        }
      }
    } catch {
      // noop
    }

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
      // noop
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
      const nextUsers = [...stateRef.current.users, user];
      stateRef.current.users = nextUsers;
      setUsers(nextUsers);
      setCurrentUser(user);
      pushStateToCloud({ users: nextUsers });
    },
    [pushStateToCloud]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const recomputeAllSubmissionsSync = useCallback(
    (currentDataset: DatasetItem[]): Submission[] => {
      const gtMap: Record<number, ClassLabel> = {};
      for (const item of currentDataset) {
        gtMap[item.id] = item.groundTruthLabel;
      }

      const recomputed = stateRef.current.submissions.map((sub) => {
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
      return ranked.map((s) => ({
        ...s,
        tags: tagsMap[s.id] || [],
      }));
    },
    []
  );

  const updateGroundTruthDataset = useCallback(
    (newDataset: DatasetItem[], reason: string) => {
      const nextVerNum =
        parseFloat(stateRef.current.activeGtVersion.replace("v", "")) + 1.0;
      const nextVerStr = `v${nextVerNum.toFixed(1)}`;

      const { dateWIB, timeWIB, full } = getFormattedWIB();
      const author = currentUser
        ? currentUser.leaderboardName
        : "System";

      const oldSubmissions = [...stateRef.current.submissions];
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
        description: `${author} memperbarui acuan Ground Truth (${newDataset.length} sampel). Alasan: ${reason}`,
        type: "gt_update" as const,
      };

      const nextGtHistory = [gtEntry, ...stateRef.current.gtHistory];
      const nextLogs = [logEntry, ...stateRef.current.activityLogs];
      const nextSubmissions = recomputeAllSubmissionsSync(newDataset);

      stateRef.current.dataset = newDataset;
      stateRef.current.activeGtVersion = nextVerStr;
      stateRef.current.gtHistory = nextGtHistory;
      stateRef.current.activityLogs = nextLogs;
      stateRef.current.submissions = nextSubmissions;

      setDataset(newDataset);
      setActiveGtVersion(nextVerStr);
      setGtHistory(nextGtHistory);
      setActivityLogs(nextLogs);
      setSubmissions(nextSubmissions);

      pushStateToCloud({
        dataset: newDataset,
        activeGtVersion: nextVerStr,
        gtHistory: nextGtHistory,
        activityLogs: nextLogs,
        submissions: nextSubmissions,
      });
    },
    [currentUser, pushStateToCloud, recomputeAllSubmissionsSync]
  );

  const updateSingleGroundTruthLabel = useCallback(
    (itemId: number, newLabel: ClassLabel, reason: string) => {
      const updated = stateRef.current.dataset.map((item) =>
        item.id === itemId ? { ...item, groundTruthLabel: newLabel } : item
      );
      updateGroundTruthDataset(updated, reason);
    },
    [updateGroundTruthDataset]
  );

  const updateGroundTruthBatch = useCallback(
    (changes: Record<number, ClassLabel>, reason: string): number => {
      const changeCount = Object.keys(changes).length;
      if (changeCount === 0) return 0;
      const updated = stateRef.current.dataset.map((item) =>
        changes[item.id] !== undefined
          ? { ...item, groundTruthLabel: changes[item.id] }
          : item
      );
      updateGroundTruthDataset(updated, reason);
      return changeCount;
    },
    [updateGroundTruthDataset]
  );

  const addSubmission = useCallback(
    (params: AddSubmissionParams): Submission => {
      const gtMap: Record<number, ClassLabel> = {};
      for (const item of stateRef.current.dataset) {
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
        title: `Submission Baru (${params.name})`,
        description: `${params.leaderboardName} menambahkan model "${params.modelName}" dengan Macro F1 ${(
          evalSummary.macroF1 * 100
        ).toFixed(2)}%.`,
        type: "submission" as const,
      };

      const nextLogs = [logItem, ...stateRef.current.activityLogs];
      const list = [newSub, ...stateRef.current.submissions];
      list.sort((a, b) => b.testMacroF1 - a.testMacroF1);
      const ranked = list.map((s, idx) => ({ ...s, rank: idx + 1 }));
      const tagsMap = computeAutomaticTags(ranked);
      const nextSubs = ranked.map((s) => ({ ...s, tags: tagsMap[s.id] || [] }));

      stateRef.current.submissions = nextSubs;
      stateRef.current.activityLogs = nextLogs;

      setSubmissions(nextSubs);
      setActivityLogs(nextLogs);

      pushStateToCloud({
        submissions: nextSubs,
        activityLogs: nextLogs,
      });

      return newSub;
    },
    [pushStateToCloud]
  );

  const deleteSubmission = useCallback(
    (id: string) => {
      const filtered = stateRef.current.submissions.filter((s) => s.id !== id);
      const ranked = filtered.map((s, idx) => ({ ...s, rank: idx + 1 }));
      const tagsMap = computeAutomaticTags(ranked);
      const nextSubs = ranked.map((s) => ({ ...s, tags: tagsMap[s.id] || [] }));

      stateRef.current.submissions = nextSubs;
      setSubmissions(nextSubs);
      pushStateToCloud({ submissions: nextSubs });
    },
    [pushStateToCloud]
  );

  const setOfficialSubmission = useCallback(
    (id: string, slot: 1 | 2 | 3 = 1) => {
      const { full } = getFormattedWIB();
      const logItem = {
        id: `log-official-${Date.now()}`,
        timestampWIB: full,
        title: `Official Submission #${slot} Ditetapkan`,
        description: `Submission #${id} ditetapkan pada Slot #${slot} untuk kalibrasi akhir.`,
        type: "system" as const,
      };

      const updated = stateRef.current.submissions.map((s) => {
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
      const nextLogs = [logItem, ...stateRef.current.activityLogs];

      stateRef.current.submissions = nextSubs;
      stateRef.current.activityLogs = nextLogs;

      setSubmissions(nextSubs);
      setActivityLogs(nextLogs);

      pushStateToCloud({
        submissions: nextSubs,
        activityLogs: nextLogs,
      });
    },
    [pushStateToCloud]
  );

  const switchActiveGtVersion = useCallback(
    (version: string) => {
      const { full } = getFormattedWIB();
      const logItem = {
        id: `log-gt-switch-${Date.now()}`,
        timestampWIB: full,
        title: `Versi Ground Truth Aktif (${version})`,
        description: `Versi acuan Ground Truth dikembalikan ke ${version}.`,
        type: "gt_update" as const,
      };

      const nextLogs = [logItem, ...stateRef.current.activityLogs];
      stateRef.current.activeGtVersion = version;
      stateRef.current.activityLogs = nextLogs;

      setActiveGtVersion(version);
      setActivityLogs(nextLogs);

      pushStateToCloud({
        activeGtVersion: version,
        activityLogs: nextLogs,
      });
    },
    [pushStateToCloud]
  );

  const setOfficialActualF1 = useCallback(
    (id: string, actualF1: number) => {
      const updated = stateRef.current.submissions.map((s) =>
        s.id === id ? { ...s, officialActualF1: actualF1 } : s
      );

      stateRef.current.submissions = updated;
      setSubmissions(updated);
      pushStateToCloud({ submissions: updated });
    },
    [pushStateToCloud]
  );

  const resetToDefaultSeeds = useCallback(() => {
    const demoDataset = generateDemoDataset(120);
    const logs = [
      {
        id: "log-reset",
        timestampWIB: getFormattedWIB().full,
        title: "Metadata Contoh Dimuat",
        description: "120 sampel metadata acuan dimuat ke dalam platform.",
        type: "system" as const,
      },
    ];

    stateRef.current.users = DEFAULT_USERS;
    stateRef.current.dataset = demoDataset;
    stateRef.current.activeGtVersion = "v1.0";
    stateRef.current.submissions = [];
    stateRef.current.gtHistory = [];
    stateRef.current.activityLogs = logs;

    setUsers(DEFAULT_USERS);
    setCurrentUser(DEFAULT_USERS[0]);
    setDataset(demoDataset);
    setActiveGtVersion("v1.0");
    setSubmissions([]);
    setGtHistory([]);
    setActivityLogs(logs);

    pushStateToCloud({
      users: DEFAULT_USERS,
      submissions: [],
      dataset: demoDataset,
      activeGtVersion: "v1.0",
      gtHistory: [],
      activityLogs: logs,
    });
  }, [pushStateToCloud]);

  const resetAllProcessToZero = useCallback(() => {
    const logs = [
      {
        id: `log-reset-zero-${Date.now()}`,
        timestampWIB: getFormattedWIB().full,
        title: "Reset Seluruh Data",
        description: "Seluruh data evaluasi dan ground truth direset ke 0.",
        type: "system" as const,
      },
    ];

    stateRef.current.submissions = [];
    stateRef.current.dataset = [];
    stateRef.current.activeGtVersion = "v1.0";
    stateRef.current.gtHistory = [];
    stateRef.current.activityLogs = logs;

    setSubmissions([]);
    setDataset([]);
    setActiveGtVersion("v1.0");
    setGtHistory([]);
    setActivityLogs(logs);

    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // noop
    }

    pushStateToCloud({
      submissions: [],
      dataset: [],
      activeGtVersion: "v1.0",
      gtHistory: [],
      activityLogs: logs,
    });
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
