"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Html, OrbitControls, useGLTF } from "@react-three/drei";

const MODEL_URL = "/uplp_3d.glb";
const STORAGE_KEY = "uplp-axolotl-3d";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// 먹이를 받은 뒤 이만큼의 대화 동안은 또 받을 수 없음 (난이도)
const FOOD_COOLDOWN = 3;
// 레벨업에 필요한 먹이 수: 레벨이 오를수록 더 많이 필요
function xpNeeded(level: number) {
  return 6 + level * 4; // Lv1→10, Lv2→14, Lv3→18 …
}

useGLTF.preload(MODEL_URL);

type GameState = { level: number; xp: number; fed: number; food: number };
const DEFAULT_STATE: GameState = { level: 1, xp: 0, fed: 0, food: 0 };

type ChatMessage = { role: "user" | "axolotl"; text: string };

// 3D 모델: 크기 자동 정규화 + 제자리 둥실 + 먹이 먹을 때 통통 튀는 반응
function Model({ punch }: { punch: React.RefObject<number> }) {
  const { scene } = useGLTF(MODEL_URL);
  const group = useRef<THREE.Group>(null);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return { scale: 2.2 / maxDim, center };
  }, [cloned]);

  useFrame((stateObj, delta) => {
    if (!group.current) return;
    const t = stateObj.clock.elapsedTime;

    // 제자리에서 물결에 둥실거리는 정도만 (스스로 회전하지 않음)
    group.current.position.y = -0.4 + Math.sin(t * 1.5) * 0.1;
    group.current.rotation.z = Math.sin(t * 1.2) * 0.05;

    if (punch.current > 0) {
      punch.current = Math.max(0, punch.current - delta * 3);
    }
    const s = fit.scale * (1 + 0.18 * punch.current);
    group.current.scale.setScalar(s);
  });

  return (
    <group ref={group} position={[0, -0.4, 0]}>
      <primitive
        object={cloned}
        position={[-fit.center.x, -fit.center.y, -fit.center.z]}
      />
    </group>
  );
}

// 수중 분위기: 모래 바닥 + 위에서 내려오는 빛 + 떠오르는 거품
function UnderwaterScene() {
  const count = 20;
  const bubbles = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 7,
        z: (Math.random() - 0.5) * 4,
        y: Math.random() * 5 - 1.5,
        speed: 0.3 + Math.random() * 0.6,
        r: 0.03 + Math.random() * 0.05,
      })),
    []
  );
  const meshes = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_, delta) => {
    bubbles.forEach((b, i) => {
      const m = meshes.current[i];
      if (!m) return;
      b.y += delta * b.speed;
      if (b.y > 4) b.y = -1.6;
      m.position.set(b.x, b.y, b.z);
    });
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#6f97a8" roughness={1} />
      </mesh>
      <spotLight
        position={[0, 6, 1]}
        angle={0.5}
        penumbra={1}
        intensity={1.6}
        color="#bfe9ff"
        castShadow
      />
      {bubbles.map((b, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshes.current[i] = el;
          }}
        >
          <sphereGeometry args={[b.r, 8, 8]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// 위에서 떨어지는 먹이
function Food({ startX, onEaten }: { startX: number; onEaten: () => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const y = useRef(3.2);
  const done = useRef(false);

  useFrame((_, delta) => {
    if (!ref.current || done.current) return;
    y.current -= delta * 4.5;
    ref.current.position.y = y.current;
    ref.current.rotation.x += delta * 6;
    ref.current.rotation.z += delta * 4;
    if (y.current <= -0.2) {
      done.current = true;
      onEaten();
    }
  });

  return (
    <mesh ref={ref} position={[startX, 3.2, 0]} castShadow>
      <sphereGeometry args={[0.16, 16, 16]} />
      <meshStandardMaterial color="#fb923c" roughness={0.4} />
    </mesh>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-sky-700 shadow">
        우피 불러오는 중… 🫧
      </div>
    </Html>
  );
}

export default function Axolotl3DGame() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [foods, setFoods] = useState<number[]>([]);
  const [message, setMessage] = useState("우피와 대화해서 먹이를 얻어보세요!");

  // 채팅 상태
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "axolotl", text: "안녕! 나는 우피야 🏊 오늘 수영 얘기 들려줘!" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const punch = useRef(0);
  const idRef = useRef(0);
  const foodCooldown = useRef(0); // 먹이 획득 쿨다운 카운터

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...DEFAULT_STATE, ...JSON.parse(raw) });
    } catch {
      // 무시
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, loaded]);

  useEffect(() => {
    // 페이지 전체가 아니라 채팅창 내부만 아래로 스크롤 (첫 렌더에서 페이지가 끌려가지 않게)
    const box = chatBoxRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages, sending]);

  // 대화로 먹이 벌기 → 밥 던지기로 소비
  function throwFood() {
    if (state.food <= 0) {
      setMessage("먹이가 없어요! 우피와 대화해서 먹이를 받아보세요 💬");
      return;
    }
    setState((prev) => ({ ...prev, food: prev.food - 1 }));
    setFoods((f) => [...f, idRef.current++]);
  }

  function eat(id: number) {
    setFoods((f) => f.filter((x) => x !== id));
    punch.current = 1;
    setState((prev) => {
      let xp = prev.xp + 1;
      let level = prev.level;
      let leveledUp = false;
      if (xp >= xpNeeded(level)) {
        xp = 0;
        level += 1;
        leveledUp = true;
      }
      setMessage(leveledUp ? `🎉 레벨 ${level} 달성! 무럭무럭 자라요!` : "냠냠! 😋");
      return { ...prev, level, xp, fed: prev.fed + 1 };
    });
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    const history = messages.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text,
    }));

    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setSending(true);

    // 매 대화마다 쿨다운 감소
    if (foodCooldown.current > 0) foodCooldown.current -= 1;

    try {
      const res = await fetch(`${API_URL}/api/upalupa/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      const json = await res.json();

      if (json.result === "ok" && json.data) {
        const { reply, mood, giveFood } = json.data as {
          reply: string;
          mood?: string;
          giveFood?: boolean;
        };
        setMessages((m) => [...m, { role: "axolotl", text: reply }]);
        if (giveFood && foodCooldown.current <= 0) {
          // 쿨다운이 없을 때만 실제로 먹이 지급
          setState((prev) => ({ ...prev, food: prev.food + 1 }));
          punch.current = 1;
          foodCooldown.current = FOOD_COOLDOWN;
          setMessage("우피가 마음을 열고 먹이를 줬어요! 🦐 (+1)");
        } else if (giveFood) {
          // 기뻐하지만 아직 배불러서 안 줌 → 난이도 요소
          setMessage("우피가 좋아하지만 아직 배가 불러요 🫧 조금 더 친해져요!");
        } else if (mood === "grumpy") {
          setMessage("우피가 시큰둥해요… 수영 얘기를 해볼까요? 🌊");
        }
      } else {
        setMessages((m) => [
          ...m,
          { role: "axolotl", text: "(음... 지금은 대답하기 어려워요)" },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "axolotl",
          text: "(지금은 연결이 안 돼요. 백엔드 서버를 켜주세요! 🔌)",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  const needed = xpNeeded(state.level);
  const progress = (state.xp / needed) * 100;

  return (
    <section className="bg-gradient-to-b from-cyan-100 to-sky-200 px-6 py-20">
      <div className="mx-auto max-w-lg text-center">
        <span className="rounded-full bg-sky-700/10 px-4 py-1 text-sm font-medium text-sky-700">
          3D MINI GAME
        </span>
        <h2 className="mt-3 text-2xl font-bold text-sky-800">우피와 대화하기 (3D)</h2>
        <p className="mt-2 text-sm text-slate-500">
          수영 얘기로 우피를 기쁘게 하면 먹이를 받아요 🏊
        </p>

        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-200">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-2 text-xs font-medium text-slate-500">upalupa_3d.exe</span>
          </div>

          <div className="p-6">
            {/* 3D 뷰 */}
            <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-gradient-to-b from-sky-700 to-sky-900">
              {mounted ? (
                <Canvas camera={{ position: [0, 0.3, 3.4], fov: 45 }} shadows>
                  <color attach="background" args={["#0e567a"]} />
                  <fog attach="fog" args={["#0e567a", 4, 13]} />
                  <ambientLight intensity={0.5} color="#9fd6f0" />
                  <directionalLight position={[2, 5, 2]} intensity={0.8} color="#cdeeff" />
                  <Suspense fallback={<LoadingFallback />}>
                    <Environment preset="dawn" />
                    <UnderwaterScene />
                    <Model punch={punch} />
                    {foods.map((id) => (
                      <Food
                        key={id}
                        startX={(Math.random() - 0.5) * 1.2}
                        onEaten={() => eat(id)}
                      />
                    ))}
                  </Suspense>
                  <OrbitControls
                    enablePan={false}
                    minDistance={2.2}
                    maxDistance={7}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.7}
                  />
                </Canvas>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  3D 뷰 준비 중…
                </div>
              )}

              {/* 보유 먹이 */}
              <div className="absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-sky-700 shadow">
                🦐 먹이 {state.food}
              </div>
            </div>

            {/* 레벨 / 경험치 */}
            <div className="mt-6 flex items-center justify-between text-sm">
              <span className="font-semibold text-sky-700">Lv. {state.level}</span>
              <span className="text-slate-500">밥 준 횟수 {state.fed}회</span>
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-sky-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-right text-xs text-slate-400">
              {state.xp} / {needed} XP
            </p>

            <p className="mt-3 min-h-[1.5rem] text-sm font-medium text-slate-600">
              {message}
            </p>

            {/* 채팅 로그 */}
            <div
              ref={chatBoxRef}
              className="mt-3 h-40 space-y-2 overflow-y-auto rounded-xl bg-sky-50 p-3 text-left"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <span
                    className={`inline-block max-w-[80%] rounded-2xl px-3 py-1.5 text-sm ${
                      m.role === "user"
                        ? "bg-sky-600 text-white"
                        : "bg-white text-slate-700 ring-1 ring-sky-100"
                    }`}
                  >
                    {m.text}
                  </span>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <span className="inline-block rounded-2xl bg-white px-3 py-1.5 text-sm text-slate-400 ring-1 ring-sky-100">
                    우피가 생각 중… 🫧
                  </span>
                </div>
              )}
            </div>

            {/* 입력창 */}
            <div className="mt-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                placeholder="우피에게 말을 걸어보세요…"
                disabled={sending}
                className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm focus:border-sky-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={sending}
                className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:bg-slate-300"
              >
                전송
              </button>
            </div>

            {/* 밥 던지기 (먹이 보유 시) */}
            <button
              type="button"
              onClick={throwFood}
              disabled={state.food <= 0}
              className="mt-3 w-full rounded-full bg-sky-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              🍙 밥 던지기 {state.food > 0 ? `(${state.food})` : ""}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
