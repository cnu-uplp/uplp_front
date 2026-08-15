/**
 * 히어로 타이포 시안 6차 (/hero-lab/6) — 51~60번.
 *
 * 앞선 50개에서 쓴 축은 전부 제외한다.
 *   1~10  서체·기법 (세리프/사진채움/유리/잉크/세로/분할선/엠블럼/모노/블렌드/넘침)
 *   11~20 색 (네이비·와인·골드·청록·색수차·넉아웃·한글·레터프레스·difference·multiply)
 *   21~30 표현 (줄무늬·반사·수평선분할·네온·양끝맞춤·대각선·에코·아치·물결·스텐실)
 *   31~40 반사 고정 + 글자 스타일
 *   41~50 화면 구조 (좌우/상하분할·액자·띠·컬럼·하단바·원형창·3분할·모서리·종이)
 *
 * 이번 축: 글자의 '양'과 '리듬' — 반복, 흐름, 극단적 절제, 목록, 깊이, 심볼.
 */

const PHOTO = "/pink_lake.jpg";
const NAVY = "#0d2f42";

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

export default function HeroLab6() {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-slate-100 p-8">
      <h1 className="mb-1 text-xl font-bold text-slate-900">
        히어로 타이포 시안 6차 — 51~60번
      </h1>
      <p className="mb-6 text-[13px] text-slate-600">
        이번 축은 <b>글자의 양과 리듬</b> — 반복 · 흐름 · 극단적 절제 · 목록 · 깊이 · 심볼.
        앞선 50개의 축(서체 / 색 / 표현기법 / 반사 / 화면구조)은 전부 제외했습니다.
      </p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-7">
        {/* 51 ─ 반복 패턴 */}
        <Tile n={51} name="반복 패턴" note="같은 단어를 여러 줄 반복 · 텍스처가 됨">
          <div className="absolute inset-0 flex flex-col justify-center overflow-hidden">
            {[0.18, 0.35, 1, 0.35, 0.18].map((op, i) => (
              <span
                key={i}
                className="block whitespace-nowrap text-center text-[34px] font-black uppercase leading-[1.15] tracking-[0.06em] text-white"
                style={{ opacity: op }}
              >
                UPLP UPLP UPLP UPLP
              </span>
            ))}
          </div>
        </Tile>

        {/* 52 ─ 마퀴 띠 */}
        <Tile n={52} name="흐르는 띠" note="가로로 지나가는 텍스트 띠 · 실제로는 움직임">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden border-y border-white/40 bg-white/10 py-3 backdrop-blur-[2px]">
            <span className="block whitespace-nowrap text-[22px] font-bold uppercase tracking-[0.3em] text-white">
              CNU UPLP · SWIMMING CLUB · CNU UPLP · SWIMMING CLUB · CNU UPLP ·
            </span>
          </div>
        </Tile>

        {/* 53 ─ 극단적 미니멀 */}
        <Tile n={53} name="극단적 절제" note="아주 작은 워드마크 하나 · 나머지는 전부 여백">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[13px] font-semibold uppercase tracking-[0.62em] text-white">
              CNU UPLP
            </span>
          </div>
        </Tile>

        {/* 54 ─ 스위스 그리드 */}
        <Tile n={54} name="스위스 그리드" note="격자선 위 비대칭 배치 · 편집 디자인 정석">
          <div className="absolute inset-0">
            {[25, 50, 75].map((x) => (
              <span
                key={x}
                className="absolute inset-y-0 w-px bg-white/25"
                style={{ left: `${x}%` }}
              />
            ))}
            {[33, 66].map((y) => (
              <span
                key={y}
                className="absolute inset-x-0 h-px bg-white/25"
                style={{ top: `${y}%` }}
              />
            ))}
            <span className="absolute left-[25%] top-[33%] -translate-y-[130%] pl-2 text-[9px] uppercase tracking-[0.3em] text-white/90">
              01 — Chungnam
            </span>
            <span className="absolute left-[25%] top-[33%] pl-2 text-[38px] font-black uppercase leading-[0.95] tracking-[-0.01em] text-white">
              CNU
              <br />
              UPLP
            </span>
          </div>
        </Tile>

        {/* 55 ─ 손글씨 */}
        <Tile n={55} name="손글씨" note="필기체 · 사람 손의 온도">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-[58px] leading-none text-white [text-shadow:0_2px_12px_rgba(8,47,73,.5)]"
              style={{
                fontFamily:
                  "'Snell Roundhand','Apple Chancery','Brush Script MT',cursive",
              }}
            >
              Uplp
            </span>
            <span className="mt-3 text-[9px] uppercase tracking-[0.45em] text-white/90">
              Chungnam Swimming Club
            </span>
          </div>
        </Tile>

        {/* 56 ─ 인용구 */}
        <Tile n={56} name="인용구" note="큰 따옴표 · 문장이 주인공">
          <div className="absolute inset-0 flex flex-col justify-center px-10">
            <span className="text-[54px] leading-none text-white/70">&ldquo;</span>
            <span className="-mt-3 text-[21px] font-medium leading-[1.5] text-white [text-shadow:0_1px_8px_rgba(8,47,73,.6)]">
              초보부터 마스터즈까지,
              <br />
              물살을 가르는 즐거움
            </span>
            <span className="mt-4 text-[9px] uppercase tracking-[0.35em] text-white/85">
              — CNU UPLP
            </span>
          </div>
        </Tile>

        {/* 57 ─ 인덱스 목록 */}
        <Tile n={57} name="인덱스 목록" note="번호가 붙은 목차형 · 정보가 먼저">
          <div className="absolute inset-0 flex flex-col justify-center gap-2 px-10">
            {[
              ["01", "동아리 소개"],
              ["02", "정기수영"],
              ["03", "공지 · 일정"],
            ].map(([num, label]) => (
              <div key={num} className="flex items-baseline gap-4">
                <span className="text-[10px] font-bold tabular-nums text-white/60">
                  {num}
                </span>
                <span className="text-[24px] font-semibold leading-none text-white">
                  {label}
                </span>
              </div>
            ))}
            <span className="mt-4 text-[9px] uppercase tracking-[0.4em] text-white/85">
              CNU UPLP Swimming Club
            </span>
          </div>
        </Tile>

        {/* 58 ─ 깊이 겹침 */}
        <Tile n={58} name="깊이 겹침" note="글자가 사진의 물 뒤로 들어감">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[62px] font-black uppercase leading-none tracking-[0.02em] text-white">
              UPLP
            </span>
          </div>
          {/* 사진의 아래쪽(물·소금밭)만 다시 덮어 글자가 그 뒤로 들어간 것처럼 보이게 */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `url(${PHOTO})`,
              backgroundSize: "cover",
              backgroundPosition: "center 42%",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0 54%, #000 60%)",
              maskImage:
                "linear-gradient(to bottom, transparent 0 54%, #000 60%)",
            }}
          />
        </Tile>

        {/* 59 ─ 계단식 크기 */}
        <Tile n={59} name="계단식 크기" note="글자마다 크기가 커짐 · 물결처럼 번짐">
          <div className="absolute inset-0 flex items-end justify-center pb-[18%]">
            {["U", "P", "L", "P"].map((c, i) => (
              <span
                key={i}
                className="font-black uppercase leading-none text-white"
                style={{
                  fontSize: `${26 + i * 16}px`,
                  textShadow: "0 2px 10px rgba(8,47,73,.5)",
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </Tile>

        {/* 60 ─ 심볼 마크 */}
        <Tile n={60} name="심볼 마크" note="글자 대신 도형이 먼저 · 우파루파 아가미">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <svg width="96" height="72" viewBox="0 0 96 72" aria-hidden>
              <circle cx="48" cy="40" r="20" fill="none" stroke="#fff" strokeWidth="3" />
              {[-1, 1].map((s) =>
                [0, 1, 2].map((k) => (
                  <path
                    key={`${s}-${k}`}
                    d={`M ${48 + s * 20} ${32 + k * 8} q ${s * 14} ${-6} ${s * 22} ${-2}`}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                ))
              )}
            </svg>
            <span className="mt-4 text-[20px] font-black uppercase tracking-[0.3em] text-white">
              UPLP
            </span>
          </div>
        </Tile>
      </div>
    </div>
  );
}
