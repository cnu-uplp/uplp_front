"use client";

import { useEffect, useRef } from "react";

// 잭팟(휠) 스타일 시각 선택기.
// value/onChange는 24시간 "HH:MM" 문자열. 내부적으로 오전/오후·시(1~12)·분으로 나눠 굴린다.
type Props = {
  value: string; // "HH:MM" (24h). 빈 문자열이면 09:00으로 시작
  onChange: (v: string) => void;
  minuteStep?: number;
};

const ITEM_H = 36; // 각 항목 높이(px) — CSS와 맞춰야 함

function parse(value: string) {
  const [hRaw, mRaw] = (value || "09:00").split(":");
  const h24 = Math.min(23, Math.max(0, Number(hRaw) || 0));
  const m = Math.min(59, Math.max(0, Number(mRaw) || 0));
  return {
    period: h24 < 12 ? "AM" : "PM",
    hour12: h24 % 12 === 0 ? 12 : h24 % 12,
    minute: m,
  };
}

function toValue(period: string, hour12: number, minute: number) {
  let h24 = hour12 % 12;
  if (period === "PM") h24 += 12;
  return `${String(h24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

// 스크롤 스냅으로 하나만 고르는 휠 한 칸
function Wheel({
  items,
  selected,
  onSelect,
  ariaLabel,
}: {
  items: { label: string; value: string | number }[];
  selected: string | number;
  onSelect: (v: string | number) => void;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 선택값이 바뀌면 해당 항목으로 스크롤 위치를 맞춘다
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const idx = items.findIndex((it) => it.value === selected);
    if (idx >= 0 && Math.round(el.scrollTop / ITEM_H) !== idx) {
      el.scrollTop = idx * ITEM_H;
    }
  }, [selected, items]);

  // 스크롤이 멈추면 가운데 항목을 선택으로 확정
  function onScroll() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const idx = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ITEM_H)));
      const next = items[idx];
      if (next && next.value !== selected) onSelect(next.value);
    }, 90);
  }

  return (
    <div
      ref={ref}
      onScroll={onScroll}
      role="listbox"
      aria-label={ariaLabel}
      className="h-[108px] flex-1 snap-y snap-mandatory overflow-y-auto overscroll-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ paddingTop: ITEM_H, paddingBottom: ITEM_H }}
    >
      {items.map((it) => {
        const active = it.value === selected;
        return (
          <button
            key={String(it.value)}
            type="button"
            role="option"
            aria-selected={active}
            onClick={() => onSelect(it.value)}
            style={{ height: ITEM_H }}
            className={`flex w-full snap-center items-center justify-center text-sm transition ${
              active ? "font-bold text-sky-800" : "text-slate-400"
            }`}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

export default function WheelTimePicker({ value, onChange, minuteStep = 5 }: Props) {
  const { period, hour12, minute } = parse(value);

  const periods = [
    { label: "오전", value: "AM" },
    { label: "오후", value: "PM" },
  ];
  const hours = Array.from({ length: 12 }, (_, i) => ({
    label: String(i + 1),
    value: i + 1,
  }));
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => ({
    label: String(i * minuteStep).padStart(2, "0"),
    value: i * minuteStep,
  }));

  // 분이 step에 안 맞으면 가장 가까운 값으로 표시
  const snappedMinute =
    minutes.find((m) => m.value === minute)?.value ??
    minutes.reduce((a, b) => (Math.abs(b.value - minute) < Math.abs(a.value - minute) ? b : a))
      .value;

  return (
    <div className="relative rounded-xl border border-white/60 bg-white/70 px-2 py-1">
      {/* 가운데 선택 하이라이트 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-2 top-1/2 -translate-y-1/2 rounded-lg bg-sky-100/70 ring-1 ring-sky-200"
        style={{ height: ITEM_H }}
      />
      <div className="relative flex items-stretch gap-1">
        <Wheel
          items={periods}
          selected={period}
          onSelect={(v) => onChange(toValue(String(v), hour12, snappedMinute))}
          ariaLabel="오전 오후 선택"
        />
        <Wheel
          items={hours}
          selected={hour12}
          onSelect={(v) => onChange(toValue(period, Number(v), snappedMinute))}
          ariaLabel="시 선택"
        />
        <Wheel
          items={minutes}
          selected={snappedMinute}
          onSelect={(v) => onChange(toValue(period, hour12, Number(v)))}
          ariaLabel="분 선택"
        />
      </div>
    </div>
  );
}
