/**
 * 히어로 타이포 시안 2차 (/hero-lab/2) — 11~20번.
 * 1차에서 9번(블렌드 모드)은 확정 후보로 남겨두고, 완전히 다른 스타일 10개를 더 본다.
 * 흰 글자만 크기를 바꾸는 식의 시안은 이 배치에서 17번 하나뿐이다.
 * 시안 확정 후 hero-lab 전체를 삭제한다.
 */

const PHOTO = "/pink_lake.jpg";

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
        {children}
      </div>
    </div>
  );
}

const NAVY = "#0d2f42";
const WINE = "#6d2740";
const TEAL = "#00707a";

export default function HeroLab2() {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-slate-100 p-8">
      <h1 className="mb-1 text-xl font-bold text-slate-900">
        히어로 타이포 시안 2차 — 11~20번
      </h1>
      <p className="mb-6 text-[13px] text-slate-600">
        9번(블렌드 모드)은 확정 후보로 유지. 이번엔 색을 쓰는 방향 위주이고,
        흰 글자 시안은 <b>17번 하나</b>뿐입니다.
      </p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-7">
        {/* 11 ─ 딥 네이비 세리프 */}
        <Tile n={11} name="네이비 세리프" note="세리프 + 짙은 남색 · 격식 있는 톤">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p
              className="text-[9px] uppercase tracking-[0.5em]"
              style={{ color: NAVY, fontFamily: "Georgia, serif" }}
            >
              Chungnam National University
            </p>
            <p
              className="mt-3 text-[44px] leading-none"
              style={{ color: NAVY, fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              CNU Uplp
            </p>
            <span className="mt-4 h-px w-16" style={{ background: NAVY }} />
          </div>
        </Tile>

        {/* 12 ─ 와인 잉크 */}
        <Tile n={12} name="와인 잉크" note="호수의 가장 짙은 분홍 · 두 줄 왼쪽">
          <div className="absolute inset-0 flex flex-col justify-center px-8">
            <span
              className="text-[50px] font-black uppercase leading-[0.85] tracking-[-0.04em]"
              style={{ color: WINE }}
            >
              CNU
            </span>
            <span
              className="text-[50px] font-black uppercase leading-[0.85] tracking-[-0.04em]"
              style={{ color: WINE }}
            >
              UPLP
            </span>
            <span
              className="mt-3 text-[9px] font-bold uppercase tracking-[0.35em]"
              style={{ color: WINE }}
            >
              Swimming Club
            </span>
          </div>
        </Tile>

        {/* 13 ─ 골드 그라데이션 */}
        <Tile n={13} name="골드 그라데이션" note="차가운 사진에 따뜻한 금색 · 유일한 난색">
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-[46px] font-bold uppercase leading-none tracking-[0.14em]"
              style={{
                backgroundImage:
                  "linear-gradient(180deg,#fdf3c4 0%,#e3bb54 42%,#a9781a 62%,#f4e3a1 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 2px 6px rgba(60,40,0,.45))",
              }}
            >
              CNU UPLP
            </span>
          </div>
        </Tile>

        {/* 14 ─ 블렌드 difference */}
        <Tile n={14} name="블렌드 difference" note="사진 색을 반전시킴 · 9번보다 훨씬 강함">
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-[60px] font-black uppercase leading-none tracking-[0.02em]"
              style={{ mixBlendMode: "difference", color: "#d9e8f0" }}
            >
              UPLP
            </span>
          </div>
        </Tile>

        {/* 15 ─ 블렌드 multiply */}
        <Tile n={15} name="블렌드 multiply" note="물에 잉크가 스며들 듯 가라앉음">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-[54px] font-extrabold uppercase leading-none tracking-[0.06em]"
              style={{ mixBlendMode: "multiply", color: "#4b6d86" }}
            >
              CNU UPLP
            </span>
            <span
              className="mt-3 text-[9px] uppercase tracking-[0.4em]"
              style={{ mixBlendMode: "multiply", color: "#4b6d86" }}
            >
              Swimming Club
            </span>
          </div>
        </Tile>

        {/* 16 ─ 청록 와이드 */}
        <Tile n={16} name="청록 와이드" note="사이트의 청록색 · 자간 넓게 두 줄">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-[15px] font-bold uppercase tracking-[0.6em]"
              style={{ color: TEAL }}
            >
              Chungnam
            </span>
            <span
              className="mt-2 text-[42px] font-semibold uppercase leading-none tracking-[0.22em]"
              style={{ color: TEAL }}
            >
              UPLP
            </span>
          </div>
        </Tile>

        {/* 17 ─ 흰 글자 (이 배치에서 유일) */}
        <Tile n={17} name="흰 글자 · 레터프레스" note="이 배치에서 유일한 흰색 · 눌러 찍은 듯">
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-[50px] font-bold uppercase leading-none tracking-[0.16em] text-white"
              style={{
                textShadow:
                  "0 1px 0 rgba(255,255,255,.5), 0 -1px 1px rgba(8,47,73,.65), 0 3px 14px rgba(8,47,73,.4)",
              }}
            >
              CNU UPLP
            </span>
          </div>
        </Tile>

        {/* 18 ─ 색수차 오프셋 */}
        <Tile n={18} name="색수차 오프셋" note="먹색 글자에 분홍·청록이 어긋나 겹침">
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-[52px] font-black uppercase leading-none tracking-[0.04em]"
              style={{
                color: "#14202b",
                textShadow:
                  "4px 0 0 rgba(236,72,153,.7), -4px 0 0 rgba(34,211,238,.7)",
              }}
            >
              CNU UPLP
            </span>
          </div>
        </Tile>

        {/* 19 ─ 컬러 블록 넉아웃 */}
        <Tile n={19} name="컬러 블록 넉아웃" note="색 판을 깔고 글자를 뚫어 사진이 보임">
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="px-10 py-7"
              style={{ background: NAVY }}
            >
              <span
                className="block text-[44px] font-black uppercase leading-none tracking-[0.04em]"
                style={{
                  backgroundImage: `url(${PHOTO})`,
                  backgroundSize: "600%",
                  backgroundPosition: "center 58%",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                UPLP
              </span>
            </div>
          </div>
        </Tile>

        {/* 20 ─ 한글 워드마크 */}
        <Tile n={20} name="한글 워드마크" note="영문 대신 '우파루파' · 완전히 다른 인상">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className="text-[52px] font-black leading-none tracking-[-0.02em]"
              style={{ color: NAVY }}
            >
              우파루파
            </span>
            <span
              className="mt-4 text-[10px] font-semibold uppercase tracking-[0.45em]"
              style={{ color: NAVY }}
            >
              CNU Swimming Club
            </span>
          </div>
        </Tile>
      </div>
    </div>
  );
}
