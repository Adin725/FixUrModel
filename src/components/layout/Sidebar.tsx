"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import {
  LayoutDashboard,
  Trophy,
  GitBranch,
  Target,
  Database,
  BarChart2,
  TrendingUp,
  GitCompare,
  History,
  PanelLeftClose,
  PanelLeftOpen,
  Cpu,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, users, loginAsLeaderboardName } = useAppStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const navItems = [
    { name: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
    { name: "Peringkat Model", href: "/leaderboard", icon: Trophy },
    {
      name: "Riwayat Eksperimen",
      href: "/lineage",
      icon: GitBranch,
      badge: "Alur",
    },
    {
      name: "Pilihan Resmi",
      href: "/official-calibration",
      icon: Target,
      badge: "Slot",
    },
    { name: "Data Test & GT", href: "/ground-truth", icon: Database },
    { name: "Analisis Data", href: "/analysis", icon: BarChart2 },
    { name: "Perkembangan", href: "/progression", icon: TrendingUp },
    { name: "Perbandingan", href: "/compare", icon: GitCompare },
    { name: "Riwayat Perubahan", href: "/history", icon: History },
  ];

  const userInitial = currentUser
    ? currentUser.leaderboardName.charAt(0).toUpperCase()
    : "R";
  const userName = currentUser ? currentUser.leaderboardName : "Rijal";
  const userRole =
    currentUser?.role ||
    (currentUser?.leaderboardName === "Rijal"
      ? "Ketua Tim"
      : "Anggota Tim");

  return (
    <aside
      className={`sticky top-0 z-40 flex h-screen flex-col border-r border-zinc-200/80 bg-zinc-900 text-zinc-100 transition-all duration-300 select-none dark:border-zinc-800 dark:bg-zinc-950 ${
        isCollapsed ? "w-20 min-w-20" : "w-64 min-w-64"
      }`}
    >
      <div className="flex h-20 shrink-0 items-center justify-between border-b border-zinc-800 px-5">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Cpu className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-sm font-black tracking-tight text-white">
                VisionAI Studio
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Platform Evaluasi CV
              </span>
            </div>
          </Link>
        )}

        {isCollapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Cpu className="h-5 w-5" />
            </div>
          </Link>
        )}

        {!isCollapsed && (
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            title="Tutup Sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="flex justify-center py-2.5">
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            title="Buka Sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </div>
      )}

      {!isCollapsed && (
        <div className="px-5 pt-5 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Navigasi
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? "text-blue-600" : "text-zinc-400"
                    }`}
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="shrink-0 border-t border-zinc-800 p-3.5">
        {!isCollapsed ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2.5 transition-colors hover:bg-zinc-800"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                  {userInitial}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">
                    {userName}
                  </div>
                  <div className="text-[10px] text-zinc-400">{userRole}</div>
                </div>
              </div>
              {isAccountMenuOpen ? (
                <ChevronUp className="h-4 w-4 text-zinc-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-zinc-400" />
              )}
            </button>

            {isAccountMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 shadow-xl">
                <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                  Pilih Peneliti
                </div>
                <div className="mt-1 space-y-1">
                  {users.map((u) => {
                    const active = currentUser?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          loginAsLeaderboardName(u.leaderboardName);
                          setIsAccountMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors ${
                          active
                            ? "bg-blue-600/20 font-bold text-blue-400"
                            : "text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        <span>{u.leaderboardName}</span>
                        {active && <Check className="h-3.5 w-3.5 text-blue-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white"
              title={`${userName} (${userRole})`}
            >
              {userInitial}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
