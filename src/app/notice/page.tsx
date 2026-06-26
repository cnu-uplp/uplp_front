const NOTICES = [
  { date: "2026-06-20", title: "2026 여름 정기 시합 참가 신청 안내" },
  { date: "2026-06-10", title: "신입부원 모집 마감 안내" },
  { date: "2026-05-28", title: "6월 정기 훈련 일정 변경" },
];

export default function NoticePage() {
  return (
    <div className="flex flex-1 flex-col bg-sky-50/40">
      <section className="bg-gradient-to-r from-sky-700 to-cyan-600 px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold">공지사항 / 일정</h1>
          <p className="mt-3 text-sky-50/90">동아리의 새로운 소식을 확인하세요.</p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 py-14">
        <ul className="divide-y divide-sky-100 rounded-2xl bg-white shadow-sm ring-1 ring-sky-100">
          {NOTICES.map((notice) => (
            <li key={notice.title} className="flex items-center justify-between gap-4 px-6 py-4">
              <span className="font-medium text-slate-700">{notice.title}</span>
              <span className="shrink-0 text-sm text-slate-400">{notice.date}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
