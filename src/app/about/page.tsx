export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col bg-sky-50/40">
      <section className="bg-gradient-to-r from-sky-700 to-cyan-600 px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold">동아리 소개</h1>
          <p className="mt-3 text-sky-50/90">
            UPLP 수영 동아리는 누구나 환영하는 열린 수영 커뮤니티입니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-14">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sky-100">
            <h2 className="font-semibold text-sky-800">활동 시간</h2>
            <p className="mt-2 text-sm text-slate-600">매주 화 · 목 19:00 ~ 21:00</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sky-100">
            <h2 className="font-semibold text-sky-800">활동 장소</h2>
            <p className="mt-2 text-sm text-slate-600">학교 실내 수영장 (50m 레인)</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sky-100">
            <h2 className="font-semibold text-sky-800">대상</h2>
            <p className="mt-2 text-sm text-slate-600">수영 초급자부터 마스터즈까지 누구나</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sky-100">
            <h2 className="font-semibold text-sky-800">회비</h2>
            <p className="mt-2 text-sm text-slate-600">학기당 5만원 (강습비 별도 안내)</p>
          </div>
        </div>
      </section>
    </div>
  );
}
