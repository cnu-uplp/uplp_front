import SectionLabel from "./SectionLabel";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

const STATS = [
  { value: "60+", label: "활동 부원", desc: "초보부터 마스터즈까지" },
  { value: "1.2만", label: "누적 훈련 랩", desc: "함께 채운 물살" },
  { value: "12", label: "참가 대회", desc: "대학 연합 대회" },
  { value: "8", label: "활동 기수", desc: "2019년부터" },
];

export default function StatsBar() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionLabel no="(07)" title="숫자로 보는 UPLP" />

        <RevealGroup
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.1}
        >
          {STATS.map((s) => (
            <RevealItem key={s.label} className="glass rounded-3xl p-6">
              <div className="text-4xl font-bold tracking-tight text-sky-800">
                {s.value}
              </div>
              <div className="mt-3 border-t border-sky-100 pt-3">
                <div className="font-semibold text-sky-900">{s.label}</div>
                <div className="mt-1 text-sm text-slate-500">{s.desc}</div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
