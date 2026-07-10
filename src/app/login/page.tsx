"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { LogIn, ArrowRight, UserCheck, Cpu } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, users, loginAsLeaderboardName } = useAppStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setErrorMsg("Email dan password wajib diisi."); return; }
    const success = login(email.trim());
    if (success) {
      router.push("/dashboard");
    } else {
      const first = users[0];
      if (first) { loginAsLeaderboardName(first.leaderboardName); router.push("/dashboard"); }
    }
  };

  const handleQuickLogin = (leaderboardName: string) => {
    loginAsLeaderboardName(leaderboardName);
    router.push("/dashboard");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "10px",
    background: "#f8fafc", padding: "10px 14px",
    fontSize: "13px", color: "#0f1b35", fontFamily: "inherit", outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f1b35 0%, #162040 40%, #1a2d5a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "14px",
            background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px",
            boxShadow: "0 8px 24px rgba(29,78,216,0.35)",
          }}>
            <Cpu style={{ width: "26px", height: "26px", color: "#fff" }} />
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 900, color: "#fff", letterSpacing: "-0.4px" }}>
            VisionAI Studio
          </h1>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "4px" }}>
            CV Evaluation Platform — Tim Riset
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "#fff", borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          padding: "28px",
        }}>
          <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0f1b35", marginBottom: "20px" }}>
            Masuk ke Dashboard
          </h2>

          {errorMsg && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", color: "#991b1b", marginBottom: "16px" }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "5px" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rijal@gmail.com"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "5px" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                width: "100%", padding: "11px",
                background: "#162040", border: "none", borderRadius: "10px",
                fontSize: "13px", fontWeight: 700, color: "#fff", cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1e3a72")}
              onMouseLeave={e => (e.currentTarget.style.background = "#162040")}
            >
              <span>Masuk ke Dashboard</span>
              <ArrowRight style={{ width: "15px", height: "15px" }} />
            </button>
          </form>

          {/* Quick login */}
          <div style={{ marginTop: "20px", paddingTop: "18px", borderTop: "1px solid #f1f5f9" }}>
            <p style={{ fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8", textAlign: "center", marginBottom: "10px" }}>
              Pilih Cepat Akun Tim
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u.leaderboardName)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "9px 12px", borderRadius: "9px",
                    border: "1.5px solid #e2e8f0", background: "#f8fafc",
                    fontSize: "12px", fontWeight: 600, color: "#0f1b35",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#1d4ed8"; e.currentTarget.style.background = "#eff6ff"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <UserCheck style={{ width: "14px", height: "14px", color: "#1d4ed8" }} />
                    <strong>{u.leaderboardName}</strong> — {u.fullName}
                  </span>
                  <span style={{ fontSize: "10.5px", color: "#94a3b8", fontFamily: "monospace" }}>
                    {u.email}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "16px", textAlign: "center", fontSize: "12px", color: "#94a3b8" }}>
            Belum terdaftar?{" "}
            <Link href="/register" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>
              Registrasi Akun
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
