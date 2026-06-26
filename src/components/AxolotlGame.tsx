"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "uplp-axolotl-game";
const XP_PER_LEVEL = 10;

type GameState = {
  level: number;
  xp: number;
  food: number;
  totalFeeds: number;
  solved: number;
};

const DEFAULT_STATE: GameState = {
  level: 1,
  xp: 0,
  food: 1, // 시작할 때 먹이 1개 지급
  totalFeeds: 0,
  solved: 0,
};

// 레벨에 따라 우파루파 색/이름이 달라집니다.
const COLOR_STAGES = [
  { name: "아기 우파루파", body: "#fbcfe8", frill: "#f9a8d4" },
  { name: "꼬마 우파루파", body: "#f9a8d4", frill: "#f472b6" },
  { name: "수영 새내기", body: "#a5b4fc", frill: "#818cf8" },
  { name: "정기수영러", body: "#7dd3fc", frill: "#38bdf8" },
  { name: "마스터즈 우파루파", body: "#5eead4", frill: "#2dd4bf" },
];

function stageForLevel(level: number) {
  return COLOR_STAGES[Math.min(level - 1, COLOR_STAGES.length - 1)];
}

type Quiz = {
  q: string;
  options: string[];
  answer: number;
  explain: string;
};

// 수영·동아리 테마 퀴즈 풀
const QUIZZES: Quiz[] = [
  {
    q: "우파루파(아홀로틀)는 어떤 종류의 동물일까요?",
    options: ["양서류", "어류", "파충류", "포유류"],
    answer: 0,
    explain: "우파루파는 도롱뇽의 일종인 양서류예요.",
  },
  {
    q: "다음 중 수영 4대 영법이 아닌 것은?",
    options: ["자유형", "배영", "평영", "잠수영"],
    answer: 3,
    explain: "4대 영법은 자유형·배영·평영·접영입니다.",
  },
  {
    q: "'접영'을 영어로 하면?",
    options: ["Backstroke", "Butterfly", "Freestyle", "Breaststroke"],
    answer: 1,
    explain: "접영은 Butterfly, 나비처럼 양팔을 젓는 영법이에요.",
  },
  {
    q: "배영은 어떤 자세로 헤엄치는 영법일까요?",
    options: ["엎드려서", "누워서", "옆으로", "서서"],
    answer: 1,
    explain: "배영은 등을 대고 누운 자세로 헤엄칩니다.",
  },
  {
    q: "자유형의 또 다른 이름은?",
    options: ["크롤", "도그패들", "사이드", "트러젠"],
    answer: 0,
    explain: "자유형은 흔히 크롤(crawl)이라고도 불러요.",
  },
  {
    q: "수영을 시작하기 전 꼭 해야 하는 것은?",
    options: ["전력 질주", "준비운동(스트레칭)", "식사", "낮잠"],
    answer: 1,
    explain: "부상 예방을 위해 준비운동은 필수입니다.",
  },
  {
    q: "물에 잘 뜨려면 몸을 어떻게 해야 할까요?",
    options: ["힘을 꽉 준다", "힘을 뺀다", "숨을 참는다", "발을 멈춘다"],
    answer: 1,
    explain: "몸에 힘을 빼야 부력으로 더 잘 뜰 수 있어요.",
  },
  {
    q: "UPLP 동아리의 마스코트는?",
    options: ["돌고래", "우파루파", "거북이", "오리"],
    answer: 1,
    explain: "바로 이 친구, 우파루파예요! 🦎",
  },
];

function randomQuiz(): Quiz {
  return QUIZZES[Math.floor(Math.random() * QUIZZES.length)];
}

export default function AxolotlGame() {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [wiggle, setWiggle] = useState(false);
  const [message, setMessage] = useState("먹이를 줘서 우파루파를 키워보세요!");
  const wiggleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 퀴즈 모달 상태
  const [quizOpen, setQuizOpen] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [picked, setPicked] = useState<number | null>(null);

  // 최초 로드 시 저장된 진행도 복원
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...DEFAULT_STATE, ...JSON.parse(raw) });
    } catch {
      // 저장값이 깨졌으면 기본값 사용
    }
    setLoaded(true);
  }, []);

  // 변경될 때마다 저장
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, loaded]);

  function feed() {
    if (state.food <= 0) {
      setMessage("먹이가 없어요! 퀴즈를 풀어 먹이를 모아보세요 🦐");
      return;
    }

    setWiggle(true);
    if (wiggleTimer.current) clearTimeout(wiggleTimer.current);
    wiggleTimer.current = setTimeout(() => setWiggle(false), 400);

    setState((prev) => {
      let xp = prev.xp + 1;
      let level = prev.level;
      let leveledUp = false;
      if (xp >= XP_PER_LEVEL) {
        xp = 0;
        level += 1;
        leveledUp = true;
      }
      setMessage(
        leveledUp
          ? `🎉 레벨 ${level} 달성! ${stageForLevel(level).name}(으)로 성장했어요!`
          : pickReaction()
      );
      return {
        ...prev,
        xp,
        level,
        food: prev.food - 1,
        totalFeeds: prev.totalFeeds + 1,
      };
    });
  }

  function openQuiz() {
    setQuiz(randomQuiz());
    setPicked(null);
    setQuizOpen(true);
  }

  function answerQuiz(idx: number) {
    if (picked !== null || !quiz) return;
    setPicked(idx);
    const correct = idx === quiz.answer;
    if (correct) {
      setState((prev) => ({ ...prev, food: prev.food + 1, solved: prev.solved + 1 }));
    }
  }

  function reset() {
    setState(DEFAULT_STATE);
    setMessage("처음부터 다시 키워요!");
  }

  const stage = stageForLevel(state.level);
  const progress = (state.xp / XP_PER_LEVEL) * 100;

  return (
    <section className="bg-gradient-to-b from-sky-50 to-cyan-100 px-6 py-20">
      <div className="mx-auto max-w-md text-center">
        <span className="rounded-full bg-sky-700/10 px-4 py-1 text-sm font-medium text-sky-700">
          MINI GAME
        </span>
        <h2 className="mt-3 text-2xl font-bold text-sky-800">우파루파 키우기</h2>
        <p className="mt-2 text-sm text-slate-500">
          퀴즈를 풀어 먹이를 모으고, 마스코트 우파루파를 키워주세요 🏊
        </p>

        {/* 윈도우 창 */}
        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-200">
          {/* 타이틀바 */}
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-2 text-xs font-medium text-slate-500">
              upalupa.exe — 우파루파 키우기
            </span>
          </div>

          {/* 창 본문 */}
          <div className="p-6">
            {/* 수조 */}
            <div className="relative mx-auto flex h-56 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-cyan-100 to-sky-300">
              <div className="absolute left-6 top-6 h-3 w-3 rounded-full bg-white/50" />
              <div className="absolute right-10 top-12 h-2 w-2 rounded-full bg-white/40" />
              <div className="absolute left-12 bottom-8 h-2.5 w-2.5 rounded-full bg-white/40" />

              {/* 보유 먹이 표시 */}
              <div className="absolute right-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-sky-700 shadow">
                🦐 먹이 {state.food}
              </div>

              <button
                type="button"
                onClick={feed}
                aria-label="우파루파에게 먹이주기"
                className={`transition-transform duration-300 ${
                  wiggle ? "scale-110 -rotate-6" : "hover:scale-105"
                }`}
              >
                <Axolotl body={stage.body} frill={stage.frill} />
              </button>
            </div>

            {/* 레벨 / 단계 */}
            <div className="mt-6 flex items-center justify-between text-sm">
              <span className="font-semibold text-sky-700">Lv. {state.level}</span>
              <span className="text-slate-500">{stage.name}</span>
            </div>

            {/* 경험치 바 */}
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-sky-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-right text-xs text-slate-400">
              {state.xp} / {XP_PER_LEVEL} XP
            </p>

            {/* 메시지 */}
            <p className="mt-4 min-h-[2.5rem] text-sm font-medium text-slate-600">
              {message}
            </p>

            {/* 버튼 */}
            <div className="mt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={feed}
                disabled={state.food <= 0}
                className="rounded-full bg-sky-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                🦐 먹이주기
              </button>
              <button
                type="button"
                onClick={openQuiz}
                className="rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-400"
              >
                ❓ 퀴즈 풀고 먹이 얻기
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>먹인 횟수: {state.totalFeeds}회</span>
              <span>맞힌 퀴즈: {state.solved}개</span>
              <button
                type="button"
                onClick={reset}
                className="text-slate-400 underline-offset-2 hover:underline"
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 퀴즈 모달 */}
      {quizOpen && quiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-2.5">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs font-medium text-slate-500">quiz.exe</span>
            </div>

            <div className="p-6 text-left">
              <p className="text-sm font-semibold text-slate-800">{quiz.q}</p>
              <div className="mt-4 space-y-2">
                {quiz.options.map((opt, idx) => {
                  const isAnswer = idx === quiz.answer;
                  const isPicked = idx === picked;
                  let cls =
                    "w-full rounded-lg border px-4 py-2.5 text-left text-sm transition ";
                  if (picked === null) {
                    cls += "border-slate-200 hover:border-sky-400 hover:bg-sky-50";
                  } else if (isAnswer) {
                    cls += "border-green-400 bg-green-50 text-green-700 font-semibold";
                  } else if (isPicked) {
                    cls += "border-red-300 bg-red-50 text-red-600";
                  } else {
                    cls += "border-slate-200 text-slate-400";
                  }
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => answerQuiz(idx)}
                      disabled={picked !== null}
                      className={cls}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {picked !== null && (
                <div className="mt-4 rounded-lg bg-sky-50 p-3 text-sm text-slate-600">
                  {picked === quiz.answer ? (
                    <p className="font-semibold text-green-600">정답! 먹이 1개 획득 🦐</p>
                  ) : (
                    <p className="font-semibold text-red-500">아쉬워요! 다음엔 맞힐 수 있어요.</p>
                  )}
                  <p className="mt-1">{quiz.explain}</p>
                </div>
              )}

              <div className="mt-5 flex justify-end gap-2">
                {picked !== null && (
                  <button
                    type="button"
                    onClick={openQuiz}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    다음 문제
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setQuizOpen(false)}
                  className="rounded-full bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const REACTIONS = [
  "냠냠! 맛있어요 😋",
  "고마워요! 🫧",
  "한 입 더 주세요!",
  "쑥쑥 자라는 중 💪",
  "퐁당퐁당 🌊",
];

function pickReaction() {
  return REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
}

function Axolotl({ body, frill }: { body: string; frill: string }) {
  return (
    <svg width="160" height="140" viewBox="0 0 160 140" fill="none">
      {/* 아가미 frills - 왼쪽 */}
      <g fill={frill}>
        <path d="M52 50 Q30 38 20 44 Q34 48 40 58 Z" />
        <path d="M50 62 Q26 58 16 66 Q32 68 42 74 Z" />
        <path d="M52 74 Q30 78 22 90 Q38 84 46 84 Z" />
      </g>
      {/* 아가미 frills - 오른쪽 */}
      <g fill={frill}>
        <path d="M108 50 Q130 38 140 44 Q126 48 120 58 Z" />
        <path d="M110 62 Q134 58 144 66 Q128 68 118 74 Z" />
        <path d="M108 74 Q130 78 138 90 Q122 84 114 84 Z" />
      </g>
      {/* 꼬리 */}
      <path d="M80 110 Q66 130 80 134 Q94 130 80 110 Z" fill={body} />
      {/* 몸통 */}
      <ellipse cx="80" cy="78" rx="34" ry="40" fill={body} />
      {/* 머리 */}
      <circle cx="80" cy="56" r="32" fill={body} />
      {/* 볼터치 */}
      <circle cx="62" cy="62" r="6" fill={frill} opacity="0.6" />
      <circle cx="98" cy="62" r="6" fill={frill} opacity="0.6" />
      {/* 눈 */}
      <circle cx="70" cy="52" r="4" fill="#1f2937" />
      <circle cx="90" cy="52" r="4" fill="#1f2937" />
      <circle cx="71.5" cy="50.5" r="1.3" fill="#fff" />
      <circle cx="91.5" cy="50.5" r="1.3" fill="#fff" />
      {/* 입 */}
      <path d="M75 64 Q80 69 85 64" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
