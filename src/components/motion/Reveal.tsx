"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** true면 스크롤과 무관하게 로드 즉시 재생 (히어로용 — Framer의 appear 애니메이션) */
  immediate?: boolean;
};

/**
 * 등장 애니메이션.
 * 실제 애니메이션은 globals.css의 @keyframes reveal-up 이 담당하므로
 * JS 타이밍(hydration/프레임)과 무관하게 확실히 재생된다.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 10,
  immediate = false,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // 항상 숨김 상태로 시작하고, 마운트(=화면 표시) 후에 재생한다.
  // immediate면 로드 직후 재생, 아니면 화면에 들어올 때 재생.
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (immediate) {
      // hydration 이후 한 박자 뒤 재생 → 로딩 중 끝나버리지 않고 사용자가 보게 된다
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

  const style = {
    "--reveal-delay": `${delay}s`,
    "--reveal-y": `${y}px`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={`${play ? "reveal-play" : "reveal-init"} ${className ?? ""}`}
      style={style}
    >
      {children}
    </div>
  );
}

/** 자식들을 순차(stagger)로 등장시키는 컨테이너 — Framer의 delay 0.4→0.5→0.6 패턴 */
export function RevealGroup({
  children,
  className,
  stagger = 0.12,
  delayChildren = 0.1,
}: Omit<RevealProps, "delay" | "y"> & {
  stagger?: number;
  delayChildren?: number;
}) {
  return (
    <div className={className}>
      {Children.map(children, (child, i) =>
        isValidElement<RevealProps>(child)
          ? cloneElement(child, { delay: delayChildren + i * stagger })
          : child
      )}
    </div>
  );
}

/** RevealGroup 안에서 쓰는 개별 아이템 (delay는 그룹이 주입) */
export function RevealItem(props: RevealProps) {
  return <Reveal {...props} />;
}
