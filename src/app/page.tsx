import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import AxolotlGame from "@/components/AxolotlGame";
import Axolotl3DGame from "@/components/Axolotl3DGame";
import { Reveal } from "@/components/motion/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import WaveText from "@/components/motion/WaveText";
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
      <section className="relative flex min-h-svh snap-start flex-col justify-end overflow-hidden px-6 pb-14 pt-24 sm:px-10 sm:pb-16 lg:px-16">
        {/* 아래 가장자리에서 위로 사라지는 스크림.
            사진 아래쪽이 거의 흰 소금밭이라 흰 글자가 그냥은 안 읽힌다.
            화면 가운데 띠와 달리 가장자리에 붙어 있어 '박스'로 보이지 않는다. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-[linear-gradient(to_top,rgba(8,47,73,0.72)_0%,rgba(8,47,73,0.45)_28%,rgba(8,47,73,0.16)_55%,transparent_100%)]"
        />

        {/* 아래에 붙는 좌우 2단 구성 —
            왼쪽은 브랜드 메시지 + 행동 유도, 오른쪽은 설명 + 분류 칩. */}
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          {/* 왼쪽 */}
          <div className="min-w-0">
            <Reveal delay={0.15} immediate>
              <p className="text-[0.85rem] font-normal text-white/80 sm:text-[0.95rem]">
                충남대학교 수영동아리 · 우파루파
              </p>
            </Reveal>

            {/* 제목은 학교·동아리 이름 그대로. 두 줄로 쌓아 왼쪽 아래를 채운다.
                첫 줄은 그대로 두고, 둘째 줄만 글자별로 시차를 두고 흔들린다 —
                파동이 UPLP 를 훑고 지나가는 모션. 옆 마크는 계속 회전한다. */}
            <h1 className="mt-3 text-[4.4rem] font-medium uppercase leading-[0.92] tracking-[-0.045em] text-white sm:mt-4 sm:text-[6.4rem] lg:text-[8.6rem]">
              <span className="block">
                <TextReveal text="CNU" by="line" delay={0.3} immediate />
              </span>
              <span className="flex items-center gap-[0.12em]">
                <WaveText text="UPLP" delay={0.9} stagger={0.09} />
                <svg
                  viewBox="0 0 100 100"
                  aria-hidden
                  className="h-[0.36em] w-[0.36em] shrink-0 animate-mark-spin text-white/85"
                >
                  <g fill="currentColor">
                    {[0, 45, 90, 135].map((deg) => (
                      <rect
                        key={deg}
                        x="42"
                        y="5"
                        width="16"
                        height="90"
                        rx="2"
                        transform={`rotate(${deg} 50 50)`}
                      />
                    ))}
                  </g>
                </svg>
              </span>
            </h1>

            <Reveal delay={0.7} immediate>
              <Link
                href="/ticket"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/95 px-6 py-3 text-sm font-semibold text-sky-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-white"
              >
                정기수영 신청하기
              </Link>
            </Reveal>
          </div>

          {/* 오른쪽 — 알약 칩 대신 가는 선으로 나눈 정보 목록.
              라벨은 작게 흐리게, 값은 크게 또렷하게 두어 위계를 만든다. */}
          <Reveal delay={0.85} immediate className="w-full lg:w-auto">
            <dl className="flex flex-col gap-px overflow-hidden lg:min-w-[19rem]">
              {[
                ["활동", "매주 화 · 목 19:00"],
                ["장소", "충남대학교 실내수영장"],
                ["대상", "초급부터 마스터즈까지"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-6 border-t border-white/20 py-3 last:border-b"
                >
                  <dt className="text-[0.7rem] uppercase tracking-[0.28em] text-white/55">
                    {label}
                  </dt>
                  <dd className="text-[0.95rem] font-medium text-white sm:text-base">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
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
