import type { Metadata, Viewport } from "next";
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

// iOS Safari 대응.
//  themeColor  — 지정하지 않으면 Safari가 툴바 주변을 '흰색'으로 칠해 상단에 흰 띠가 생긴다.
//                배경 사진의 하늘색과 같은 계열로 맞춰 이어져 보이게 한다.
//  viewportFit — 노치·홈 인디케이터 영역까지 배경이 깔리도록 cover.
//                (safe-area 패딩이 필요한 요소는 env(safe-area-inset-*)로 개별 처리)
export const viewport: Viewport = {
  themeColor: "#dbeeff",
  viewportFit: "cover",
  colorScheme: "light",
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

            Background photograph: "Life's a Bit Pink" © graham earnshaw,
            licensed under CC BY-NC-ND 2.0. Upscaled with the photographer's permission.

            (원본 1024x684를 Real-ESRGAN 2패스로 6144x4104까지 올렸다.
             원본 그대로는 zoom 배율(약 4배) 때문에 화면에서 뭉개져 보였다.) */}
        {/* 높이를 100lvh(= 브라우저 UI가 숨겨졌을 때의 '가장 큰' 뷰포트)로 잡는다.
            inset-0 은 iOS에서 '작은 뷰포트'(툴바 포함) 기준이라, 스크롤로 툴바가 접히면
            늘어난 아래쪽이 안 덮여 흰 띠가 생겼다. lvh는 두 상태 모두를 덮는다. */}
        <div className="fixed inset-x-0 top-0 -z-10 h-[100lvh]">
          <LiquidHero
            src="/pink_lake.jpg"
            cursorPower={0.55}
            cursorSize={0.5}
            distortionPower={0.5}
            zoom={1}
            fit="cover"
            // 모바일은 세로로 길어서 cover가 사진 높이를 통째로 담는다 →
            // 상단 중앙의 사진작가 워터마크가 화면에 들어온다. 초점을 내려 그 띠를 잘라낸다.
            focusYMobile={0.38}
            resolution={4}
          />
        </div>
        {/* 아주 옅은 스크림 — 사진 채도는 살리고(하얗게 X) 글자 대비만 살짝 보조 */}
        <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[100lvh] bg-white/8" />

        <Navbar />
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
