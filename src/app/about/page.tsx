import GlassCard from "@/components/GlassCard";
import EditableSections from "@/components/EditableSections";

const INFO = [
  { title: "활동 시간", desc: "매주 화 · 목 19:00 ~ 21:00" },
  { title: "활동 장소", desc: "학교 실내 수영장 (50m 레인)" },
  { title: "대상", desc: "수영 초급자부터 마스터즈까지 누구나" },
  { title: "회비", desc: "학기당 5만원 (강습비 별도 안내)" },
];

// 임원진이 섹션을 하나도 만들지 않았을 때 보여줄 기본 화면.
// 이게 없으면 편집 기능을 붙이는 순간 소개 페이지가 빈 화면이 된다.
function DefaultIntro() {
  return (
    <div className="mt-12 grid gap-5 sm:grid-cols-2">
      {INFO.map((item) => (
        <div key={item.title} className="glass glass-hover rounded-3xl p-6">
          <h2 className="font-semibold text-sky-900">{item.title}</h2>
          <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col pb-8 pt-24">
      <GlassCard>
        <div className="mx-auto w-full max-w-4xl px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-sky-900">
              동아리 소개
            </h1>
            <p className="mt-4 text-slate-600">
              UPLP 수영 동아리는 누구나 환영하는 열린 수영 커뮤니티입니다.
            </p>

            <div className="mt-10 flex justify-center">
              <img
                src="/pool.png"
                alt="충남대 실내 수영장"
                className="h-auto max-w-full rounded-2xl shadow-lg"
              />
            </div>
          </div>

          {/* 본문은 임원진이 웹에서 직접 고친다. 섹션이 없으면 위 기본 안내가 나온다. */}
          <div className="mt-12">
            <EditableSections page="about" fallback={<DefaultIntro />} />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
