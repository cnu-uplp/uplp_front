import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import LiquidHero from "@/components/motion/LiquidHero";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UPLP SWIM | 수영 동아리",
  description: "UPLP 수영 동아리 공식 웹사이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* 사이트 전역: 마우스를 따라 일렁거리는 물 배경.
            모든 페이지·스크롤 위치에서 콘텐츠 뒤에 고정으로 깔린다.

            배경 사진: "Life's a Bit Pink" © graham earnshaw (CC BY-NC-ND 2.0).
            저작자 허락을 받아 Real-ESRGAN 2패스로 업스케일(1024x684 → 6144x4104)했다.
            원본 그대로는 zoom 배율(약 4배) 때문에 화면에서 뭉개져 보였다. */}
        <div className="fixed inset-0 -z-10">
          <LiquidHero
            src="/pink_lake.jpg"
            cursorPower={0.55}
            cursorSize={0.5}
            distortionPower={0.5}
            zoom={1}
            fit="cover"
            resolution={4}
          />
        </div>
        {/* 아주 옅은 스크림 — 사진 채도는 살리고(하얗게 X) 글자 대비만 살짝 보조 */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-white/8" />

        <Navbar />
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
