import {
  UserProfile,
  DatasetItem,
  Submission,
  GroundTruthHistory,
  ActivityLog,
  ClassLabel,
} from "@/types";


export const DEFAULT_USERS: UserProfile[] = [
  {
    id: "user-rijal",
    fullName: "Rijal",
    leaderboardName: "Rijal",
    email: "rijal@gmail.com",
    role: "Ketua",
  },
  {
    id: "user-fikri",
    fullName: "Fikri",
    leaderboardName: "Fikri",
    email: "fikri@gmail.com",
    role: "Anggota",
  },
  {
    id: "user-riskan",
    fullName: "Riskan",
    leaderboardName: "Riskan",
    email: "riskan@gmail.com",
    role: "Anggota",
  },
];

export const INITIAL_DATASET: DatasetItem[] = [];

export const INITIAL_SUBMISSIONS: Submission[] = [];

export const INITIAL_GT_HISTORY: GroundTruthHistory[] = [];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "log-init",
    timestampWIB: "Sistem Aktif",
    title: "Platform Evaluasi Siap Digunakan",
    description:
      "Silakan unggah Dataset Test (ZIP) dan Ground Truth (CSV label 0, 1, 2) untuk memulai evaluasi.",
    type: "system",
  },
];

export function generateDemoDataset(count = 120): DatasetItem[] {
  const labels: ClassLabel[] = ["Recyclable", "Electronic", "Organic"];
  const list: DatasetItem[] = [];
  for (let i = 1; i <= count; i++) {
    list.push({
      id: i,
      imageNumber: i,
      groundTruthLabel: labels[(i - 1) % 3],
    });
  }
  return list;
}
