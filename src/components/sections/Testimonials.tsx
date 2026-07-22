import SectionLabel from "./SectionLabel";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

const REVIEWS = [
  {
    quote:
      "수영 왕초보였는데 수준별 강습 덕분에 한 학기 만에 자유형 50m를 완영했어요. 무엇보다 사람들이 정말 좋아요.",
    name: "김민정",
    role: "23학번 · 신입 부원",
    initial: "서",
  },
  {
    quote:
      "대회 준비하면서 기록이 눈에 띄게 줄었어요. 함께 목표를 세우고 응원해주는 분위기가 최고입니다.",
    name: "이준호",
    role: "21학번 · 경기부",
    initial: "준",
  },
  {
    quote:
      "바다 수영 MT는 잊지 못할 추억이에요. 물 안에서도 밖에서도 든든한 동아리입니다.",
    name: "박지민",
    role: "22학번 · 정회원",
    initial: "지",
  },
];

export default function Testimonials() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionLabel no="(05)" title="부원 후기" />

        <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.12}>
          {REVIEWS.map((r) => (
            <RevealItem
              key={r.name}
              className="glass flex flex-col rounded-3xl p-7"
            >
              <p className="flex-1 leading-relaxed text-slate-700">
                “{r.quote}”
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 text-sm font-semibold text-white">
                  {r.initial}
                </span>
                <div>
                  <div className="text-sm font-semibold text-sky-900">
                    {r.name}
                  </div>
                  <div className="text-xs text-slate-500">{r.role}</div>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
