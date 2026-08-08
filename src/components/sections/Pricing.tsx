import Link from "next/link";
import SectionLabel from "./SectionLabel";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

const PLANS = [
  {
    name: "체험",
    price: "0",
    unit: "무료 1회",
    desc: "가입 전 정기 훈련을 직접 체험해보세요.",
    points: ["정기 훈련 1회 참여", "기초 강습 참관", "동아리 안내"],
    dark: false,
  },
  {
    name: "정회원",
    price: "5",
    unit: "만원 / 학기",
    desc: "가장 인기 있는 정규 활동 플랜.",
    points: [
      "주 2회 정기 훈련",
      "수준별 강습",
      "연합 대회 참가 자격",
      "MT·워크숍 참여",
    ],
    dark: true,
  },
  {
    name: "OB·후원",
    price: "자유",
    unit: "후원",
    desc: "졸업생·후원자를 위한 열린 참여.",
    points: ["행사 초청", "OB 네트워크", "동아리 후원"],
    dark: false,
  },
];

export default function Pricing() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionLabel no="(04)" title="회비 안내" />

        <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.12}>
          {PLANS.map((plan) => (
            <RevealItem
              key={plan.name}
              className={`flex flex-col rounded-3xl p-7 ${
                plan.dark
                  ? "bg-sky-700 text-white shadow-xl shadow-sky-700/25"
                  : "glass"
              }`}
            >
              <h3
                className={`font-semibold ${
                  plan.dark ? "text-white" : "text-sky-900"
                }`}
              >
                {plan.name}
              </h3>
              <p
                className={`mt-1 text-sm ${
                  plan.dark ? "text-sky-100/80" : "text-slate-500"
                }`}
              >
                {plan.desc}
              </p>

              <div className="mt-5 flex items-end gap-1">
                <span
                  className={`text-3xl font-bold ${
                    plan.dark ? "text-white" : "text-sky-800"
                  }`}
                >
                  {plan.price}
                </span>
                <span
                  className={`pb-1 text-sm ${
                    plan.dark ? "text-sky-100/70" : "text-slate-500"
                  }`}
                >
                  {plan.unit}
                </span>
              </div>

              <Link
                href="/login"
                className={`mt-5 rounded-full px-4 py-2.5 text-center text-sm font-semibold transition ${
                  plan.dark
                    ? "bg-white text-sky-700 hover:bg-sky-50"
                    : "bg-sky-600 text-white hover:bg-sky-500"
                }`}
              >
                카카오로 시작하기
              </Link>

              <ul className="mt-6 space-y-2.5">
                {plan.points.map((pt) => (
                  <li
                    key={pt}
                    className={`flex items-start gap-2 text-sm ${
                      plan.dark ? "text-sky-100/90" : "text-slate-600"
                    }`}
                  >
                    <span
                      className={plan.dark ? "text-sky-200" : "text-sky-500"}
                      aria-hidden
                    >
                      +
                    </span>
                    {pt}
                  </li>
                ))}
              </ul>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
