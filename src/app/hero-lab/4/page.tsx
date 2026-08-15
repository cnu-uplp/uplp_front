/**
 * 히어로 타이포 시안 4차 (/hero-lab/4) — 31~40번.
 * 22번 "수면 반사"를 고정 기법으로 삼고, 글자 스타일만 10가지로 바꿔 본다.
 * 반사 처리는 Reflected 하나로만 구현해 10개 모두 완전히 동일하게 적용된다.
 * 시안 확정 후 hero-lab 전체를 삭제한다.
 */

const PHOTO = "/pink_lake.jpg";

/** 22번의 수면 반사 — 이 배치 전체가 공유하는 고정 부품 */
function Reflected({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <div>{children}</div>
      <div
        aria-hidden
        style={{
          transform: "scaleY(-1)",
          opacity: 0.42,
          marginTop: 3,
          WebkitMaskImage:
            "linear-gradient(to top, transparent 8%, rgba(0,0,0,.85) 92%)",
          maskImage:
            "linear-gradient(to top, transparent 8%, rgba(0,0,0,.85) 92%)",
          filter: "blur(0.6px)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Tile({
  n,
  name,
  note,
  children,
}: {
  n: number;
  name: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-baseline gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
          {n}
        </span>
        <span className="text-[13px] font-bold text-slate-900">{name}</span>
        <span className="text-[11px] text-slate-500">{note}</span>
      </div>
      <div
        className="relative aspect-[16/9] w-full overflow-hidden rounded-lg ring-1 ring-slate-300"
        style={{
          backgroundImage: `url(${PHOTO})`,
          backgroundSize: "cover",
          backgroundPosition: "center 42%",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}

const NAVY = "#0d2f42";
const WINE = "#6d2740";

export default function HeroLab4() {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-slate-100 p-8">
      <h1 className="mb-1 text-xl font-bold text-slate-900">
        히어로 타이포 시안 4차 — 31~40번
      </h1>
      <p className="mb-6 text-[13px] text-slate-600">
        <b>수면 반사(22번)는 고정.</b> 10개 모두 같은 반사 처리를 쓰고, 글자 스타일만 다릅니다.
      </p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-7">
        {/* 31 ─ 얇은 산세리프 */}
        <Tile n={31} name="얇은 산세리프" note="가는 획 + 넓은 자간 · 담백함">
          <Reflected>
            <span className="block whitespace-nowrap text-[38px] font-extralight uppercase leading-none tracking-[0.3em] text-white">
              CNU UPLP
            </span>
          </Reflected>
        </Tile>

        {/* 32 ─ 세리프 */}
        <Tile n={32} name="세리프" note="명조 계열 · 고전적">
          <Reflected>
            <span
              className="block whitespace-nowrap text-[44px] leading-none text-white"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              CNU Uplp
            </span>
          </Reflected>
        </Tile>

        {/* 33 ─ 네이비 잉크 */}
        <Tile n={33} name="네이비 잉크" note="짙은 남색 · 굵게">
          <Reflected>
            <span
              className="block whitespace-nowrap text-[44px] font-black uppercase leading-none tracking-[0.02em]"
              style={{ color: NAVY }}
            >
              CNU UPLP
            </span>
          </Reflected>
        </Tile>

        {/* 34 ─ 와인 */}
        <Tile n={34} name="와인" note="호수의 짙은 분홍">
          <Reflected>
            <span
              className="block whitespace-nowrap text-[44px] font-extrabold uppercase leading-none tracking-[0.04em]"
              style={{ color: WINE }}
            >
              CNU UPLP
            </span>
          </Reflected>
        </Tile>

        {/* 35 ─ 골드 */}
        <Tile n={35} name="골드" note="유일한 난색 · 금속 질감">
          <Reflected>
            <span
              className="block whitespace-nowrap text-[42px] font-bold uppercase leading-none tracking-[0.1em]"
              style={{
                backgroundImage:
                  "linear-gradient(180deg,#fdf3c4 0%,#e3bb54 45%,#a9781a 65%,#f4e3a1 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              CNU UPLP
            </span>
          </Reflected>
        </Tile>

        {/* 36 ─ 블렌드 overlay */}
        <Tile n={36} name="블렌드 overlay" note="9번 기법 + 반사">
          <Reflected>
            <span
              className="block whitespace-nowrap text-[46px] font-black uppercase leading-none tracking-[0.02em]"
              style={{ mixBlendMode: "overlay", color: "#fff" }}
            >
              CNU UPLP
            </span>
          </Reflected>
        </Tile>

        {/* 37 ─ 윤곽선 */}
        <Tile n={37} name="윤곽선" note="속이 비어 사진이 비침">
          <Reflected>
            <span
              className="block whitespace-nowrap text-[44px] font-bold uppercase leading-none tracking-[0.08em]"
              style={{
                color: "transparent",
                WebkitTextStroke: "1.6px rgba(255,255,255,.95)",
              }}
            >
              CNU UPLP
            </span>
          </Reflected>
        </Tile>

        {/* 38 ─ 한글 */}
        <Tile n={38} name="한글" note="'우파루파' · 완전히 다른 인상">
          <Reflected>
            <span className="block whitespace-nowrap text-[46px] font-black leading-none tracking-[-0.01em] text-white">
              우파루파
            </span>
          </Reflected>
        </Tile>

        {/* 39 ─ 모노스페이스 */}
        <Tile n={39} name="모노스페이스" note="고정폭 · 기술적">
          <Reflected>
            <span className="block whitespace-nowrap font-mono text-[36px] font-medium uppercase leading-none tracking-[0.06em] text-white">
              cnu_uplp
            </span>
          </Reflected>
        </Tile>

        {/* 40 ─ 줄무늬 채움 */}
        <Tile n={40} name="줄무늬 채움" note="글자 안이 가로 줄무늬 · 수영 레인">
          <Reflected>
            <span
              className="block whitespace-nowrap text-[46px] font-black uppercase leading-none tracking-[0.04em]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(180deg,#fff 0 5px,rgba(255,255,255,0) 5px 10px)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              CNU UPLP
            </span>
          </Reflected>
        </Tile>
      </div>
    </div>
  );
}
