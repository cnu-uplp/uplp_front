import SectionLabel from "./SectionLabel";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

const PROGRAMS = [
  {
    no: "01",
    icon: "🏊",
    title: "정기 훈련",
    sub: "Regular Training",
    desc: "주 2회, 자유형·배영·평영·접영 기초부터 체계적으로. 수준별 레인 운영으로 초보도 부담 없이 시작할 수 있습니다.",
  },
  {
    no: "02",
    icon: "🏆",
    title: "연합 시합",
    sub: "Competition",
    desc: "매년 대학 연합 수영 대회에 참가합니다. 함께 목표를 세우고 기록을 단축하며 성취감을 나눕니다.",
  },
  {
    no: "03",
    icon: "🌊",
    title: "친목 활동",
    sub: "Community",
    desc: "워크숍, 바다 수영 MT, 뒤풀이까지. 물 안에서도 밖에서도 끈끈한 사람들이 모입니다.",
  },
];

export default function Programs() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionLabel no="(03)" title="활동 프로그램" />

        <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.12}>
          {PROGRAMS.map((p) => (
            <RevealItem
              key={p.no}
              className="glass glass-hover flex flex-col rounded-3xl p-7"
            >
              <div className="flex items-center justify-between">
                <span className="text-4xl">{p.icon}</span>
                <span className="text-sm font-medium text-slate-400">
                  ({p.no})
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-sky-900">
                {p.title}
              </h3>
              <p className="text-sm font-medium text-sky-500">{p.sub}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {p.desc}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
