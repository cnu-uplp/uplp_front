/**
 * 히어로 타이포 시안 비교용 임시 페이지 (/hero-lab).
 * 10가지 서로 다른 스타일을 같은 배경 사진 위에 나란히 놓고 고르기 위한 용도.
 * 시안 확정 후 이 파일은 삭제한다.
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

export default function HeroLab() {
  return (
    /* 루트 레이아웃의 네비게이션·물결 배경이 비쳐 보이지 않도록 화면 전체를 덮는다 */
    <div className="fixed inset-0 z-50 overflow-auto bg-slate-100 p-8">
      <h1 className="mb-1 text-xl font-bold text-slate-900">
        히어로 타이포 시안 10종
      </h1>
      <p className="mb-6 text-[13px] text-slate-600">
        모두 같은 배경 사진. 번호로 골라주세요. (크기만 다른 건 없고 전부 다른 스타일입니다)
      </p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-7">
        {/* 1 ─ 세리프 클래식 */}
        <Tile n={1} name="세리프 클래식" note="명조/세리프 · 호텔·리조트 느낌">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p
              className="text-[10px] uppercase tracking-[0.5em] text-white/90"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Est. Chungnam
            </p>
            <p
              className="mt-3 text-[46px] leading-none text-white"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                textShadow: "0 2px 12px rgba(8,47,73,.5)",
              }}
            >
              CNU Uplp
            </p>
            <p
              className="mt-3 text-[12px] italic text-white/85"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Swimming Club
            </p>
          </div>
        </Tile>

        {/* 2 ─ 사진 채움 */}
        <Tile n={2} name="글자 안에 사진" note="글자가 창처럼 뚫려 사진이 비침">
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-[68px] font-black uppercase leading-none tracking-tight"
              style={{
                // 글자 안에 하늘만 들어가면 파란 덩어리로 보인다.
                // 수평선과 분홍 물이 함께 걸리도록 위치를 내렸다.
                backgroundImage: `url(${PHOTO})`,
                backgroundSize: "170%",
                backgroundPosition: "center 62%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextStroke: "1px rgba(255,255,255,.7)",
                filter: "contrast(1.3) saturate(1.35) brightness(0.95)",
              }}
            >
              CNU
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-5 text-center text-[10px] uppercase tracking-[0.4em] text-white/90">
            Uplp Swimming
          </div>
        </Tile>

        {/* 3 ─ 유리 패널 */}
        <Tile n={3} name="유리 패널" note="사이트 전체 유리 카드와 같은 언어">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-2xl border border-white/45 bg-white/20 px-9 py-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,.6)] backdrop-blur-md">
              <p className="text-[9px] uppercase tracking-[0.42em] text-white/90">
                Chungnam Nat&apos;l Univ.
              </p>
              <p className="mt-2 text-[34px] font-semibold uppercase leading-none tracking-[0.12em] text-white">
                CNU UPLP
              </p>
            </div>
          </div>
        </Tile>

        {/* 4 ─ 콘덴스드 잉크 */}
        <Tile n={4} name="꽉 찬 잉크" note="짙은 색 · 자간 좁게 · 왼쪽 정렬">
          <div className="absolute inset-0 flex flex-col justify-center px-7">
            <span className="text-[54px] font-black uppercase leading-[0.82] tracking-[-0.05em] text-[#0d2f42]">
              CNU
            </span>
            <span className="text-[54px] font-black uppercase leading-[0.82] tracking-[-0.05em] text-[#0d2f42]">
              UPLP
            </span>
            <span className="mt-3 h-[3px] w-14 bg-[#0d2f42]" />
          </div>
        </Tile>

        {/* 5 ─ 세로 배치 */}
        <Tile n={5} name="세로 워드마크" note="왼쪽 가장자리에 세로로 · 사진이 주인공">
          <div className="absolute inset-y-0 left-6 flex items-center">
            <span
              className="text-[13px] font-semibold uppercase tracking-[0.55em] text-white"
              style={{ writingMode: "vertical-rl" }}
            >
              CNU UPLP
            </span>
          </div>
          <div className="absolute bottom-5 right-6 text-right">
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/85">
              Swimming Club
            </p>
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/60">
              Since 2015
            </p>
          </div>
        </Tile>

        {/* 6 ─ 분할 + 세로선 */}
        <Tile n={6} name="세로선 분할" note="CNU | UPLP 를 선으로 나눔">
          <div className="absolute inset-0 flex items-center justify-center gap-6">
            <span className="text-[15px] font-semibold uppercase tracking-[0.42em] text-white">
              CNU
            </span>
            <span className="h-11 w-px bg-white/70" />
            <span className="text-[40px] font-light uppercase leading-none tracking-[0.14em] text-white">
              UPLP
            </span>
          </div>
        </Tile>

        {/* 7 ─ 엠블럼 */}
        <Tile n={7} name="엠블럼 / 크레스트" note="원형 배지 · 동아리 상징처럼">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-[150px] w-[150px] flex-col items-center justify-center rounded-full border border-white/70 text-center">
              <span className="text-[8px] uppercase tracking-[0.3em] text-white/85">
                Chungnam
              </span>
              <span className="my-1 h-px w-10 bg-white/60" />
              <span className="text-[26px] font-bold uppercase leading-none tracking-[0.08em] text-white">
                UPLP
              </span>
              <span className="my-1 h-px w-10 bg-white/60" />
              <span className="text-[8px] uppercase tracking-[0.3em] text-white/85">
                Swim
              </span>
            </div>
          </div>
        </Tile>

        {/* 8 ─ 모노스페이스 테크 */}
        <Tile n={8} name="모노스페이스" note="기술 문서풍 · 좌표·메타 정보">
          <div className="absolute inset-0 flex flex-col justify-center px-7 font-mono">
            <p className="text-[10px] text-white/75">[ 36.3665°N, 127.3450°E ]</p>
            <p className="mt-2 text-[30px] font-medium uppercase leading-none tracking-[0.08em] text-white">
              cnu_uplp
            </p>
            <p className="mt-3 text-[10px] text-white/75">
              swimming_club / est.2015 / daejeon
            </p>
          </div>
        </Tile>

        {/* 9 ─ 블렌드 모드 */}
        <Tile n={9} name="블렌드 모드" note="글자가 사진에 녹아듦 · 색이 반전되듯">
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-[72px] font-black uppercase leading-none tracking-[-0.02em]"
              style={{ mixBlendMode: "overlay", color: "#fff" }}
            >
              UPLP
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-6 text-center text-[10px] uppercase tracking-[0.4em] text-white/95">
            Chungnam Swimming Club
          </div>
        </Tile>

        {/* 10 ─ 화면 밖으로 넘치는 초대형 */}
        <Tile n={10} name="화면 밖으로 넘침" note="글자가 양옆으로 잘려 나감 · 대담한 편집">
          <div className="absolute inset-0 flex items-center overflow-hidden">
            <span className="whitespace-nowrap text-[110px] font-extrabold uppercase leading-none tracking-[-0.04em] text-white/95 [text-shadow:0_2px_16px_rgba(8,47,73,.35)] -ml-8">
              UPLP UPLP
            </span>
          </div>
          <div className="absolute left-7 top-6 text-[9px] uppercase tracking-[0.4em] text-white/90">
            Chungnam Nat&apos;l University
          </div>
        </Tile>
      </div>
    </div>
  );
}
