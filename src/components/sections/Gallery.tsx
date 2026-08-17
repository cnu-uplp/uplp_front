import SectionLabel from "./SectionLabel";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

// 활동 사진 자리 (실제 이미지 넣기 전 그라데이션 플레이스홀더)
const ITEMS = [
  { no: "01", title: "정기 훈련", tag: "매주 수·토", from: "from-sky-400", to: "to-cyan-500", tall: true },
  { no: "02", title: "여름 정기 시합", tag: "연합 대회", from: "from-blue-500", to: "to-sky-400" },
  { no: "03", title: "바다 수영 MT", tag: "친목 활동", from: "from-cyan-400", to: "to-teal-500" },
  { no: "04", title: "신입 환영회", tag: "새내기", from: "from-indigo-400", to: "to-sky-500" },
];

export default function Gallery() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionLabel no="(02)" title="활동 갤러리" />

        <RevealGroup
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.1}
        >
          {ITEMS.map((item) => (
            <RevealItem
              key={item.no}
              className={`group relative overflow-hidden rounded-3xl ${
                item.tall ? "lg:row-span-2 lg:min-h-[420px]" : "min-h-[200px]"
              }`}
            >
              {/* 사진 자리 그라데이션 */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.from} ${item.to} transition-transform duration-500 group-hover:scale-105`}
              />
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative flex h-full flex-col justify-between p-5 text-white">
                <span className="text-sm font-medium text-white/80">
                  ({item.no})
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-white/80">{item.tag}</p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
