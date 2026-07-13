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
  Sparkles,
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
    (currentUser?.leaderboardName === "Rijal" ? "Ketua Tim" : "Anggota Tim");

  return (
    <aside
      className={`sticky top-0 z-40 flex h-screen flex-col bg-gradient-to-b from-[#4d3fa3] to-[#3a2d85] text-white transition-all duration-300 select-none dark:from-[#131124] dark:to-[#0e0c1a] ${
        isCollapsed ? "w-22 min-w-22" : "w-68 min-w-68"
      }`}
      style={{
        borderTopRightRadius: "32px",
        borderBottomRightRadius: "32px",
        boxShadow: "8px 0 36px rgba(45, 34, 110, 0.18)",
      }}
    >
      <div className="flex h-20 shrink-0 items-center justify-between px-6">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#4d3fa3] shadow-md dark:bg-indigo-500 dark:text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-base font-black tracking-tight text-white">
                VisionAI Studio
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 dark:text-indigo-400">
                Platform Evaluasi CV
              </span>
            </div>
          </Link>
        )}

        {isCollapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#4d3fa3] shadow-md dark:bg-indigo-500 dark:text-white">
              <Sparkles className="h-6 w-6" />
            </div>
          </Link>
        )}

        {!isCollapsed && (
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="rounded-xl p-2 text-indigo-200 transition-colors hover:bg-white/10 hover:text-white"
            title="Tutup Sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="flex justify-center py-2">
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="rounded-xl p-2 text-indigo-200 transition-colors hover:bg-white/10 hover:text-white"
            title="Buka Sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-4 py-3">
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-white text-[#382b80] shadow-lg dark:bg-indigo-600 dark:text-white"
                    : "text-indigo-100 hover:bg-white/15 hover:text-white"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive
                        ? "text-[#4d3fa3] dark:text-white"
                        : "text-indigo-200"
                    }`}
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                      isActive
                        ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200"
                        : "bg-white/20 text-white"
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

      <div className="shrink-0 p-4">
        {!isCollapsed ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="flex w-full items-center justify-between rounded-2xl bg-white/15 px-3.5 py-3 transition-colors hover:bg-white/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-xs font-black text-[#4d3fa3] shadow-sm">
                  {userInitial}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">
                    {userName}
                  </div>
                  <div className="text-[10px] text-indigo-200">{userRole}</div>
                </div>
              </div>
              {isAccountMenuOpen ? (
                <ChevronUp className="h-4 w-4 text-indigo-200" />
              ) : (
                <ChevronDown className="h-4 w-4 text-indigo-200" />
              )}
            </button>

            {isAccountMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full rounded-2xl bg-[#2e236b] p-2.5 shadow-2xl border border-white/15 dark:bg-zinc-900">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                  Pilih Peneliti Aktif
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
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                          active
                            ? "bg-white text-[#4d3fa3] font-bold"
                            : "text-indigo-100 hover:bg-white/10"
                        }`}
                      >
                        <span>{u.leaderboardName}</span>
                        {active && (
                          <Check className="h-3.5 w-3.5 text-[#4d3fa3]" />
                        )}
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
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xs font-black text-[#4d3fa3] shadow-sm"
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
