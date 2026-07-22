"use client";

import { useEffect, useRef } from "react";

/**
 * 마우스 커서를 따라 물웅덩이처럼 일렁이는 효과.
 * 여러 겹의 반투명 물방울이 서로 다른 지연(ease)으로 따라와 액체가 출렁이는 느낌을 준다.
 * 수영 동아리 테마에 맞춰 sky/cyan 톤 + blur.
 */
type Layer = {
  size: number; // 지름(px)
  ease: number; // 따라오는 속도(0~1, 작을수록 더 늦게 = 더 출렁)
  color: string;
  blur: number;
  opacity: number;
};

const LAYERS: Layer[] = [
  { size: 420, ease: 0.06, color: "56, 189, 248", blur: 60, opacity: 0.18 }, // 큰 웅덩이(가장 느림)
  { size: 260, ease: 0.1, color: "34, 211, 238", blur: 40, opacity: 0.22 }, // 중간
  { size: 140, ease: 0.16, color: "125, 211, 252", blur: 24, opacity: 0.28 }, // 안쪽
  { size: 46, ease: 0.24, color: "255, 255, 255", blur: 6, opacity: 0.5 }, // 코어(가장 빠름)
];

export default function CursorFluid() {
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // 마우스가 없는 터치 기기에서는 실행하지 않는다
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = LAYERS.map(() => ({ x: target.x, y: target.y }));
    let visible = false;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        dotsRef.current.forEach((el) => el && (el.style.opacity = "1"));
      }
    };
    const onLeave = () => {
      visible = false;
      dotsRef.current.forEach((el) => el && (el.style.opacity = "0"));
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);

    let raf = 0;
    const loop = () => {
      LAYERS.forEach((layer, i) => {
        const p = pos[i];
        p.x += (target.x - p.x) * layer.ease;
        p.y += (target.y - p.y) * layer.ease;
        const el = dotsRef.current[i];
        if (el) {
          el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
        }
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
      style={{ mixBlendMode: "multiply" }}
    >
      {LAYERS.map((layer, i) => (
        <div
          key={i}
          ref={(el) => {
            dotsRef.current[i] = el;
          }}
          className="absolute left-0 top-0 rounded-full"
          style={{
            width: layer.size,
            height: layer.size,
            background: `radial-gradient(circle, rgba(${layer.color}, ${layer.opacity}) 0%, rgba(${layer.color}, 0) 70%)`,
            filter: `blur(${layer.blur}px)`,
            opacity: 0,
            transition: "opacity 0.4s ease",
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
