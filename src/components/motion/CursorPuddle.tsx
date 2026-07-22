"use client";

import { useEffect, useRef } from "react";

/**
 * 전역 커서 물웅덩이.
 *
 * 유체 시뮬(넓게 번져 얼룩짐) 대신, 커서를 부드럽게(관성) 따라오는 소프트한
 * 물빛 방울 + 움직일 때 퍼지는 잔물결 링을 2D 캔버스로 직접 그린다. 국소적이라
 * 어떤 배경/페이지에서도 번짐·washout 없이 깔끔하게 보인다.
 *
 * 전체 화면 고정, pointer-events: none(클릭 통과), 내비게이터(z-50) 아래(z-40).
 * 마우스가 없는 터치 기기에선 실행하지 않는다.
 */
export default function CursorPuddle() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const ctxOrNull = canvas.getContext("2d");
    if (!ctxOrNull) return;
    const ctx: CanvasRenderingContext2D = ctxOrNull;

    let w = 0;
    let h = 0;
    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const target = { x: w / 2, y: h / 2 };
    const pos = { x: w / 2, y: h / 2 };
    let lastX = pos.x;
    let lastY = pos.y;
    let started = false;
    let idle = 999; // 마지막 움직임 이후 프레임 수(그리기 절약)
    const ripples: { x: number; y: number; r: number; life: number }[] = [];

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!started) {
        started = true;
        pos.x = e.clientX;
        pos.y = e.clientY;
        lastX = pos.x;
        lastY = pos.y;
      }
      idle = 0;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", resize);

    let raf = 0;
    function frame() {
      idle++;
      // 관성 추종(액체 지연감)
      pos.x += (target.x - pos.x) * 0.14;
      pos.y += (target.y - pos.y) * 0.14;

      // 충분히 움직였으면 잔물결 생성
      const moved = Math.hypot(pos.x - lastX, pos.y - lastY);
      if (started && moved > 7 && ripples.length < 20) {
        ripples.push({ x: pos.x, y: pos.y, r: 10, life: 1 });
        lastX = pos.x;
        lastY = pos.y;
      }

      ctx.clearRect(0, 0, w, h);

      if (started && idle < 220) {
        // 물빛 웅덩이(겹친 소프트 방울)
        const layers = [
          { r: 115, a: 0.09, c: "56, 189, 248" }, // sky-400
          { r: 74, a: 0.11, c: "34, 211, 238" }, // cyan-400
          { r: 40, a: 0.13, c: "125, 211, 252" }, // sky-300
        ];
        for (const L of layers) {
          const g = ctx.createRadialGradient(
            pos.x,
            pos.y,
            0,
            pos.x,
            pos.y,
            L.r,
          );
          g.addColorStop(0, `rgba(${L.c}, ${L.a})`);
          g.addColorStop(1, `rgba(${L.c}, 0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, L.r, 0, Math.PI * 2);
          ctx.fill();
        }

        // 잔물결 링(밝은 물빛이라 파란 배경에서도 보임)
        for (let i = ripples.length - 1; i >= 0; i--) {
          const rp = ripples[i];
          rp.r += 2.4;
          rp.life -= 0.022;
          if (rp.life <= 0) {
            ripples.splice(i, 1);
            continue;
          }
          ctx.strokeStyle = `rgba(224, 242, 254, ${rp.life * 0.35})`; // sky-100
          ctx.lineWidth = 2 * rp.life;
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (ripples.length) {
        ripples.length = 0;
      }

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40"
    />
  );
}
