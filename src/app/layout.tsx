import type { Metadata } from "next";
import { Be_Vietnam_Pro, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/app/toast";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Ký Ức Quan Hệ",
  description: "Quản lý các mối quan hệ cá nhân bằng sơ đồ trực quan dạng graph/tree.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className={`${beVietnam.variable} ${spaceGrotesk.variable}`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

