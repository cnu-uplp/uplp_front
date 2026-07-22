"use client";

import { useEffect, useRef } from "react";

/**
 * 마우스를 따라 이미지가 물처럼 일렁이는 유체 왜곡(Liquid Hover) 효과.
 *
 * Fuel 템플릿에서 본 기법을 오픈소스 유체 시뮬레이션 알고리즘
 * (GPU Gems / Pavel Dobryakov 계열, MIT)을 바탕으로 자체 재구현한 것.
 * 커서 속도를 속도장(velocity)에 주입 → 발산/압력(Jacobi)/보정/이류(advection)
 * 단계를 GPU에서 매 프레임 풀어, 그 속도장으로 이미지 UV를 왜곡한다.
 */

type Props = {
  src: string;
  /** 시뮬레이션 격자 해상도 배율 (1~10). 클수록 디테일↑·부하↑ */
  resolution?: number;
  /** 커서가 만드는 소용돌이 크기 (0.1~1) */
  cursorSize?: number;
  /** 속도 주입 세기 (0.1~1) */
  cursorPower?: number;
  /** 이미지 왜곡 강도 (0.1~1) */
  distortionPower?: number;
  className?: string;
};

const BASE_VERT = `
  precision highp float;
  attribute vec2 a_position;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform vec2 u_texel;
  void main () {
    vUv = 0.5 * (a_position + 1.0);
    vL = vUv - vec2(u_texel.x, 0.0);
    vR = vUv + vec2(u_texel.x, 0.0);
    vT = vUv + vec2(0.0, u_texel.y);
    vB = vUv - vec2(0.0, u_texel.y);
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// 커서 위치에 값(속도/추적)을 가우시안으로 주입
const SPLAT_FRAG = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D u_target;
  uniform float u_ratio;
  uniform vec3 u_value;
  uniform vec2 u_point;
  uniform float u_size;
  void main () {
    vec2 p = vUv - u_point.xy;
    p.x *= u_ratio;
    vec3 splat = 0.6 * exp(-dot(p, p) / u_size) * u_value;
    vec3 base = texture2D(u_target, vUv).xyz;
    gl_FragColor = vec4(base + splat, 1.0);
  }
`;

const DIVERGENCE_FRAG = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D u_velocity;
  void main () {
    float L = texture2D(u_velocity, vL).x;
    float R = texture2D(u_velocity, vR).x;
    float T = texture2D(u_velocity, vT).y;
    float B = texture2D(u_velocity, vB).y;
    float div = 0.25 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
  }
`;

const PRESSURE_FRAG = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D u_pressure;
  uniform sampler2D u_divergence;
  void main () {
    float L = texture2D(u_pressure, vL).x;
    float R = texture2D(u_pressure, vR).x;
    float T = texture2D(u_pressure, vT).x;
    float B = texture2D(u_pressure, vB).x;
    float divergence = texture2D(u_divergence, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
  }
`;

const GRADIENT_FRAG = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D u_pressure;
  uniform sampler2D u_velocity;
  void main () {
    float L = texture2D(u_pressure, vL).x;
    float R = texture2D(u_pressure, vR).x;
    float T = texture2D(u_pressure, vT).x;
    float B = texture2D(u_pressure, vB).x;
    vec2 velocity = texture2D(u_velocity, vUv).xy;
    velocity.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`;

const ADVECTION_FRAG = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D u_velocity;
  uniform sampler2D u_source;
  uniform vec2 u_texel;
  uniform float u_dt;
  uniform float u_dissipation;
  void main () {
    vec2 coord = vUv - u_dt * texture2D(u_velocity, vUv).xy * u_texel;
    gl_FragColor = u_dissipation * texture2D(u_source, coord);
  }
`;

// 속도장으로 이미지 UV를 밀어 왜곡하고 object-fit: cover로 매핑
const DISPLAY_FRAG = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform float u_ratio;      // 컨테이너 가로/세로
  uniform float u_img_ratio;  // 이미지 가로/세로
  uniform float u_disturb;
  uniform sampler2D u_velocity;
  uniform sampler2D u_image;
  vec2 coverUv(vec2 uv) {
    vec2 s = vec2(1.0);
    if (u_ratio > u_img_ratio) s.y = u_img_ratio / u_ratio;
    else s.x = u_ratio / u_img_ratio;
    return (uv - 0.5) * s + 0.5;
  }
  void main () {
    vec2 vel = texture2D(u_velocity, vUv).xy;
    float mag = length(vel);
    vec2 uv = coverUv(vUv);
    uv -= u_disturb * vel;
    vec3 col = texture2D(u_image, vec2(uv.x, 1.0 - uv.y)).rgb;
    // 흐르는 곳에 살짝 하이라이트를 얹어 '물빛' 느낌
    col += mag * 0.12;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function LiquidHero({
  src,
  resolution = 4,
  cursorSize = 0.5,
  cursorPower = 0.9,
  distortionPower = 0.8,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const gl = canvas.getContext("webgl", { alpha: true, antialias: false });
    if (!gl) return;

    // 부동소수 텍스처 (없으면 조용히 종료 — 정적 이미지가 대신 보임)
    const halfExt = gl.getExtension("OES_texture_half_float");
    gl.getExtension("OES_texture_half_float_linear");
    const floatExt = gl.getExtension("OES_texture_float");
    gl.getExtension("OES_texture_float_linear");
    const texType = halfExt
      ? halfExt.HALF_FLOAT_OES
      : floatExt
        ? gl.FLOAT
        : null;
    if (texType === null) return;

    gl.clearColor(0, 0, 0, 0);

    // 파라미터 정규화 (원본 매핑 감각 반영)
    const cfg = {
      cursorSize: 0.5 + ((cursorSize - 0.1) * 4.5) / 0.9,
      cursorPower: 5 + ((cursorPower - 0.1) * 45) / 0.9,
      distortion: distortionPower,
    };
    const SUPERSAMPLE = 1.2; // 캔버스를 살짝 오버스캔해 가장자리 왜곡을 감춤

    const pointer = { x: 0, y: 0, dx: 0, dy: 0, moved: false };
    let inside = false;
    let sim = { w: 0, h: 0 };
    let imgRatio = 1;
    let imageTex: WebGLTexture | null = null;

    // ── 셰이더/프로그램 ─────────────────────────────
    function compile(type: number, source: string) {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(s) || "shader error");
      }
      return s;
    }
    function program(frag: string) {
      const p = gl.createProgram()!;
      gl.attachShader(p, compile(gl.VERTEX_SHADER, BASE_VERT));
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, frag));
      gl.bindAttribLocation(p, 0, "a_position");
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(p) || "link error");
      }
      const uniforms: Record<string, WebGLUniformLocation | null> = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const info = gl.getActiveUniform(p, i)!;
        uniforms[info.name] = gl.getUniformLocation(p, info.name);
      }
      return { program: p, uniforms };
    }

    let splat: ReturnType<typeof program>;
    let divergence: ReturnType<typeof program>;
    let pressure: ReturnType<typeof program>;
    let gradient: ReturnType<typeof program>;
    let advection: ReturnType<typeof program>;
    let display: ReturnType<typeof program>;
    try {
      splat = program(SPLAT_FRAG);
      divergence = program(DIVERGENCE_FRAG);
      pressure = program(PRESSURE_FRAG);
      gradient = program(GRADIENT_FRAG);
      advection = program(ADVECTION_FRAG);
      display = program(DISPLAY_FRAG);
    } catch {
      return;
    }

    // 전체 화면 사각형
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      gl.STATIC_DRAW,
    );
    const idx = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array([0, 1, 2, 0, 2, 3]),
      gl.STATIC_DRAW,
    );
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    type FBO = {
      fbo: WebGLFramebuffer;
      width: number;
      height: number;
      attach: (unit: number) => number;
    };
    function createFBO(w: number, h: number): FBO {
      const texture = gl.createTexture()!;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, texType!, null);
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0,
      );
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return {
        fbo,
        width: w,
        height: h,
        attach(unit: number) {
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          return unit;
        },
      };
    }
    function createDoubleFBO(w: number, h: number) {
      let a = createFBO(w, h);
      let b = createFBO(w, h);
      return {
        get texelX() {
          return 1 / w;
        },
        get texelY() {
          return 1 / h;
        },
        read: () => a,
        write: () => b,
        swap() {
          const t = a;
          a = b;
          b = t;
        },
      };
    }

    let velocity: ReturnType<typeof createDoubleFBO>;
    let divergenceFBO: FBO;
    let pressureFBO: ReturnType<typeof createDoubleFBO>;

    function blit(target: FBO | null) {
      if (target) {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      } else {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    function resize() {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(2, Math.round(w * SUPERSAMPLE * dpr));
      canvas.height = Math.max(2, Math.round(h * SUPERSAMPLE * dpr));
      canvas.style.width = `${w * SUPERSAMPLE}px`;
      canvas.style.height = `${h * SUPERSAMPLE}px`;
      const aspect = w / h;
      const base = 128 + (resolution - 1) * (384 / 9);
      sim = { w: Math.round(base * aspect), h: Math.round(base) };
    }
    function initFBOs() {
      velocity = createDoubleFBO(sim.w, sim.h);
      divergenceFBO = createFBO(sim.w, sim.h);
      pressureFBO = createDoubleFBO(sim.w, sim.h);
    }

    // 컨테이너 좌표(0..1, 원점 좌하단) — 오버스캔 보정 포함
    function pointerUv() {
      const ew = wrap.clientWidth * SUPERSAMPLE;
      const eh = wrap.clientHeight * SUPERSAMPLE;
      const ox = 0.5 * (ew - wrap.clientWidth);
      const oy = 0.5 * (eh - wrap.clientHeight);
      return { u: (pointer.x + ox) / ew, v: 1 - (pointer.y + oy) / eh };
    }

    function updatePointer(x: number, y: number) {
      pointer.dx = 6 * (x - pointer.x);
      pointer.dy = 6 * (y - pointer.y);
      pointer.x = x;
      pointer.y = y;
      pointer.moved = true;
    }

    // ── 이미지 로드 ──────────────────────────────
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      imgRatio = img.naturalWidth / Math.max(1, img.naturalHeight);
      imageTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, imageTex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    };

    // ── 이벤트 ────────────────────────────────
    // 히어로 위에 그라데이션·텍스트가 덮여있어도 동작하도록
    // window에서 좌표를 받고 히어로 영역 안인지 직접 판정한다.
    const hitTest = (clientX: number, clientY: number) => {
      const r = wrap.getBoundingClientRect();
      const withinX = clientX >= r.left && clientX <= r.right;
      const withinY = clientY >= r.top && clientY <= r.bottom;
      inside = withinX && withinY;
      if (inside) updatePointer(clientX - r.left, clientY - r.top);
      return inside;
    };
    const onMove = (e: MouseEvent) => {
      if (!hitTest(e.clientX, e.clientY)) pointer.moved = false;
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.targetTouches[0];
      if (!t) return;
      hitTest(t.clientX, t.clientY);
    };
    const onResize = () => {
      resize();
      initFBOs();
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(wrap);

    resize();
    initFBOs();

    // ── 시뮬레이션 루프 ─────────────────────────
    function step() {
      const dt = 1 / 60;

      if (pointer.moved) {
        pointer.moved = false;
        const p = pointerUv();
        gl.useProgram(splat.program);
        gl.uniform2f(splat.uniforms.u_texel, velocity.texelX, velocity.texelY);
        gl.uniform1i(splat.uniforms.u_target, velocity.read().attach(1));
        gl.uniform1f(
          splat.uniforms.u_ratio,
          wrap.clientWidth / Math.max(1, wrap.clientHeight),
        );
        gl.uniform2f(splat.uniforms.u_point, p.u, p.v);
        gl.uniform3f(
          splat.uniforms.u_value,
          pointer.dx * cfg.cursorPower * 0.001,
          -pointer.dy * cfg.cursorPower * 0.001,
          0,
        );
        gl.uniform1f(splat.uniforms.u_size, cfg.cursorSize * 0.001);
        blit(velocity.write());
        velocity.swap();
      }

      // divergence
      gl.useProgram(divergence.program);
      gl.uniform2f(divergence.uniforms.u_texel, velocity.texelX, velocity.texelY);
      gl.uniform1i(divergence.uniforms.u_velocity, velocity.read().attach(1));
      blit(divergenceFBO);

      // pressure (Jacobi iteration)
      gl.useProgram(pressure.program);
      gl.uniform2f(pressure.uniforms.u_texel, velocity.texelX, velocity.texelY);
      gl.uniform1i(pressure.uniforms.u_divergence, divergenceFBO.attach(1));
      for (let i = 0; i < 16; i++) {
        gl.uniform1i(pressure.uniforms.u_pressure, pressureFBO.read().attach(2));
        blit(pressureFBO.write());
        pressureFBO.swap();
      }

      // gradient subtract
      gl.useProgram(gradient.program);
      gl.uniform2f(gradient.uniforms.u_texel, velocity.texelX, velocity.texelY);
      gl.uniform1i(gradient.uniforms.u_pressure, pressureFBO.read().attach(1));
      gl.uniform1i(gradient.uniforms.u_velocity, velocity.read().attach(2));
      blit(velocity.write());
      velocity.swap();

      // advection (속도가 스스로를 이동시키며 점점 감쇠)
      gl.useProgram(advection.program);
      gl.uniform2f(advection.uniforms.u_texel, velocity.texelX, velocity.texelY);
      gl.uniform1i(advection.uniforms.u_velocity, velocity.read().attach(1));
      gl.uniform1i(advection.uniforms.u_source, velocity.read().attach(1));
      gl.uniform1f(advection.uniforms.u_dt, dt);
      // 감쇠를 강하게(값↓) 하면 속도가 빨리 잦아들어 잔잔해진다
      gl.uniform1f(advection.uniforms.u_dissipation, 0.94);
      blit(velocity.write());
      velocity.swap();

      // display — 속도장으로 이미지 왜곡
      if (imageTex) {
        gl.useProgram(display.program);
        gl.uniform1f(
          display.uniforms.u_ratio,
          wrap.clientWidth / Math.max(1, wrap.clientHeight),
        );
        gl.uniform1f(display.uniforms.u_img_ratio, imgRatio);
        gl.uniform1f(display.uniforms.u_disturb, cfg.distortion);
        gl.uniform1i(display.uniforms.u_velocity, velocity.read().attach(1));
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, imageTex);
        gl.uniform1i(display.uniforms.u_image, 0);
        blit(null);
      }

      rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [src, resolution, cursorSize, cursorPower, distortionPower]);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
    >
      {/* WebGL 미지원/로딩 중에도 보이도록 정적 이미지를 깔아둔다 */}
      <img
        src={src}
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "120%",
          height: "120%",
        }}
      />
    </div>
  );
}
