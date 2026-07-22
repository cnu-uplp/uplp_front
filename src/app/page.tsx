import Link from "next/link";
import AxolotlGame from "@/components/AxolotlGame";
import Axolotl3DGame from "@/components/Axolotl3DGame";
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
      {/* Hero */}
      <section className="relative overflow-hidden text-white">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/uplp.mp4"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400/35 via-sky-300/25 to-cyan-300/30" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-28 text-center">
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
          className="relative block w-full text-sky-50"
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
