"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Framer 사이트 특유의 "관성 있는" 스크롤 + 스크롤 속도에 따른 미세 기울기(skewY).
 * 기울기 값은 CSS 변수 --scroll-skew 로 노출되며, 원하는 요소에서
 * `transform: skewY(var(--scroll-skew))` 로 사용할 수 있다.
 */
export default function SmoothScroll() {
  useEffect(() => {
    // 접근성: 모션 최소화 설정이면 부드러운 스크롤을 적용하지 않는다
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    const root = document.documentElement;
    lenis.on("scroll", ({ velocity }: { velocity: number }) => {
      // Framer 템플릿에서 관측된 기울기 범위(약 ±0.2deg)에 맞춰 스케일 조정
      const skew = Math.max(-0.25, Math.min(0.25, velocity * 0.02));
      root.style.setProperty("--scroll-skew", `${skew}deg`);
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      root.style.removeProperty("--scroll-skew");
    };
  }, []);

  return null;
}
