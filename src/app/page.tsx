import Link from "next/link";
import AxolotlGame from "@/components/AxolotlGame";
import Axolotl3DGame from "@/components/Axolotl3DGame";
import LiquidHero from "@/components/motion/LiquidHero";
import TextReveal from "@/components/motion/TextReveal";
import { Reveal } from "@/components/motion/Reveal";
import About from "@/components/sections/About";
import Gallery from "@/components/sections/Gallery";
import Programs from "@/components/sections/Programs";
import Pricing from "@/components/sections/Pricing";
import Testimonials from "@/components/sections/Testimonials";
import Timeline from "@/components/sections/Timeline";
import StatsBar from "@/components/sections/StatsBar";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero — 처음 들어오면 화면 전체를 채운다 */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden text-white">
        {/* 마우스를 따라 이미지가 물처럼 일렁이는 유체 왜곡 효과 */}
        <LiquidHero
          src="/pool.png"
          cursorPower={0.3}
          cursorSize={0.5}
          distortionPower={0.2}
          resolution={4}
        />
        {/* 이미지는 밝게 유지. 중앙 박스 그늘 없이, 화면 전폭에 걸친
            아주 옅은 상·하단 그라데이션만(내비/경계용) — 물 위에 떠보이지 않는다. */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-950/28 via-transparent to-sky-950/22" />
        {/* 글자 가독성은 글자를 감싸는 글로우(그림자)로만 확보 → 박스가 안 생긴다 */}
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center [text-shadow:0_1px_2px_rgba(8,47,73,0.65),0_2px_12px_rgba(8,47,73,0.75),0_0_36px_rgba(8,47,73,0.6)]">
          <Reveal delay={0.3} immediate>
            <span className="inline-block rounded-full bg-white/15 px-4 py-1 text-sm font-medium tracking-wide">
              UPLP SWIMMING CLUB
            </span>
          </Reveal>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            <TextReveal text="충남대학교 수영동아리 우파루파입니다" delay={0.4} stagger={0.08} immediate />
          </h1>
          <Reveal delay={0.8} immediate className="max-w-xl">
            <p className="text-sky-50/90">
              UPLP 수영 동아리는 초보부터 마스터즈까지 누구나 환영합니다.
              정기 훈련, 친목 모임, 그리고 연 1회 정기 시합까지 함께해요.
            </p>
          </Reveal>
          <Reveal delay={1} immediate>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/ticket"
                className="rounded-full bg-white px-6 py-3 font-semibold text-sky-700 shadow-lg transition hover:bg-sky-50"
              >
                티켓 예매하기
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-white/60 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                동아리 소개 보기
              </Link>
            </div>
          </Reveal>
        </div>
        {/* wave divider */}
        <svg
          className="relative z-10 block w-full text-sky-50"
          viewBox="0 0 1440 100"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          <path d="M0,40 C240,90 480,0 720,40 C960,80 1200,10 1440,50 L1440,100 L0,100 Z" />
        </svg>
      </section>

      {/* Fuel 구조 차용: 소개 → 갤러리 → 프로그램 → 회비 → 후기 → 연혁 → 통계 → 미니게임 → FAQ → 푸터 */}
      <About />
      <Gallery />
      <Programs />
      <Pricing />
      <Testimonials />
      <Timeline />
      <StatsBar />

      {/* 미니게임 (우리만의 특색) */}
      <AxolotlGame />
      <Axolotl3DGame />

      <FAQ />
      <Footer />
    </div>
  );
}
