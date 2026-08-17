"use client";

import { useState } from "react";
import SectionLabel from "./SectionLabel";

const FAQS = [
  {
    q: "수영을 전혀 못해도 가입할 수 있나요?",
    a: "물론입니다. 수준별 레인을 운영해서 물에 처음 들어가는 분도 기초부터 배울 수 있어요. 실제로 신입 부원의 절반 이상이 초급으로 시작합니다.",
  },
  {
    q: "회비는 어떻게 되나요?",
    a: "정회원 기준 학기당 5만원이며, 강습비는 별도로 안내됩니다. 가입 전 정기 훈련을 무료로 1회 체험할 수 있습니다.",
  },
  {
    q: "장비는 따로 준비해야 하나요?",
    a: "수영복·수경·수모는 개인 준비가 필요합니다. 처음이신 분께는 구매 가이드를 안내해 드리고, 대여 가능한 장비도 일부 있습니다.",
  },
  {
    q: "대회에 꼭 나가야 하나요?",
    a: "아니요. 대회 참가는 자율입니다. 친목과 취미로만 활동하셔도 전혀 문제없습니다.",
  },
  {
    q: "정기 훈련은 언제, 어디서 하나요?",
    a: "매주 수·토 저녁, 학교 실내 수영장(50m 레인)에서 진행합니다. 자세한 일정은 공지사항에서 확인하세요.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <SectionLabel no="(08)" title="자주 묻는 질문" />

        <div className="glass mt-12 divide-y divide-sky-100 overflow-hidden rounded-3xl">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-slate-800">{item.q}</span>
                  <span
                    className={`shrink-0 text-xl text-sky-600 transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                <div
                  className="grid overflow-hidden px-6 text-sm leading-relaxed text-slate-600 transition-all duration-300"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                  }}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="pb-5">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
