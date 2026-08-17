import Link from "next/link";
import SectionLabel from "./SectionLabel";
import TextReveal from "@/components/motion/TextReveal";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

const STATS = [
  { value: "2017", label: "창단 연도" },
  { value: "60+", label: "활동 부원" },
  { value: "연 5회", label: "대회 참가" },
];

export default function About() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionLabel no="(01)" title="동아리 소개" />

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <h2 className="text-2xl font-semibold leading-snug tracking-tight text-sky-900 sm:text-3xl">
            <TextReveal
              text={"물살을 가르는 즐거움을 나누는\n대학 수영 커뮤니티, UPLP."}
              by="line"
              stagger={0.12}
            />
          </h2>

          <div className="space-y-6">
            <Reveal delay={0.1}>
              <p className="leading-relaxed text-slate-600">
                UPLP는 초보부터 마스터즈까지 누구나 환영하는 열린 수영
                동아리입니다. 체계적인 정기 훈련과 친목 활동, 그리고 매년 대학
                연합 대회 참가까지 — 물을 사랑하는 사람들이 함께 성장합니다.
              </p>
            </Reveal>

            <RevealGroup className="grid grid-cols-3 gap-4" stagger={0.1}>
              {STATS.map((s) => (
                <RevealItem
                  key={s.label}
                  className="glass rounded-2xl p-4 text-center"
                >
                  <div className="text-2xl font-bold text-sky-700">
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{s.label}</div>
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal delay={0.2}>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition hover:gap-3"
              >
                더 알아보기
                <span aria-hidden>→</span>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
