/**
 * 히어로 타이포 시안 3차 (/hero-lab/3) — 21~30번.
 * 1~20번에서 쓴 기법은 전부 제외했다.
 *   이미 쓴 것: 세리프 / 사진채움 / 유리패널 / 콘덴스드잉크 / 세로배치 / 세로선분할 /
 *   엠블럼 / 모노스페이스 / 블렌드(overlay·difference·multiply) / 화면밖넘침 /
 *   골드그라데이션 / 레터프레스 / 색수차 / 컬러블록넉아웃 / 한글워드마크
 * 이번 10개는 위와 겹치지 않는 기법만 쓴다. 색·흰색 제약은 없다.
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

export default function HeroLab3() {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-slate-100 p-8">
      <h1 className="mb-1 text-xl font-bold text-slate-900">
        히어로 타이포 시안 3차 — 21~30번
      </h1>
      <p className="mb-6 text-[13px] text-slate-600">
        1~20번에서 쓴 기법은 전부 제외. 전부 새로운 방식입니다.
      </p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-7">
        {/* 21 ─ 줄무늬 채움 */}
        <Tile n={21} name="줄무늬 채움" note="글자 안이 가로 줄무늬 · 수영 레인 느낌">
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-[52px] font-black uppercase leading-none tracking-[0.05em]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(180deg,#fff 0 5px,rgba(255,255,255,0) 5px 10px)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 2px 8px rgba(8,47,73,.55))",
              }}
            >
              CNU UPLP
            </span>
          </div>
        </Tile>

        {/* 22 ─ 물에 비친 반사 */}
        <Tile n={22} name="수면 반사" note="글자가 호수에 비친 것처럼 아래로 뒤집힘">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[40px] font-bold uppercase leading-none tracking-[0.14em] text-white [text-shadow:0_2px_10px_rgba(8,47,73,.5)]">
              CNU UPLP
            </span>
            <span
              aria-hidden
              className="text-[40px] font-bold uppercase leading-none tracking-[0.14em] text-white"
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
              CNU UPLP
            </span>
          </div>
        </Tile>

        {/* 23 ─ 수평선 색 분할 */}
        <Tile n={23} name="수평선 색 분할" note="글자 위·아래 색이 다름 · 사진 수평선과 맞물림">
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-[54px] font-black uppercase leading-none tracking-[0.04em]"
              style={{
                backgroundImage:
                  "linear-gradient(180deg,#8fd3ea 0 50%,#e79ab4 50% 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 2px 8px rgba(8,47,73,.5))",
              }}
            >
              CNU UPLP
            </span>
          </div>
        </Tile>

        {/* 24 ─ 네온 사인 */}
        <Tile n={24} name="네온 사인" note="빛을 내뿜는 간판 · 해질녘 톤">
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-[46px] font-semibold uppercase leading-none tracking-[0.16em]"
              style={{
                color: "#fff3fb",
                textShadow:
                  "0 0 4px #fff, 0 0 12px #ff9ad5, 0 0 26px #ff5fb8, 0 0 48px #ff2fa4",
              }}
            >
              CNU UPLP
            </span>
          </div>
        </Tile>

        {/* 25 ─ 양끝 맞춤 스택 */}
        <Tile n={25} name="양끝 맞춤 스택" note="두 줄이 좌우 끝까지 꽉 · 크기가 서로 다름">
          <div className="absolute inset-0 flex flex-col justify-center px-6">
            <span className="block w-full text-center text-[26px] font-medium uppercase leading-[1] tracking-[0.62em] text-white [text-shadow:0_1px_6px_rgba(8,47,73,.6)]">
              Chungnam
            </span>
            <span className="mt-1 block w-full text-center text-[62px] font-black uppercase leading-[1] tracking-[0.03em] text-white [text-shadow:0_2px_10px_rgba(8,47,73,.5)]">
              UPLP SWIM
            </span>
          </div>
        </Tile>

        {/* 26 ─ 대각선 */}
        <Tile n={26} name="대각선 배치" note="수평선을 거스르는 사선 · 동적인 인상">
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-[50px] font-extrabold uppercase leading-none tracking-[0.06em] text-white [text-shadow:0_3px_14px_rgba(8,47,73,.55)]"
              style={{ transform: "rotate(-8deg)" }}
            >
              CNU UPLP
            </span>
          </div>
        </Tile>

        {/* 27 ─ 레이어 에코 */}
        <Tile n={27} name="레이어 에코" note="같은 글자를 어긋나게 겹침 · 뒤는 윤곽선">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="relative block">
              <span
                aria-hidden
                className="absolute left-[10px] top-[10px] whitespace-nowrap text-[48px] font-black uppercase leading-none tracking-[0.05em]"
                style={{
                  color: "transparent",
                  WebkitTextStroke: "1.5px rgba(255,255,255,.8)",
                }}
              >
                CNU UPLP
              </span>
              <span className="relative block whitespace-nowrap text-[48px] font-black uppercase leading-none tracking-[0.05em] text-[#0d2f42]">
                CNU UPLP
              </span>
            </span>
          </div>
        </Tile>

        {/* 28 ─ 원형 아치 */}
        <Tile n={28} name="원형 아치" note="글자가 호를 따라 휨 · 도장·씰 느낌">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="300" height="150" viewBox="0 0 300 150">
              <defs>
                <path id="arc" d="M 30 135 A 120 120 0 0 1 270 135" fill="none" />
              </defs>
              <text
                fill="#fff"
                fontSize="30"
                fontWeight="700"
                letterSpacing="7"
                style={{ textTransform: "uppercase" }}
              >
                <textPath href="#arc" startOffset="50%" textAnchor="middle">
                  CNU UPLP SWIM
                </textPath>
              </text>
              <circle cx="150" cy="120" r="4" fill="#fff" />
            </svg>
          </div>
        </Tile>

        {/* 29 ─ 물결 그래픽 락업 */}
        <Tile n={29} name="물결 그래픽 락업" note="글자 + 파도 선 그래픽이 한 덩어리">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[42px] font-bold uppercase leading-none tracking-[0.12em] text-white [text-shadow:0_2px_10px_rgba(8,47,73,.5)]">
              UPLP
            </span>
            <svg width="200" height="26" viewBox="0 0 200 26" className="mt-2">
              <path
                d="M0 13 Q 12.5 0, 25 13 T 50 13 T 75 13 T 100 13 T 125 13 T 150 13 T 175 13 T 200 13"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="mt-1 text-[9px] uppercase tracking-[0.45em] text-white/90">
              Chungnam Swimming
            </span>
          </div>
        </Tile>

        {/* 30 ─ 스텐실 */}
        <Tile n={30} name="스텐실" note="글자가 가로로 끊겨 있음 · 군더더기 없는 표지판">
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-[54px] font-black uppercase leading-none tracking-[0.06em]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(180deg,#fff 0 16px,rgba(255,255,255,0) 16px 21px)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 2px 8px rgba(8,47,73,.5))",
              }}
            >
              CNU UPLP
            </span>
          </div>
        </Tile>
      </div>
    </div>
  );
}
