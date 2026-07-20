const TICKETS = [
  { name: "일반 입장권", price: "5,000원", desc: "정기 시합 일반 관람석" },
  { name: "동아리원 무료", price: "0원", desc: "재학생 동아리원 본인 확인 시 무료" },
];

export default function TicketPage() {
  return (
    <div className="flex flex-1 flex-col px-6 pb-24 pt-32">
      <div className="mx-auto w-full max-w-3xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-sky-900">티케팅</h1>
          <p className="mt-4 text-slate-600">
            2026 여름 정기 시합 입장권을 예매하세요.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {TICKETS.map((ticket) => (
            <div
              key={ticket.name}
              className="glass glass-hover flex flex-col rounded-3xl p-7"
            >
              <h2 className="font-semibold text-sky-900">{ticket.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{ticket.desc}</p>
              <p className="mt-5 text-2xl font-bold text-sky-700">{ticket.price}</p>
              <button
                type="button"
                className="mt-5 rounded-full bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:scale-[1.02] hover:bg-sky-500"
              >
                예매하기
              </button>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-slate-500">
          * 결제 연동은 추후 적용될 예정입니다.
        </p>
      </div>
    </div>
  );
}
