"use client";

import { useEffect, useRef } from "react";

/**
 * 화면 전체를 덮는 커서 추종 "물" 오버레이.
 *
 * 히어로(LiquidHero)와 동일한 GPU 유체 시뮬(속도장 + dye 이류)을 전체 뷰포트에
 * 깔고, 이미지 왜곡 대신 dye(잉크)를 반투명 물빛 레이어로 렌더링한다. 커서를
 * 따라 물결·잉크가 번지며 서서히 잦아든다. 뒤 콘텐츠를 실제로 굴절시키진 못하지만
 * (그건 페이지 캡처가 필요) 물 위를 지나가는 듯한 느낌을 준다.
 *
 * pointer-events: none 이라 클릭은 그대로 통과하고, 마우스가 없는 터치 기기에선
 * 성능을 위해 실행하지 않는다.
 */

type Props = {
  cursorSize?: number;
  cursorPower?: number;
  /** 오버레이 최대 불투명도 (콘텐츠 가독성 위해 낮게) */
  maxAlpha?: number;
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

// dye(잉크)를 반투명 물빛으로 렌더링. 배경 이미지가 없으므로 색+알파만 출력.
const DISPLAY_FRAG = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D u_dye;
  uniform sampler2D u_velocity;
  uniform vec2 u_texel;
  uniform float u_max_alpha;
  void main () {
    float d = texture2D(u_dye, vUv).r;
    // dye 기울기 → 물결 가장자리 은은한 테두리(약하게)
    float dl = texture2D(u_dye, vUv - vec2(u_texel.x, 0.0)).r;
    float dr = texture2D(u_dye, vUv + vec2(u_texel.x, 0.0)).r;
    float dt = texture2D(u_dye, vUv + vec2(0.0, u_texel.y)).r;
    float db = texture2D(u_dye, vUv - vec2(0.0, u_texel.y)).r;
    float rim = length(vec2(dr - dl, dt - db));

    float amt = clamp(d * 1.4, 0.0, 1.0);
    vec3 deep = vec3(0.10, 0.45, 0.68);   // 진한 물빛
    vec3 mid = vec3(0.35, 0.72, 0.92);    // 밝은 물빛
    vec3 col = mix(deep, mid, amt);
    col += vec3(0.8, 0.95, 1.0) * rim * 5.0; // 물빛 테두리(흰빛 폭발 제거)

    float a = clamp(d * 2.2, 0.0, u_max_alpha);
    gl_FragColor = vec4(col, a);
  }
`;

export default function CursorLiquid({
  cursorSize = 0.5,
  cursorPower = 1,
  maxAlpha = 0.2,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // 마우스가 없는 터치 기기에서는 실행하지 않는다(성능)
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvas: HTMLCanvasElement = canvasEl;

    const glOrNull = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
    });
    if (!glOrNull) return;
    const gl: WebGLRenderingContext = glOrNull;

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

    const cfg = {
      cursorSize: 0.5 + ((cursorSize - 0.1) * (5 - 0.5)) / (1 - 0.1),
      cursorPower: 5 + ((cursorPower - 0.1) * (50 - 5)) / (1 - 0.1),
    };

    const pointer = { x: 0, y: 0, dx: 0, dy: 0, moved: false };
    let sim = { w: 0, h: 0 };
    let idle = 999; // 마지막 움직임 이후 프레임 수(성능용)

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

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      gl.STATIC_DRAW,
    );
    const idxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
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
    let dye: ReturnType<typeof createDoubleFBO>;
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
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(2, Math.round(w * dpr));
      canvas.height = Math.max(2, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const aspect = w / Math.max(1, h);
      const base = 168; // 전체 화면 격자(성능/디테일 절충)
      sim = { w: Math.round(base * aspect), h: base };
    }
    function initFBOs() {
      velocity = createDoubleFBO(sim.w, sim.h);
      dye = createDoubleFBO(sim.w, sim.h);
      divergenceFBO = createFBO(sim.w, sim.h);
      pressureFBO = createDoubleFBO(sim.w, sim.h);
    }

    const onMove = (e: MouseEvent) => {
      pointer.dx = 6 * (e.clientX - pointer.x);
      pointer.dy = 6 * (e.clientY - pointer.y);
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.moved = true;
      idle = 0;
    };
    const onResize = () => {
      resize();
      initFBOs();
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", onResize);

    resize();
    initFBOs();

    let raf = 0;
    function step() {
      const dt = 1 / 60;
      idle++;

      if (pointer.moved) {
        pointer.moved = false;
        const u = pointer.x / window.innerWidth;
        const v = 1 - pointer.y / window.innerHeight;
        const aspect = window.innerWidth / Math.max(1, window.innerHeight);
        gl.useProgram(splat.program);
        gl.uniform1f(splat.uniforms.u_ratio, aspect);
        gl.uniform2f(splat.uniforms.u_point, u, v);
        gl.uniform1f(splat.uniforms.u_size, cfg.cursorSize * 0.001);

        gl.uniform1i(splat.uniforms.u_target, velocity.read().attach(1));
        gl.uniform3f(splat.uniforms.u_value, pointer.dx * 0.4, -pointer.dy * 0.4, 0);
        blit(velocity.write());
        velocity.swap();

        gl.uniform1i(splat.uniforms.u_target, dye.read().attach(1));
        gl.uniform3f(splat.uniforms.u_value, cfg.cursorPower * 0.0004, 0, 0);
        blit(dye.write());
        dye.swap();
      }

      // 오래 idle이면 시뮬은 건너뛰고 화면만 비운다(배터리 절약)
      if (idle < 140) {
        gl.useProgram(divergence.program);
        gl.uniform2f(
          divergence.uniforms.u_texel,
          velocity.texelX,
          velocity.texelY,
        );
        gl.uniform1i(divergence.uniforms.u_velocity, velocity.read().attach(1));
        blit(divergenceFBO);

        gl.useProgram(pressure.program);
        gl.uniform2f(
          pressure.uniforms.u_texel,
          velocity.texelX,
          velocity.texelY,
        );
        gl.uniform1i(pressure.uniforms.u_divergence, divergenceFBO.attach(1));
        for (let i = 0; i < 16; i++) {
          gl.uniform1i(
            pressure.uniforms.u_pressure,
            pressureFBO.read().attach(2),
          );
          blit(pressureFBO.write());
          pressureFBO.swap();
        }

        gl.useProgram(gradient.program);
        gl.uniform2f(
          gradient.uniforms.u_texel,
          velocity.texelX,
          velocity.texelY,
        );
        gl.uniform1i(
          gradient.uniforms.u_pressure,
          pressureFBO.read().attach(1),
        );
        gl.uniform1i(gradient.uniforms.u_velocity, velocity.read().attach(2));
        blit(velocity.write());
        velocity.swap();

        gl.useProgram(advection.program);
        gl.uniform2f(
          advection.uniforms.u_texel,
          velocity.texelX,
          velocity.texelY,
        );
        gl.uniform2f(
          advection.uniforms.u_output_texel,
          velocity.texelX,
          velocity.texelY,
        );
        gl.uniform1i(
          advection.uniforms.u_velocity_texture,
          velocity.read().attach(1),
        );
        gl.uniform1i(
          advection.uniforms.u_input_texture,
          velocity.read().attach(1),
        );
        gl.uniform1f(advection.uniforms.u_dt, dt);
        gl.uniform1f(advection.uniforms.u_dissipation, 0.93);
        blit(velocity.write());
        velocity.swap();

        gl.uniform2f(
          advection.uniforms.u_output_texel,
          dye.texelX,
          dye.texelY,
        );
        gl.uniform1i(
          advection.uniforms.u_velocity_texture,
          velocity.read().attach(1),
        );
        gl.uniform1i(advection.uniforms.u_input_texture, dye.read().attach(2));
        gl.uniform1f(advection.uniforms.u_dt, 3 * dt);
        gl.uniform1f(advection.uniforms.u_dissipation, 0.94);
        blit(dye.write());
        dye.swap();
      }

      // display — 물빛 오버레이
      gl.useProgram(display.program);
      gl.uniform2f(display.uniforms.u_texel, dye.texelX, dye.texelY);
      gl.uniform1f(display.uniforms.u_max_alpha, maxAlpha);
      gl.uniform1i(display.uniforms.u_dye, dye.read().attach(1));
      gl.uniform1i(display.uniforms.u_velocity, velocity.read().attach(2));
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, [cursorSize, cursorPower, maxAlpha]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40"
    />
  );
}
