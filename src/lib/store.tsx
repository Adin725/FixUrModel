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
import {
  saveImageMapToIndexedDB,
  loadImageMapFromIndexedDB,
  clearImageMapIndexedDB,
} from "./imageStorage";
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
  imageMap: Record<number, string>;
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
  fetchImageById: (id: number) => Promise<string | null>;

  resetToDefaultSeeds: () => void;
  resetAllProcessToZero: () => void;
}

const AppStoreContext = createContext<AppStoreContextType | undefined>(
  undefined
);

const LOCAL_STORAGE_KEY = "cv_dsp_store_state_v2";

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
  const [imageMap, setImageMap] = useState<Record<number, string>>({});
  const [previewImageModalId, setPreviewImageModalId] = useState<number | null>(
    null
  );

  const [isCloudReady, setIsCloudReady] = useState(false);

  // Timestamp terakhir kali device ini menulis ke cloud.
  // Selama cooldown aktif, SEMUA pembacaan dari cloud DIBLOKIR
  // agar data lokal yang baru saja ditulis tidak tertimpa oleh data lama.
  const lastWriteTimestampRef = useRef(0);
  const WRITE_COOLDOWN_MS = 10000; // 10 detik cooldown setelah menulis

  const applyCloudState = useCallback((state: Record<string, unknown>) => {
    if (Array.isArray(state.users)) {
      setUsers(state.users as UserProfile[]);
    }
    if (Array.isArray(state.submissions)) {
      setSubmissions(state.submissions as Submission[]);
    }
    if (Array.isArray(state.dataset)) {
      setDataset(state.dataset as DatasetItem[]);
    }
    if (typeof state.activeGtVersion === "string") {
      setActiveGtVersion(state.activeGtVersion);
    }
    if (Array.isArray(state.gtHistory)) {
      setGtHistory(state.gtHistory as GroundTruthHistory[]);
    }
    if (Array.isArray(state.activityLogs)) {
      setActivityLogs(state.activityLogs as ActivityLog[]);
    }
    if (state.imageMap && typeof state.imageMap === "object") {
      const rawMap = state.imageMap as Record<string, string>;
      const normalizedMap: Record<number, string> = {};
      for (const [k, v] of Object.entries(rawMap)) {
        const numKey = Number(k);
        if (!isNaN(numKey) && typeof v === "string") {
          normalizedMap[numKey] = v;
        }
      }
      if (Object.keys(normalizedMap).length > 0) {
        setImageMap((prev) => {
          const merged = { ...prev, ...normalizedMap };
          saveImageMapToIndexedDB(merged);
          return merged;
        });
      }
    }
  }, []);

  const syncFromCloud = useCallback(() => {
    // BLOKIR pembacaan cloud jika baru saja menulis (cooldown aktif)
    const elapsed = Date.now() - lastWriteTimestampRef.current;
    if (elapsed < WRITE_COOLDOWN_MS) {
      return;
    }

    fetch("/api/sync")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.state) {
          const elapsedAfterFetch = Date.now() - lastWriteTimestampRef.current;
          if (elapsedAfterFetch < WRITE_COOLDOWN_MS) {
            return;
          }
          applyCloudState(data.state);
        }
      })
      .catch((err) => console.error("Gagal sinkronisasi dari cloud:", err))
      .finally(() => setIsCloudReady(true));

    fetch("/api/images")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.imageMap) {
          const cloudMap = data.imageMap as Record<number, string>;
          if (Object.keys(cloudMap).length > 0) {
            setImageMap((prev) => {
              const merged = { ...prev, ...cloudMap };
              saveImageMapToIndexedDB(merged);
              return merged;
            });
          }
        }
      })
      .catch((err) => console.error("Gagal sinkronisasi gambar dari cloud:", err));
  }, [applyCloudState]);

  const fetchImageById = useCallback(
    async (id: number): Promise<string | null> => {
      if (imageMap[id]) return imageMap[id];
      try {
        const res = await fetch(`/api/images?ids=${id}`);
        const data = await res.json();
        if (data && data.success && data.imageMap && data.imageMap[id]) {
          const fetchedImage = data.imageMap[id] as string;
          setImageMap((prev) => {
            const merged = { ...prev, [id]: fetchedImage };
            saveImageMapToIndexedDB(merged);
            return merged;
          });
          return fetchedImage;
        }
      } catch (err) {
        console.error(`Gagal mengambil gambar ID #${id}:`, err);
      }
      return null;
    },
    [imageMap]
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.currentUser) setCurrentUser(parsed.currentUser);
        if (parsed.dataset) setDataset(parsed.dataset);
        if (parsed.activeGtVersion) setActiveGtVersion(parsed.activeGtVersion);
        if (parsed.submissions) setSubmissions(parsed.submissions);
        if (parsed.gtHistory) setGtHistory(parsed.gtHistory);
        if (parsed.activityLogs) setActivityLogs(parsed.activityLogs);
      }
    } catch {
      // Abaikan kesalahan pembacaan penyimpanan lokal
    }

    loadImageMapFromIndexedDB().then((savedMap) => {
      if (savedMap && Object.keys(savedMap).length > 0) {
        setImageMap(savedMap);
      }
    });

    // Sinkronisasi pertama saat aplikasi dibuka
    syncFromCloud();

    // Sinkronisasi saat user kembali ke tab/window ini (bukan polling agresif)
    window.addEventListener("focus", syncFromCloud);
    // Juga sync saat visibilitas berubah (user buka tab lain lalu kembali)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        syncFromCloud();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", syncFromCloud);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [syncFromCloud]);

  const pushStateToCloud = useCallback((payload: Record<string, unknown>) => {
    // Aktifkan cooldown: blokir semua pembacaan cloud selama 10 detik
    lastWriteTimestampRef.current = Date.now();

    const bodyStr = JSON.stringify(payload);

    // Vercel serverless functions memiliki batas body 4.5MB.
    // Jika payload terlalu besar (biasanya karena imageMap berisi base64),
    // kirim TANPA imageMap agar data lain (submissions, dataset, dll) tetap tersimpan.
    const MAX_BODY_BYTES = 4 * 1024 * 1024; // 4MB safety margin
    if (bodyStr.length > MAX_BODY_BYTES && payload.imageMap) {
      console.warn(
        `Payload terlalu besar (${(bodyStr.length / 1024 / 1024).toFixed(1)}MB). Mengirim tanpa imageMap.`
      );
      const { imageMap: _removed, ...rest } = payload;
      void _removed;
      fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rest),
      }).catch((err) => console.error("Gagal menyimpan ke database cloud:", err));
      return;
    }

    fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: bodyStr,
    }).catch((err) => console.error("Gagal menyimpan ke database cloud:", err));
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
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    const newImageMap: Record<number, string> = {};
    let extractedCount = 0;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const fileEntries = Object.keys(contents.files);
    const extractedEntries: Array<{ id: number; zipEntry: JSZip.JSZipObject; mimeType: string }> = [];

    for (const relativePath of fileEntries) {
      const zipEntry = contents.files[relativePath];
      if (zipEntry.dir) continue;

      const filename = relativePath.split("/").pop() || "";
      const match = filename.match(/^(\d+)\.(jpg|jpeg|png|webp|gif|bmp)$/i);
      if (match) {
        const id = parseInt(match[1], 10);
        if (!isNaN(id)) {
          const ext = match[2].toLowerCase();
          const mimeType =
            ext === "png"
              ? "image/png"
              : ext === "webp"
              ? "image/webp"
              : "image/jpeg";
          extractedEntries.push({ id, zipEntry, mimeType });
        }
      }
    }

    if (cloudName && uploadPreset) {
      // STRATEGI A (Cloudinary CDN Enterprise Mode)
      // Unggah langsung ke CDN dalam batch paralel ringan sehingga database hanya menyimpan URL pendek
      const CONCURRENCY = 5;
      for (let i = 0; i < extractedEntries.length; i += CONCURRENCY) {
        const batch = extractedEntries.slice(i, i + CONCURRENCY);
        await Promise.all(
          batch.map(async ({ id, zipEntry, mimeType }) => {
            try {
              const blob = await zipEntry.async("blob");
              const formData = new FormData();
              formData.append("file", blob, `${id}.jpg`);
              formData.append("upload_preset", uploadPreset);
              const res = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                { method: "POST", body: formData }
              );
              const data = await res.json();
              if (data && data.secure_url) {
                newImageMap[id] = data.secure_url;
                extractedCount += 1;
              }
            } catch (err) {
              console.error(`Gagal upload CDN Cloudinary untuk ID #${id}:`, err);
            }
          })
        );
      }
    } else {
      // Mode Reguler (Base64 fallback jika Cloudinary belum dikonfigurasi)
      for (const { id, zipEntry, mimeType } of extractedEntries) {
        const base64Data = await zipEntry.async("base64");
        newImageMap[id] = `data:${mimeType};base64,${base64Data}`;
        extractedCount += 1;
      }
    }

    setImageMap((prev) => {
      const merged = { ...prev, ...newImageMap };
      saveImageMapToIndexedDB(merged);
      return merged;
    });

    if (extractedCount > 0 && dataset.length === 0) {
      const ids = Object.keys(newImageMap)
        .map(Number)
        .sort((a, b) => a - b);
      const generatedDataset: DatasetItem[] = ids.map((id) => ({
        id,
        imageNumber: id,
        groundTruthLabel: "Recyclable",
      }));
      setDataset(generatedDataset);
    }

    const { full } = getFormattedWIB();
    const logItem = {
      id: `log-zip-${Date.now()}`,
      timestampWIB: full,
      title: "ZIP Gambar Test Diunggah",
      description: `Berhasil membaca dan mengekstrak ${extractedCount} gambar test dari file ${file.name}.`,
      type: "system" as const,
    };

    setActivityLogs((prev) => [logItem, ...prev]);

    // OPSI B PERFECTION: Pre-Warm Handshake & Auto-Reconcile Verification Loop
    // Menjamin 100% seluruh ID gambar pasti tersimpan ke server cloud tanpa ada yang terlewat
    const entries = Object.entries(newImageMap);
    const isCdnMode = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    const BATCH_SIZE = isCdnMode ? 100 : 10;
    (async () => {
      // 1. Pre-warm handshake agar koneksi database siap (mencegah cold-start drop pada batch awal)
      try {
        await fetch("/api/images?ping=1");
      } catch {
        // abaikan ping error
      }

      const uploadMissingBatches = async (idsToUpload: number[]) => {
        for (let i = 0; i < idsToUpload.length; i += BATCH_SIZE) {
          const batchIds = idsToUpload.slice(i, i + BATCH_SIZE);
          const batchMap: Record<number, string> = {};
          for (const id of batchIds) {
            if (newImageMap[id]) batchMap[id] = newImageMap[id];
          }
          let success = false;
          for (let attempt = 1; attempt <= 3 && !success; attempt++) {
            try {
              const res = await fetch("/api/images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ images: batchMap }),
              });
              if (res.ok) success = true;
            } catch (err) {
              console.error(`Gagal upload batch attempt #${attempt}:`, err);
            }
            if (!success) await new Promise((r) => setTimeout(r, 500));
          }
        }
      };

      // 2. Upload awal untuk semua gambar
      const allIds = entries.map(([idStr]) => Number(idStr));
      await uploadMissingBatches(allIds);

      // 3. Auto-Reconciliation Loop: Cek ID di server dan upload ulang ID yang sempat terlewat
      for (let pass = 1; pass <= 3; pass++) {
        try {
          const checkRes = await fetch("/api/images?checkIds=1");
          const checkData = await checkRes.json();
          if (checkData && checkData.success && Array.isArray(checkData.ids)) {
            const serverIdsSet = new Set<number>(checkData.ids);
            const missingIds = allIds.filter((id) => !serverIdsSet.has(id));
            if (missingIds.length === 0) {
              break;
            } else {
              await uploadMissingBatches(missingIds);
            }
          }
        } catch {
          // abaikan kesalahan sementara
        }
      }
    })();

    pushStateToCloud({
      dataset: dataset.length === 0 ? [] : dataset,
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

      // Pre-compute old vs new impact across submissions
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

      setGtHistory((prev) => [gtEntry, ...prev]);

      const logEntry = {
        id: `log-gt-${Date.now()}`,
        timestampWIB: full,
        title: `Ground Truth Diperbarui (${nextVerStr})`,
        description: `${author} memperbarui Ground Truth (${newDataset.length} sampel). Alasan: ${reason}`,
        type: "gt_update" as const,
      };

      setActivityLogs((prev) => [logEntry, ...prev]);

      pushStateToCloud({
        dataset: newDataset,
        activeGtVersion: nextVerStr,
      });

      recomputeAllSubmissions(newDataset);
    },
    [activeGtVersion, currentUser, pushStateToCloud, recomputeAllSubmissions, submissions]
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

      setSubmissions((prev) => {
        const list = [newSub, ...prev];
        list.sort((a, b) => b.testMacroF1 - a.testMacroF1);
        const ranked = list.map((s, idx) => ({ ...s, rank: idx + 1 }));
        const tagsMap = computeAutomaticTags(ranked);
        const nextSubs = ranked.map((s) => ({ ...s, tags: tagsMap[s.id] || [] }));
        pushStateToCloud({ submissions: nextSubs });
        return nextSubs;
      });

      setActivityLogs((prev) => [
        {
          id: `log-sub-${Date.now()}`,
          timestampWIB: full,
          title: `Submission Baru Diunggah (${params.name})`,
          description: `${params.leaderboardName} mengunggah model "${params.modelName}" dengan Macro F1 Test ${(
            evalSummary.macroF1 * 100
          ).toFixed(2)}%.`,
          type: "submission",
        },
        ...prev,
      ]);

      return newSub;
    },
    [dataset, pushStateToCloud]
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
        pushStateToCloud({ submissions: nextSubs });
        return nextSubs;
      });
      setActivityLogs((prev) => [
        {
          id: `log-official-${Date.now()}`,
          timestampWIB: full,
          title: `Official Submission #${slot} Ditetapkan`,
          description: `Submission dengan ID #${id} dipilih sebagai Official Submission #${slot} untuk evaluasi kalibrasi akhir.`,
          type: "system",
        },
        ...prev,
      ]);
    },
    [pushStateToCloud]
  );

  const switchActiveGtVersion = useCallback((version: string) => {
    const { full } = getFormattedWIB();
    setActiveGtVersion(version);
    pushStateToCloud({ activeGtVersion: version });
    setActivityLogs((prev) => [
      {
        id: `log-gt-switch-${Date.now()}`,
        timestampWIB: full,
        title: `Ground Truth Aktif Berubah (${version})`,
        description: `Versi Ground Truth aktif dikembalikan / disetel ke ${version}.`,
        type: "gt_update",
      },
      ...prev,
    ]);
  }, []);

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
    lastWriteTimestampRef.current = Date.now();
    const demoDataset = generateDemoDataset(120);
    const logs = [
      {
        id: "log-reset",
        timestampWIB: getFormattedWIB().full,
        title: "Dataset Contoh Dimuat",
        description: "120 sampel contoh telah dimuat ke dalam platform.",
        type: "system" as const,
      },
    ];
    setUsers(DEFAULT_USERS);
    setCurrentUser(DEFAULT_USERS[0]);
    setDataset(demoDataset);
    setActiveGtVersion("v1.0");
    setSubmissions([]);
    setGtHistory([]);
    setActivityLogs(logs);
    setImageMap({});
    clearImageMapIndexedDB();

    fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        users: DEFAULT_USERS,
        submissions: [],
        dataset: demoDataset,
        activeGtVersion: "v1.0",
        gtHistory: [],
        activityLogs: logs,
        imageMap: {},
        reset: true,
      }),
    }).catch(() => {});

    fetch("/api/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reset: true }),
    }).catch(() => {});
  }, []);

  const resetAllProcessToZero = useCallback(() => {
    lastWriteTimestampRef.current = Date.now();
    const logs = [
      {
        id: `log-reset-zero-${Date.now()}`,
        timestampWIB: getFormattedWIB().full,
        title: "Reset Seluruh Data ke 0",
        description: "Seluruh data submission, ground truth manual, dan gambar telah direset ke 0.",
        type: "system" as const,
      },
    ];
    setSubmissions([]);
    setDataset([]);
    setImageMap({});
    setActiveGtVersion("v1.0");
    setGtHistory([]);
    setActivityLogs(logs);
    clearImageMapIndexedDB();
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // ignore
    }

    fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submissions: [],
        dataset: [],
        activeGtVersion: "v1.0",
        gtHistory: [],
        activityLogs: logs,
        imageMap: {},
        reset: true,
      }),
    }).catch(() => {});

    fetch("/api/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reset: true }),
    }).catch(() => {});
  }, []);

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
        imageMap,
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
        fetchImageById,

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
