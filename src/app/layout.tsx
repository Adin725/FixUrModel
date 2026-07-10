import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppStoreProvider } from "@/lib/store";
import { AppLayout } from "@/components/layout/AppLayout";
import { ImagePreviewModal } from "@/components/ui/ImagePreviewModal";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VisionAI Studio — CV Evaluation Platform",
  description: "Platform evaluasi dan analisis eksperimen model Computer Vision bertaraf profesional untuk tim penelitian Rijal, Fikri, dan Riskan",
  keywords: ["computer vision", "machine learning", "model evaluation", "leaderboard", "ground truth"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} antialiased`}
        style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}
      >
        <AppStoreProvider>
          <AppLayout>{children}</AppLayout>
          <ImagePreviewModal />
        </AppStoreProvider>
      </body>
    </html>
  );
}
