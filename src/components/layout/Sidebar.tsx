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
    { name: "Riwayat Eksperimen", href: "/lineage", icon: GitBranch, badge: "Alur" },
    { name: "Pilihan Resmi", href: "/official-calibration", icon: Target, badge: "Slot" },
    { name: "Data Test & GT", href: "/ground-truth", icon: Database },
    { name: "Analisis Data", href: "/analysis", icon: BarChart2 },
    { name: "Perkembangan", href: "/progression", icon: TrendingUp },
    { name: "Perbandingan", href: "/compare", icon: GitCompare },
    { name: "Riwayat Perubahan", href: "/history", icon: History },
    { name: "Debug SRE", href: "/debug", icon: Cpu, badge: "Live" },
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
      style={{
        background:
          "linear-gradient(180deg, #0e1732 0%, #111a3d 50%, #152252 100%)",
        transition: "width 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        width: isCollapsed ? "84px" : "264px",
        minWidth: isCollapsed ? "84px" : "264px",
      }}
      className="sticky top-0 z-40 flex h-screen flex-col text-white shadow-xl shrink-0 select-none"
    >
      <div
        style={{
          height: "80px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
        className="flex items-center justify-between px-6 shrink-0"
      >
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-3.5 min-w-0">
            <div
              style={{
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                borderRadius: "14px",
                boxShadow: "0 8px 20px -4px rgba(59, 130, 246, 0.45)",
              }}
              className="flex h-10 w-10 items-center justify-center shrink-0"
            >
              <Cpu style={{ width: "20px", height: "20px", color: "#fff" }} />
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span
                style={{
                  fontSize: "14.5px",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.4px",
                }}
              >
                VisionAI Studio
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.45)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Platform Evaluasi CV
              </span>
            </div>
          </Link>
        )}
        {isCollapsed && (
          <div className="mx-auto">
            <Link href="/dashboard">
              <div
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  borderRadius: "14px",
                  boxShadow: "0 8px 20px -4px rgba(59, 130, 246, 0.45)",
                }}
                className="flex h-10 w-10 items-center justify-center"
              >
                <Cpu style={{ width: "20px", height: "20px", color: "#fff" }} />
              </div>
            </Link>
          </div>
        )}
        {!isCollapsed && (
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            style={{ borderRadius: "10px", padding: "7px" }}
            className="text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            title="Tutup Sidebar"
          >
            <PanelLeftClose style={{ width: "17px", height: "17px" }} />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="flex justify-center py-3">
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            style={{ borderRadius: "10px", padding: "7px" }}
            className="text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            title="Buka Sidebar"
          >
            <PanelLeftOpen style={{ width: "17px", height: "17px" }} />
          </button>
        </div>
      )}

      {!isCollapsed && (
        <div
          style={{
            padding: "22px 24px 8px",
            fontSize: "10.5px",
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
          }}
        >
          Navigasi
        </div>
      )}

      <nav
        className="flex-1 overflow-y-auto"
        style={{ padding: isCollapsed ? "12px 10px" : "8px 16px 16px" }}
      >
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isCollapsed ? "0" : "12px",
                  justifyContent: isCollapsed ? "center" : "space-between",
                  padding: isCollapsed ? "13px" : "11px 16px",
                  borderRadius: "16px",
                  transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                  background: isActive ? "#ffffff" : "transparent",
                  fontWeight: isActive ? 800 : 500,
                  fontSize: "13.5px",
                  color: isActive ? "#0f1b35" : "rgba(255,255,255,0.65)",
                  textDecoration: "none",
                  boxShadow: isActive
                    ? "0 10px 25px -5px rgba(0, 0, 0, 0.25)"
                    : "none",
                }}
                className={
                  isActive ? "" : "hover:bg-white/[0.08] hover:text-white"
                }
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <Icon
                    style={{
                      width: "18px",
                      height: "18px",
                      flexShrink: 0,
                      color: isActive ? "#2563eb" : "rgba(255,255,255,0.55)",
                    }}
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span
                    style={{
                      fontSize: "9.5px",
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: "9999px",
                      background: isActive
                        ? "#eff6ff"
                        : "rgba(255,255,255,0.12)",
                      color: isActive ? "#2563eb" : "rgba(255,255,255,0.7)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: isCollapsed ? "14px 10px" : "16px 20px",
        }}
        className="shrink-0"
      >
        {!isCollapsed ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
              className="hover:bg-white/[0.1] transition-colors"
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #3b82f6, #1e40af)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13.5px",
                    fontWeight: 800,
                    color: "#fff",
                  }}
                >
                  {userInitial}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div
                    style={{ fontSize: "12.5px", fontWeight: 800, color: "#fff" }}
                  >
                    {userName}
                  </div>
                  <div
                    style={{
                      fontSize: "10.5px",
                      color: "rgba(255,255,255,0.45)",
                    }}
                  >
                    {userRole}
                  </div>
                </div>
              </div>
              {isAccountMenuOpen ? (
                <ChevronUp
                  style={{
                    width: "16px",
                    height: "16px",
                    color: "rgba(255,255,255,0.5)",
                  }}
                />
              ) : (
                <ChevronDown
                  style={{
                    width: "16px",
                    height: "16px",
                    color: "rgba(255,255,255,0.5)",
                  }}
                />
              )}
            </button>

            {isAccountMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  bottom: "105%",
                  left: 0,
                  width: "100%",
                  background: "#162040",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  padding: "8px",
                  boxShadow: "0 -10px 30px rgba(0,0,0,0.5)",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.4)",
                    padding: "4px 8px",
                  }}
                >
                  PILIH AKUN PENGGUNA
                </div>
                <div className="space-y-1 mt-1">
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
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          borderRadius: "10px",
                          fontSize: "12px",
                          background: active
                            ? "rgba(59, 130, 246, 0.2)"
                            : "transparent",
                          color: active ? "#60a5fa" : "rgba(255,255,255,0.8)",
                          cursor: "pointer",
                        }}
                        className="hover:bg-white/[0.08]"
                      >
                        <span style={{ fontWeight: active ? 700 : 500 }}>
                          {u.leaderboardName}
                        </span>
                        {active && (
                          <Check
                            style={{
                              width: "14px",
                              height: "14px",
                              color: "#60a5fa",
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #3b82f6, #1e40af)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 800,
                color: "#fff",
              }}
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
