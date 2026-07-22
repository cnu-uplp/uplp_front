"use client";

import { useEffect } from "react";

/**
 * 마우스가 지나갈 때마다 그 자리에서 물결이 동심원으로 퍼지는 효과.
 * 이동 거리/시간으로 스로틀해서, 마우스를 움직이는 동안 물 위를 스치는 느낌을 준다.
 * 실제 애니메이션은 globals.css의 @keyframes cursor-ripple 이 담당한다.
 */
export default function CursorRipple() {
  useEffect(() => {
    // 마우스가 없는 터치 기기에서는 실행하지 않는다
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lastX = 0;
    let lastY = 0;
    let lastT = 0;

    const spawn = (x: number, y: number) => {
      const el = document.createElement("div");
      el.className = "cursor-ripple";
      // 위치는 transform으로 지정(keyframe이 scale과 함께 사용)
      el.style.setProperty("--rx", `${x}px`);
      el.style.setProperty("--ry", `${y}px`);
      el.addEventListener("animationend", () => el.remove());
      document.body.appendChild(el);
    };

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      // 너무 자주 생기지 않게: 최소 90ms 간격 + 최소 26px 이동
      if (now - lastT < 90 || dist < 26) return;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
      spawn(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document
        .querySelectorAll(".cursor-ripple")
        .forEach((el) => el.remove());
    };
  }, []);

  return null;
}
