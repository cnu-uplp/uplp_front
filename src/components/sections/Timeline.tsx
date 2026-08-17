import SectionLabel from "./SectionLabel";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

const HISTORY = [
  { year: "2017", event: "UPLP 수영 동아리 창단" },
  { year: "2021", event: "첫 대학 연합 대회 참가" },
  { year: "2023", event: "부원 50명 돌파 · 수준별 강습 도입" },
  { year: "2025", event: "연합 대회 계영 부문 입상" },
  { year: "2026", event: "공식 웹사이트 오픈" },
];

export default function Timeline() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionLabel no="(06)" title="연혁" />

        <RevealGroup className="mt-8" stagger={0.08}>
          {HISTORY.map((h) => (
            <RevealItem
              key={h.year}
              className="flex items-baseline gap-6 border-b border-sky-100 py-5 transition-colors hover:bg-white/40"
            >
              <span className="w-16 shrink-0 font-semibold text-sky-700">
                {h.year}
              </span>
              <span className="text-slate-700">{h.event}</span>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
