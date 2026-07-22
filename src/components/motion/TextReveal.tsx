"use client";

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

type Props = {
  text: string;
  className?: string;
  delay?: number;
  /** 조각 사이 간격(초) */
  stagger?: number;
  /** "word" = 단어 단위, "line" = 줄바꿈(\n) 단위 */
  by?: "word" | "line";
  /** true면 스크롤과 무관하게 로드 즉시 재생 (히어로용) */
  immediate?: boolean;
};

/**
 * 텍스트 리빌: 각 조각을 overflow:hidden 안에서 아래→위로 올린다.
 * 실제 애니메이션은 globals.css의 @keyframes text-up 이 담당한다.
 */
export default function TextReveal({
  text,
  className,
  delay = 0,
  stagger = 0.06,
  by = "word",
  immediate = false,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  // 항상 숨김 상태로 시작하고, 마운트(=화면 표시) 후에 재생한다.
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (immediate) {
      const id = setTimeout(() => setPlay(true), 80);
      return () => clearTimeout(id);
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlay(true);
          io.disconnect();
        }
      },
      { rootMargin: "-10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [immediate]);

  const parts = by === "line" ? text.split("\n") : text.split(" ");

  return (
    <span ref={ref} className={className}>
      {parts.map((part, i) => (
        <Fragment key={i}>
          <span
            className={
              by === "line"
                ? "block overflow-hidden"
                : "inline-block overflow-hidden align-bottom"
            }
          >
            <span
              className={`inline-block ${play ? "text-play" : "text-init"}`}
              style={
                { "--reveal-delay": `${delay + i * stagger}s` } as CSSProperties
              }
            >
              {part}
            </span>
          </span>
          {/* 공백은 래퍼 바깥에 둬야 inline-block 경계에서 잘리지 않는다 */}
          {by === "word" && i < parts.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
