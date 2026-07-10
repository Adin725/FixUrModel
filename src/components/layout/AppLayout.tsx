"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%", background: "#f4f7fb" }}>
      <Sidebar />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, overflow: "hidden" }}>
        <TopHeader />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
};
