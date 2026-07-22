import GlassCard from "@/components/GlassCard";
import AxolotlGame from "@/components/AxolotlGame";
import Axolotl3DGame from "@/components/Axolotl3DGame";
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
      {/* Hero — 전역 물결 배경 위에 뜨는 인트로 (별도 파란 히어로 블록 없음) */}
      <section className="relative flex min-h-svh snap-start flex-col justify-center overflow-hidden px-6 py-24 sm:px-10 lg:px-16">
        {/* 왼쪽 큰 글자 — 흰색 계열 글자에 위 푸른빛 → 아래 핑크빛(우파루파 색감) 그라데이션.
            색은 글자에만 들어가고 배경(뒤 전역 물결 사진)은 그대로 둔다. */}
        <div className="relative w-full max-w-6xl">
          <Reveal delay={0.2} immediate>
            <div className="mb-7 flex items-center gap-3.5">
              <span className="h-px w-10 bg-white/70 sm:w-16" />
              <span className="text-[0.7rem] font-medium uppercase tracking-[0.34em] text-white/90 [text-shadow:0_1px_4px_rgba(8,47,73,0.6)] sm:text-xs">
                Chungnam Nat&apos;l University · Swimming Club
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.35} immediate>
            <div className="relative -skew-x-6 [filter:drop-shadow(0_22px_38px_rgba(8,47,73,0.4))_drop-shadow(0_6px_16px_rgba(125,211,252,0.45))]">
              {/* 뒤 입체 베이스: 아래로 살짝 오프셋된 진한 카피 → 글자 두께(3D)감 */}
              <h1
                aria-hidden
                className="absolute inset-x-0 top-0 translate-y-[0.05em] font-black uppercase leading-[0.76] tracking-[-0.075em] text-sky-950/35 blur-[0.5px]"
              >
                <span className="block text-[23vw] sm:text-[18vw] lg:text-[13.5vw]">CNU</span>
                <span className="block text-[23vw] sm:text-[18vw] lg:text-[13.5vw]">UPLP</span>
              </h1>
              {/* 앞 컬러면: 두 단어를 잇는 하나의 그라데이션 → CNU 파랑 / UPLP 분홍 */}
              <h1 className="relative bg-gradient-to-b from-sky-300 via-white to-pink-300 bg-clip-text font-black uppercase leading-[0.76] tracking-[-0.075em] text-transparent [-webkit-background-clip:text] [-webkit-text-stroke:0.8px_rgba(255,255,255,0.35)]">
                <span className="block text-[23vw] sm:text-[18vw] lg:text-[13.5vw]">CNU</span>
                <span className="block text-[23vw] sm:text-[18vw] lg:text-[13.5vw]">UPLP</span>
              </h1>
            </div>
          </Reveal>

          <Reveal delay={0.6} immediate className="mt-7 max-w-xl">
            <p className="text-base text-white [text-shadow:0_1px_2px_rgba(8,47,73,0.75),0_2px_12px_rgba(8,47,73,0.6)] sm:text-lg">
              충남대학교 수영동아리 우파루파. 초보부터 마스터즈까지, 물살을 가르는 즐거움을 함께 나눠요.
            </p>
          </Reveal>
        </div>

        {/* 아래에 콘텐츠가 있음을 알리는 스크롤 유도 시그널 */}
        <a
          href="#explore"
          aria-label="아래로 스크롤"
          className="group absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 text-white/85 [text-shadow:0_1px_6px_rgba(8,47,73,0.75)] transition hover:text-white"
        >
          <span className="text-[0.7rem] font-semibold tracking-[0.25em]">
            SCROLL
          </span>
          <span className="flex h-9 w-9 animate-bounce items-center justify-center rounded-full border border-white/50 bg-white/10 backdrop-blur">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </a>
      </section>

      {/* 스크롤 아래 콘텐츠: '엄청 투명한 유리' 카드로 콘텐츠 전체를 감싼다 (뒤 물결이 은은히 비침).
          유리(backdrop-filter)가 조상이 되면 내부 fixed가 갇히므로, 미니게임 팝업은 body로 portal 처리됨. */}
      <GlassCard id="explore">
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
      </GlassCard>
    </div>
  );
}
