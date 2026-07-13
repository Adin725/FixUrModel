import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppStoreProvider } from "@/lib/store";
import { AppLayout } from "@/components/layout/AppLayout";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Platform Evaluasi CV & Ground Truth",
  description:
    "Platform evaluasi model Computer Vision dan manajemen Ground Truth tabular untuk penelitian tim",
  keywords: [
    "computer vision",
    "machine learning",
    "model evaluation",
    "leaderboard",
    "ground truth",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} antialiased`}
        style={{
          fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
        }}
      >
        <AppStoreProvider>
          <AppLayout>{children}</AppLayout>
        </AppStoreProvider>
      </body>
    </html>
  );
}
