/**
 * 히어로 타이포 시안 5차 (/hero-lab/5) — 41~50번.
 *
 * 1~40번은 전부 "사진 한가운데에 글자를 어떻게 얹을까"였다. 그래서 다 비슷해 보였다.
 * 이번 10개는 그 전제 자체를 바꾼다 — 레이아웃 구조·화면 분할·프레임을 손댄다.
 * (반사·블렌드·색만 바꾸는 식은 전부 제외)
 */

const PHOTO = "/pink_lake.jpg";

function Tile({
  n,
  name,
  note,
  children,
  /** 사진을 타일 배경으로 깔지 여부 (레이아웃 자체가 사진을 나누는 시안은 false) */
  photo = true,
}: {
  n: number;
  name: string;
  note: string;
  children: React.ReactNode;
  photo?: boolean;
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
        className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-white ring-1 ring-slate-300"
        style={
          photo
            ? {
                backgroundImage: `url(${PHOTO})`,
                backgroundSize: "cover",
                backgroundPosition: "center 42%",
              }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}

const NAVY = "#0d2f42";
const CREAM = "#f4efe6";

export default function HeroLab5() {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-slate-100 p-8">
      <h1 className="mb-1 text-xl font-bold text-slate-900">
        히어로 타이포 시안 5차 — 41~50번
      </h1>
      <p className="mb-6 text-[13px] text-slate-600">
        이번엔 글자 꾸미기가 아니라 <b>화면 구조</b>를 바꿉니다. 사진을 자르거나, 여백을 만들거나,
        사진을 배경에서 끌어내립니다.
      </p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-7">
        {/* 41 ─ 좌우 분할 */}
        <Tile n={41} name="좌우 분할" note="왼쪽은 단색 면, 오른쪽만 사진" photo={false}>
          <div className="flex h-full">
            <div
              className="flex w-[46%] flex-col justify-center px-7"
              style={{ background: NAVY }}
            >
              <span className="text-[9px] uppercase tracking-[0.4em] text-white/70">
                Chungnam Nat&apos;l Univ.
              </span>
              <span className="mt-3 text-[38px] font-black uppercase leading-[0.9] tracking-[-0.02em] text-white">
                CNU
                <br />
                UPLP
              </span>
              <span className="mt-4 h-px w-12 bg-white/50" />
            </div>
            <div
              className="w-[54%]"
              style={{
                backgroundImage: `url(${PHOTO})`,
                backgroundSize: "cover",
                backgroundPosition: "center 45%",
              }}
            />
          </div>
        </Tile>

        {/* 42 ─ 상하 분할 (사진이 아래로) */}
        <Tile n={42} name="상하 분할" note="위는 크림색 여백, 아래만 사진" photo={false}>
          <div className="flex h-full flex-col">
            <div
              className="flex flex-1 flex-col items-center justify-center"
              style={{ background: CREAM }}
            >
              <span
                className="text-[40px] leading-none"
                style={{ color: NAVY, fontFamily: "Georgia, serif" }}
              >
                CNU Uplp
              </span>
              <span
                className="mt-2 text-[9px] uppercase tracking-[0.45em]"
                style={{ color: NAVY }}
              >
                Swimming Club
              </span>
            </div>
            <div
              className="h-[52%]"
              style={{
                backgroundImage: `url(${PHOTO})`,
                backgroundSize: "cover",
                backgroundPosition: "center 55%",
              }}
            />
          </div>
        </Tile>

        {/* 43 ─ 액자 (사진에 여백 테두리) */}
        <Tile n={43} name="액자" note="사진을 안쪽으로 밀고 흰 여백에 글자" photo={false}>
          <div className="flex h-full flex-col bg-white p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <span
                className="text-[15px] font-black uppercase tracking-[0.1em]"
                style={{ color: NAVY }}
              >
                CNU UPLP
              </span>
              <span className="text-[8px] uppercase tracking-[0.3em] text-slate-500">
                Swimming Club
              </span>
            </div>
            <div
              className="flex-1 rounded-sm"
              style={{
                backgroundImage: `url(${PHOTO})`,
                backgroundSize: "cover",
                backgroundPosition: "center 45%",
              }}
            />
          </div>
        </Tile>

        {/* 44 ─ 사진이 글자 뒤로 지나감 (마스크 밴드) */}
        <Tile n={44} name="띠 안의 사진" note="사진을 가로 띠로만 보여주고 위아래는 단색" photo={false}>
          <div
            className="flex h-full flex-col items-center justify-center"
            style={{ background: NAVY }}
          >
            <div
              className="absolute inset-x-0 top-1/2 h-[38%] -translate-y-1/2"
              style={{
                backgroundImage: `url(${PHOTO})`,
                backgroundSize: "cover",
                backgroundPosition: "center 48%",
              }}
            />
            <span className="relative text-[46px] font-black uppercase leading-none tracking-[0.04em] text-white mix-blend-difference">
              CNU UPLP
            </span>
          </div>
        </Tile>

        {/* 45 ─ 왼쪽 정보 컬럼 */}
        <Tile n={45} name="정보 컬럼" note="잡지 표지처럼 좌측에 정보 목록">
          <div className="absolute inset-0 flex">
            <div className="flex w-[34%] flex-col justify-between bg-white/92 px-5 py-5">
              <div>
                <p className="text-[15px] font-black uppercase leading-tight" style={{ color: NAVY }}>
                  CNU
                  <br />
                  UPLP
                </p>
              </div>
              <div className="space-y-1.5 text-[8px] uppercase tracking-[0.2em] text-slate-600">
                <p>화 · 목 19:00</p>
                <p>충남대 실내수영장</p>
                <p>초급 — 마스터즈</p>
              </div>
            </div>
            <div className="flex-1" />
          </div>
        </Tile>

        {/* 46 ─ 하단 고정 바 */}
        <Tile n={46} name="하단 바" note="사진 전체를 살리고 아래 바에만 글자">
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-white px-6 py-4">
            <span
              className="text-[22px] font-black uppercase tracking-[0.06em]"
              style={{ color: NAVY }}
            >
              CNU UPLP
            </span>
            <span className="text-[8px] uppercase tracking-[0.35em] text-slate-500">
              Chungnam Swimming Club
            </span>
          </div>
        </Tile>

        {/* 47 ─ 대형 원형 창 */}
        <Tile n={47} name="원형 창" note="사진을 원으로 오려내고 배경은 단색" photo={false}>
          <div
            className="flex h-full items-center justify-center gap-6 px-8"
            style={{ background: CREAM }}
          >
            <div
              className="h-[76%] w-[42%] shrink-0 rounded-full"
              style={{
                backgroundImage: `url(${PHOTO})`,
                backgroundSize: "cover",
                backgroundPosition: "center 48%",
              }}
            />
            <div>
              <p
                className="text-[30px] font-black uppercase leading-[0.95]"
                style={{ color: NAVY }}
              >
                CNU
                <br />
                UPLP
              </p>
              <p
                className="mt-3 text-[8px] uppercase tracking-[0.35em]"
                style={{ color: NAVY }}
              >
                Swimming Club
              </p>
            </div>
          </div>
        </Tile>

        {/* 48 ─ 세로 3분할 */}
        <Tile n={48} name="세로 3분할" note="사진을 세 조각으로 나누고 사이에 글자" photo={false}>
          <div className="flex h-full gap-1 bg-white">
            {[38, 52, 45].map((pos, i) => (
              <div
                key={i}
                className="flex-1"
                style={{
                  backgroundImage: `url(${PHOTO})`,
                  backgroundSize: "300% auto",
                  backgroundPosition: `${i * 50}% ${pos}%`,
                }}
              />
            ))}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-white py-2 text-center">
              <span
                className="text-[26px] font-black uppercase tracking-[0.22em]"
                style={{ color: NAVY }}
              >
                CNU UPLP
              </span>
            </div>
          </div>
        </Tile>

        {/* 49 ─ 모서리 배치 */}
        <Tile n={49} name="네 모서리" note="가운데를 비우고 정보를 모서리로 흩음">
          <div className="absolute inset-0 p-6">
            <span className="absolute left-6 top-6 text-[9px] uppercase tracking-[0.35em] text-white/90">
              Chungnam Nat&apos;l Univ.
            </span>
            <span className="absolute right-6 top-6 text-[9px] uppercase tracking-[0.35em] text-white/90">
              Est. 2015
            </span>
            <span className="absolute bottom-6 left-6 text-[30px] font-black uppercase leading-none tracking-[0.02em] text-white">
              CNU UPLP
            </span>
            <span className="absolute bottom-6 right-6 text-[9px] uppercase tracking-[0.35em] text-white/90">
              Swimming Club
            </span>
          </div>
        </Tile>

        {/* 50 ─ 사진 위 종이 */}
        <Tile n={50} name="사진 위 종이" note="사진 위에 종이 한 장을 얹은 구성">
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-[62%] px-8 py-7 text-center shadow-[0_18px_40px_rgba(8,47,73,.35)]"
              style={{ background: CREAM }}
            >
              <p
                className="text-[9px] uppercase tracking-[0.42em]"
                style={{ color: NAVY }}
              >
                Chungnam Nat&apos;l University
              </p>
              <p
                className="mt-3 text-[34px] font-black uppercase leading-none tracking-[0.04em]"
                style={{ color: NAVY }}
              >
                CNU UPLP
              </p>
              <span
                className="mx-auto mt-4 block h-px w-14"
                style={{ background: NAVY }}
              />
            </div>
          </div>
        </Tile>
      </div>
    </div>
  );
}
