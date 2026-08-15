/*!
 * Fluid simulation based on WebGL-Fluid-Simulation.
 * Copyright (c) 2017 Pavel Dobryakov — MIT License.
 * https://github.com/PavelDoGreat/WebGL-Fluid-Simulation
 * Cursor distortion adaptation after Ksenia Kondrashova (public CodePen, MIT).
 * See THIRD-PARTY-NOTICES.txt for the full license text.
 */
"use client";

import { useEffect, useRef } from "react";

/**
 * 마우스를 따라 이미지가 물처럼 일렁이는 유체 왜곡(Liquid Hover) 효과.
 *
 * Pavel Dobryakov의 WebGL 유체 시뮬레이션(MIT)을 기반으로 커서 왜곡 표현을
 * 두 필드 구조로 재구현한 것. 두 필드를 유지한다:
 *  - velocity: 커서 이동량(raw)을 그대로 주입한 속도장(흐름 방향)
 *  - dye(offset): cursorPower 스칼라를 주입하고 속도장을 따라 8배 dt로 빠르게
 *    흘려보내는 왜곡 "크기" 필드
 * 왜곡 = distortionPower × normalize(velocity) × offset (×2회) → 방향은 속도장,
 * 크기는 제한·감쇠하는 offset이 담당해 빠른 마우스에도 폭주하지 않는다.
 * 이미지는 히어로 전체를 채우도록 object-fit: cover 매핑을 쓴다.
 */

type Props = {
  src: string;
  /** 시뮬레이션 격자 해상도 배율 (1~10). 클수록 디테일↑·부하↑ */
  resolution?: number;
  /** 커서가 만드는 소용돌이 크기 (0.1~1) */
  cursorSize?: number;
  /** 속도/왜곡 주입 세기 (0.1~1) */
  cursorPower?: number;
  /** 이미지 왜곡 강도 (0.1~1) */
  distortionPower?: number;
  /** 이미지 확대(크롭) 정도. 1이면 확대 없음, 작을수록 더 확대된다.
   *  저해상도 원본은 1에 가깝게 둬야 덜 뭉개진다. */
  zoom?: number;
  /** "cover" = 화면을 꽉 채우고 크롭 (기본) / "contain" = 사진 전체가 보이게 (여백 생김) */
  fit?: "cover" | "contain";
  /** contain일 때 남는 여백 색 (#rrggbb) */
  padColor?: string;
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

// 커서 위치에 값(속도/offset)을 주입. 원본과 동일하게 pow(2, ...) 커널 사용.
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
    vec3 splat = 0.6 * pow(2.0, -dot(p, p) / u_size) * u_value;
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

// 이류(advection) — 원본과 동일한 수동 이중선형(bilerp) 샘플링.
const ADVECTION_FRAG = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D u_velocity_texture;
  uniform sampler2D u_input_texture;
  uniform vec2 u_texel;
  uniform vec2 u_output_texel;
  uniform float u_dt;
  uniform float u_dissipation;
  vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
    vec2 st = uv / tsize - 0.5;
    vec2 iuv = floor(st);
    vec2 fuv = fract(st);
    vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
    vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
    vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
    vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
    return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
  }
  void main () {
    vec2 coord = vUv - u_dt * bilerp(u_velocity_texture, vUv, u_texel).xy * u_texel;
    vec4 result = bilerp(u_input_texture, coord, u_output_texel);
    gl_FragColor = u_dissipation * result;
  }
`;

// 표시 — 방향(속도장) × 크기(offset)로 이미지 UV를 밀어 왜곡. 원본처럼 변위를 2회 적용.
// 이미지는 히어로 전체를 채우도록 object-fit: cover 매핑.
const DISPLAY_FRAG = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform float u_ratio;       // 컨테이너 가로/세로
  uniform float u_img_ratio;   // 이미지 가로/세로
  uniform float u_disturb;     // distortionPower
  uniform float u_zoom;        // 이미지 확대(크롭) 정도
  uniform float u_contain;     // 0 = cover(꽉 채움·크롭) / 1 = contain(사진 전체 보임)
  uniform vec3 u_pad_color;    // contain일 때 남는 여백 색
  uniform sampler2D u_output_texture; // dye(offset), .r
  uniform sampler2D u_velocity;
  uniform sampler2D u_image;
  vec2 coverUv(vec2 uv) {
    vec2 s = vec2(1.0);
    if (u_contain > 0.5) {
      // contain: 사진이 잘리지 않게 전체를 담는다 (남는 쪽은 여백)
      if (u_ratio > u_img_ratio) s.x = u_ratio / u_img_ratio;
      else s.y = u_img_ratio / u_ratio;
    } else {
      // cover: 화면을 꽉 채우고 넘치는 부분은 잘라낸다
      if (u_ratio > u_img_ratio) s.y = u_img_ratio / u_ratio;
      else s.x = u_ratio / u_img_ratio;
    }
    s *= u_zoom;                           // 살짝 확대해 밋밋한 가장자리를 크롭 (1 = 확대 없음)
    float cy = u_contain > 0.5 ? 0.5 : 0.44; // contain은 정중앙, cover는 초점을 살짝 아래로
    return (uv - 0.5) * s + vec2(0.5, cy);
  }
  void main () {
    float offset = texture2D(u_output_texture, vUv).r;
    vec2 vel = texture2D(u_velocity, vUv).xy;
    vel += 0.001;
    vec2 uv = coverUv(vUv);
    uv -= u_disturb * normalize(vel) * offset;
    uv -= u_disturb * normalize(vel) * offset;
    vec3 col = texture2D(u_image, vec2(uv.x, 1.0 - uv.y)).rgb;
    // contain 모드에서 이미지 밖 영역은 여백 색으로 (가장자리 늘어남 방지)
    if (u_contain > 0.5) {
      vec2 d = step(vec2(0.0), uv) * step(uv, vec2(1.0));
      col = mix(u_pad_color, col, d.x * d.y);
    }
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function LiquidHero({
  src,
  resolution = 4,
  cursorSize = 0.5,
  cursorPower = 1,
  distortionPower = 0.8,
  zoom = 0.82,
  fit = "cover",
  padColor = "#eaf4ff",
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const wrapEl = wrapRef.current;
    if (!canvasEl || !wrapEl) return;
    // non-null 타입으로 못박아 중첩 함수(closure) 안에서도 null 경고가 안 나게 한다
    const canvas: HTMLCanvasElement = canvasEl;
    const wrap: HTMLDivElement = wrapEl;

    const glOrNull = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
    });
    if (!glOrNull) return;
    const gl: WebGLRenderingContext = glOrNull;

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

    // 파라미터 매핑 (원본과 동일)
    const cfg = {
      cursorSize: 0.5 + ((cursorSize - 0.1) * (5 - 0.5)) / (1 - 0.1),
      cursorPower: 5 + ((cursorPower - 0.1) * (50 - 5)) / (1 - 0.1),
      distortion: distortionPower,
    };
    // 캔버스를 살짝 오버스캔해 가장자리 왜곡을 감춘다.
    // 모바일에서는 오버스캔을 거의 없앤다 — 화면 밖 픽셀까지 매 프레임 유체를 도는 비용이 크다.
    const isSmall = () => window.innerWidth < 768;
    const superSample = () => (isSmall() ? 1.04 : 1.2);
    // 폰은 DPR이 3인 기종이 많아 그대로 두면 캔버스가 400만 픽셀에 육박한다.
    // 배경(블러 위에 깔리는 물결)이라 1.5배면 육안 차이가 없고 픽셀 수는 절반 이하가 된다.
    const maxDpr = () => (isSmall() ? 1.5 : 2);

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
    let dye: ReturnType<typeof createDoubleFBO>; // offset 필드(왜곡 크기)
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
      const ss = superSample();
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr());
      canvas.width = Math.max(2, Math.round(w * ss * dpr));
      canvas.height = Math.max(2, Math.round(h * ss * dpr));
      canvas.style.width = `${w * ss}px`;
      canvas.style.height = `${h * ss}px`;
      // 오버스캔한 만큼 좌·상으로 당겨 화면 중앙에 맞춘다.
      // 이 값이 ss와 어긋나면 반대쪽에 빈 띠가 생긴다(JSX의 -10%는 ss=1.2 전용 초기값).
      const off = ((ss - 1) / 2) * 100;
      canvas.style.left = `${-off}%`;
      canvas.style.top = `${-off}%`;
      const aspect = w / h;
      // 원본과 동일: 해상도 배율 1~10 → 격자 128~512
      let base = 128 + ((resolution - 1) * (512 - 128)) / 9;
      // 모바일은 시뮬레이션 격자도 한 단계 낮춘다 (압력 반복이 격자 크기에 비례해 무거워짐)
      if (isSmall()) base = Math.max(128, base * 0.7);
      sim = { w: Math.round(base * aspect), h: Math.round(base) };
    }
    function initFBOs() {
      velocity = createDoubleFBO(sim.w, sim.h);
      dye = createDoubleFBO(sim.w, sim.h);
      divergenceFBO = createFBO(sim.w, sim.h);
      pressureFBO = createDoubleFBO(sim.w, sim.h);
    }

    // 컨테이너 좌표(0..1, 원점 좌하단) — 오버스캔 보정 포함
    function pointerUv() {
      const ss = superSample();
      const ew = wrap.clientWidth * ss;
      const eh = wrap.clientHeight * ss;
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

    // ── 시뮬레이션 루프 (원본 순서 그대로) ─────────────
    function step() {
      const dt = 1 / 60;
      const aspect = wrap.clientWidth / Math.max(1, wrap.clientHeight);

      if (pointer.moved) {
        pointer.moved = false;
        const p = pointerUv();
        gl.useProgram(splat.program);
        gl.uniform1f(splat.uniforms.u_ratio, aspect);
        gl.uniform2f(splat.uniforms.u_point, p.u, p.v);
        gl.uniform1f(splat.uniforms.u_size, cfg.cursorSize * 0.001);

        // ① 속도장 주입 — 커서 이동량(raw)을 그대로 (흐름을 강하게)
        gl.uniform1i(splat.uniforms.u_target, velocity.read().attach(1));
        gl.uniform3f(splat.uniforms.u_value, pointer.dx, -pointer.dy, 0);
        blit(velocity.write());
        velocity.swap();

        // ② dye(offset) 주입 — cursorPower 스칼라 (왜곡 크기)
        gl.uniform1i(splat.uniforms.u_target, dye.read().attach(1));
        gl.uniform3f(splat.uniforms.u_value, cfg.cursorPower * 0.001, 0, 0);
        blit(dye.write());
        dye.swap();
      }

      // divergence
      gl.useProgram(divergence.program);
      gl.uniform2f(divergence.uniforms.u_texel, velocity.texelX, velocity.texelY);
      gl.uniform1i(divergence.uniforms.u_velocity, velocity.read().attach(1));
      blit(divergenceFBO);

      // pressure (Jacobi ×16)
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

      // advection ① 속도장.
      // 감쇠가 1에 가까울수록 흐름이 오래 살아남아 파동이 멀리까지 퍼진다.
      // 0.94 → 0.975 (1초 뒤 잔량 2.5% → 22%)
      gl.useProgram(advection.program);
      gl.uniform2f(advection.uniforms.u_texel, velocity.texelX, velocity.texelY);
      gl.uniform2f(
        advection.uniforms.u_output_texel,
        velocity.texelX,
        velocity.texelY,
      );
      gl.uniform1i(
        advection.uniforms.u_velocity_texture,
        velocity.read().attach(1),
      );
      gl.uniform1i(advection.uniforms.u_input_texture, velocity.read().attach(1));
      gl.uniform1f(advection.uniforms.u_dt, dt);
      gl.uniform1f(advection.uniforms.u_dissipation, 0.975);
      blit(velocity.write());
      velocity.swap();

      // advection ② dye(offset) — 속도장을 따라 흐르는 '왜곡 크기' 필드.
      // dt 배수를 올리면 더 빨리 번지고, 감쇠를 올리면 더 오래 남는다.
      // 5배·0.95 → 6배·0.972
      gl.uniform2f(advection.uniforms.u_output_texel, dye.texelX, dye.texelY);
      gl.uniform1i(
        advection.uniforms.u_velocity_texture,
        velocity.read().attach(1),
      );
      gl.uniform1i(advection.uniforms.u_input_texture, dye.read().attach(2));
      gl.uniform1f(advection.uniforms.u_dt, 6 * dt);
      gl.uniform1f(advection.uniforms.u_dissipation, 0.972);
      blit(dye.write());
      dye.swap();

      // display — 방향(속도장) × 크기(dye)로 이미지 왜곡
      if (imageTex) {
        gl.useProgram(display.program);
        gl.uniform1f(display.uniforms.u_ratio, aspect);
        gl.uniform1f(display.uniforms.u_img_ratio, imgRatio);
        gl.uniform1f(display.uniforms.u_disturb, cfg.distortion);
        gl.uniform1f(display.uniforms.u_zoom, zoom);
        gl.uniform1f(display.uniforms.u_contain, fit === "contain" ? 1 : 0);
        gl.uniform3f(
          display.uniforms.u_pad_color,
          parseInt(padColor.slice(1, 3), 16) / 255,
          parseInt(padColor.slice(3, 5), 16) / 255,
          parseInt(padColor.slice(5, 7), 16) / 255
        );
        gl.uniform1i(display.uniforms.u_velocity, velocity.read().attach(2));
        gl.uniform1i(
          display.uniforms.u_output_texture,
          dye.read().attach(1),
        );
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
  }, [src, resolution, cursorSize, cursorPower, distortionPower, zoom, fit, padColor]);

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
          // WebGL cover 매핑과 초점을 맞춰 세로 화면에서 밋밋한 윗부분을 크롭
          objectPosition: "50% 62%",
          transform: "scale(1.12)",
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
