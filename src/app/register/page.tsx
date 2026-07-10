"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { UserPlus, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAppStore();

  const [fullName, setFullName] = useState("");
  const [leaderboardName, setLeaderboardName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !leaderboardName || !email || !password) {
      setErrorMsg("Semua kolom wajib diisi.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi password tidak cocok dengan password.");
      return;
    }
    register({
      id: `user-${Date.now()}`,
      fullName: fullName.trim(),
      leaderboardName: leaderboardName.trim(),
      email: email.trim().toLowerCase(),
    });
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Tahap Pertama — Registrasi Akun
            </h1>
            <p className="text-xs text-zinc-500">
              Buat akun anggota tim untuk mengelola platform evaluasi
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Alex Chen"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nama Leaderboard
            </label>
            <input
              type="text"
              value={leaderboardName}
              onChange={(e) => setLeaderboardName(e.target.value)}
              placeholder="Contoh: AlexC_Vision"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-mono text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              required
            />
            <p className="mt-1 text-[11px] text-zinc-500">
              Nama ini akan ditampilkan pada seluruh leaderboard dan riwayat
              perubahan Ground Truth.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex.chen@cvteam.id"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Konfirmasi Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <span>Daftar Akun Sekarang</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 border-t border-zinc-100 pt-4 text-center text-xs text-zinc-500 dark:border-zinc-800">
          Sudah memiliki akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            Masuk ke halaman Login
          </Link>
        </div>
      </div>
    </div>
  );
}
