const NOTICES = [
  { date: "2026-06-20", title: "2026 여름 정기 시합 참가 신청 안내" },
  { date: "2026-06-10", title: "신입부원 모집 마감 안내" },
  { date: "2026-05-28", title: "6월 정기 훈련 일정 변경" },
];

export default function NoticePage() {
  return (
    <div className="flex flex-1 flex-col px-6 pb-24 pt-32">
      <div className="mx-auto w-full max-w-3xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-sky-900">
            공지사항 / 일정
          </h1>
          <p className="mt-4 text-slate-600">동아리의 새로운 소식을 확인하세요.</p>
        </div>

        <ul className="glass mt-12 divide-y divide-white/40 overflow-hidden rounded-3xl">
          {NOTICES.map((notice) => (
            <li
              key={notice.title}
              className="flex items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-white/40"
            >
              <span className="font-medium text-slate-800">{notice.title}</span>
              <span className="shrink-0 text-sm text-slate-500">{notice.date}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
