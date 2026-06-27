import Link from "next/link";
import AxolotlGame from "@/components/AxolotlGame";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden text-white">
        {/* 배경 영상 */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/uplp.mp4"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        />
        {/* 가독성을 위한 연한 하늘색 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400/35 via-sky-300/25 to-cyan-300/30" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-28 text-center">
          <span className="rounded-full bg-white/15 px-4 py-1 text-sm font-medium tracking-wide">
            UPLP SWIMMING CLUB
          </span>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            안녕하세요. 우파루파입니다
          </h1>
          <p className="max-w-xl text-sky-50/90">
            UPLP 수영 동아리는 초보부터 마스터즈까지 누구나 환영합니다.
            정기 훈련, 친목 모임, 그리고 연 1회 정기 시합까지 함께해요.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/ticket"
              className="rounded-full bg-white px-6 py-3 font-semibold text-sky-700 shadow-lg transition hover:bg-sky-50"
            >
              티켓 예매하기
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-white/60 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              동아리 소개 보기
            </Link>
          </div>
        </div>
        {/* wave divider */}
        <svg
          className="relative block w-full text-sky-50"
          viewBox="0 0 1440 100"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          <path d="M0,40 C240,90 480,0 720,40 C960,80 1200,10 1440,50 L1440,100 L0,100 Z" />
        </svg>
      </section>

      {/* Highlights */}
      <section className="bg-sky-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-sky-800">
            동아리 활동 한눈에 보기
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: "🏊‍♀️",
                title: "정기 훈련",
                desc: "주 2회 자유형/접영/배영/평형 기초부터 체계적으로 훈련합니다.",
              },
              {
                icon: "🏆",
                title: "연합 시합",
                desc: "매년 대학 연합 수영 대회에 참가하며 실력을 겨룹니다.",
              },
              {
                icon: "🌊",
                title: "친목 활동",
                desc: "워크숍, 바다 수영 MT 등 다양한 친목 프로그램을 운영합니다.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-sky-100"
              >
                <div className="text-3xl">{item.icon}</div>
                <h3 className="mt-3 font-semibold text-sky-800">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-3xl bg-sky-700 px-8 py-12 text-center text-white">
          <h2 className="text-2xl font-bold">다가오는 정기 시합, 함께 응원와요!</h2>
          <p className="text-sky-50/90">
            티켓 예매 및 공지사항은 아래 페이지에서 확인하세요.
          </p>
          <div className="flex gap-3 pt-2">
            <Link
              href="/ticket"
              className="rounded-full bg-white px-5 py-2.5 font-semibold text-sky-700 hover:bg-sky-50"
            >
              티케팅 바로가기
            </Link>
            <Link
              href="/notice"
              className="rounded-full border border-white/60 px-5 py-2.5 font-semibold hover:bg-white/10"
            >
              공지사항 보기
            </Link>
          </div>
        </div>
      </section>

      {/* 미니게임 */}
      <AxolotlGame />
    </div>
  );
}
