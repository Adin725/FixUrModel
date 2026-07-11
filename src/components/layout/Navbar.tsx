"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import {
  LayoutDashboard,
  Database,
  Trophy,
  BarChart2,
  TrendingUp,
  GitCompare,
  History,
  ChevronDown,
  UserCheck,
  Check,
  Cpu,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, users, loginAsLeaderboardName, activeGtVersion, dataset } =
    useAppStore();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Data Test & GT", href: "/ground-truth", icon: Database },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "Analisis GT", href: "/analysis", icon: BarChart2 },
    { name: "Perkembangan", href: "/progression", icon: TrendingUp },
    { name: "Komparasi", href: "/compare", icon: GitCompare },
    { name: "Audit GT", href: "/history", icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-xs group-hover:bg-blue-600 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:group-hover:bg-blue-500 dark:group-hover:text-white">
              <Cpu className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-zinc-900 dark:text-white leading-none">
                CV Decision Platform
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase mt-0.5">
                Evaluation System
              </span>
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-2 pl-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-zinc-50 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 whitespace-nowrap dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>
                GT: <strong className="font-mono">{activeGtVersion}</strong> (
                {dataset.length} Gambar)
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/80 px-2.5 py-1 text-[10px] font-bold text-blue-700 whitespace-nowrap dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
              <span>Multi-Device Cloud Sync: Aktif</span>
            </span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-2xs dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 shrink-0 ${
                    isActive
                      ? "text-white dark:text-zinc-900"
                      : "text-zinc-400"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="relative flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            className="flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-2xs hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-700 transition-all"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-[11px] font-bold text-white">
              {currentUser ? currentUser.leaderboardName.charAt(0) : "?"}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="font-bold text-zinc-900 dark:text-white">
                {currentUser ? currentUser.leaderboardName : "Akun"}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {currentUser ? currentUser.email : ""}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          </button>

          {isAccountMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Ganti Akun Anggota Tim
              </div>
              <div className="space-y-1 mt-1">
                {users.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        loginAsLeaderboardName(u.leaderboardName);
                        setIsAccountMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        isCurrent
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-bold"
                          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                        <span>{u.leaderboardName}</span>
                      </span>
                      {isCurrent && <Check className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
