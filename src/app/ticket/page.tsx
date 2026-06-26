const TICKETS = [
  { name: "일반 입장권", price: "5,000원", desc: "정기 시합 일반 관람석" },
  { name: "동아리원 무료", price: "0원", desc: "재학생 동아리원 본인 확인 시 무료" },
];

export default function TicketPage() {
  return (
    <div className="flex flex-1 flex-col bg-sky-50/40">
      <section className="bg-gradient-to-r from-sky-700 to-cyan-600 px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold">티케팅</h1>
          <p className="mt-3 text-sky-50/90">
            2026 여름 정기 시합 입장권을 예매하세요.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 py-14">
        <div className="grid gap-6 sm:grid-cols-2">
          {TICKETS.map((ticket) => (
            <div
              key={ticket.name}
              className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sky-100"
            >
              <h2 className="font-semibold text-sky-800">{ticket.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{ticket.desc}</p>
              <p className="mt-4 text-xl font-bold text-sky-700">{ticket.price}</p>
              <button
                type="button"
                className="mt-4 rounded-full bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
              >
                예매하기
              </button>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-slate-400">
          * 결제 연동은 추후 적용될 예정입니다.
        </p>
      </section>
    </div>
  );
}
