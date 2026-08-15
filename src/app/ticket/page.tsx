"use client";

import { useCallback, useEffect, useState } from "react";
import GlassCard from "@/components/GlassCard";
import WheelTimePicker from "@/components/WheelTimePicker";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type Division = "training" | "progress";
type Counts = { cap: number; assigned: number; reserve: number; pendingLate: number };
type MyState = {
  division: Division;
  state: "assigned" | "reserve" | "pending_late";
  rank: number;
} | null;
type SwimSessionT = {
  id: number;
  meetDate: string;
  meetTime: string;
  location: string;
  capTraining: number;
  capProgress: number;
  lateQueueEnabled: boolean;
  applyStartAt: string;
  applyEndAt: string;
  status: "upcoming" | "open" | "closed";
  counts: { training: Counts; progress: Counts };
  my: MyState;
};

type RosterEntry = { rank: number; name: string };
type RosterDiv = {
  cap: number;
  assigned: RosterEntry[];
  reserve: RosterEntry[];
  pendingLate: RosterEntry[];
};
type RosterT = {
  sessionId: number;
  divisions: { training: RosterDiv; progress: RosterDiv };
};

const DIVISION_LABEL: Record<Division, string> = {
  training: "훈련부",
  progress: "진도부",
};

// 남은 시간을 "1일 02:03:04" / "02:03" / "5초" 형태로
function countdown(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  if (d > 0) return `${d}일 ${p(h)}:${p(m)}:${p(s)}`;
  if (h > 0) return `${p(h)}:${p(m)}:${p(s)}`;
  if (m > 0) return `${p(m)}:${p(s)}`;
  return `${s}초`;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function myStateText(my: NonNullable<MyState>) {
  const label = DIVISION_LABEL[my.division];
  if (my.state === "assigned") return `${label} ${my.rank}번으로 배정되었습니다`;
  if (my.state === "reserve") return `${label} 예비 ${my.rank}번입니다`;
  return `${label} 후순위 대기 ${my.rank}번 (병합 대기중)`;
}

const inputClass =
  "w-full rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white";

// 유리(글래스) 느낌 버튼 — 반투명 배경 + blur + 안쪽 하이라이트 테두리
const GLASS_BASE =
  "rounded-full px-4 py-2 text-sm font-semibold backdrop-blur-md transition ring-1 ring-inset shadow-sm hover:-translate-y-px active:translate-y-0 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.6)]";
const GLASS_TONE: Record<string, string> = {
  sky: "bg-sky-500/25 text-sky-900 ring-sky-300/60 hover:bg-sky-500/35",
  indigo: "bg-indigo-500/25 text-indigo-900 ring-indigo-300/60 hover:bg-indigo-500/35",
  amber: "bg-amber-400/30 text-amber-900 ring-amber-300/70 hover:bg-amber-400/45",
  slate: "bg-slate-500/20 text-slate-800 ring-slate-300/60 hover:bg-slate-500/30",
  red: "bg-red-400/20 text-red-700 ring-red-300/60 hover:bg-red-400/30",
  emerald: "bg-emerald-500/25 text-emerald-900 ring-emerald-300/60 hover:bg-emerald-500/35",
};
const glassBtn = (tone: keyof typeof GLASS_TONE = "sky") =>
  `${GLASS_BASE} ${GLASS_TONE[tone]}`;

export default function SwimPage() {
  const [sessions, setSessions] = useState<SwimSessionT[]>([]);
  const [me, setMe] = useState<{
    role?: string;
    membership?: string;
    approvalStatus?: string;
  } | null>(null);
  const [cardMsg, setCardMsg] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);
  // 명단 대시보드 (모두 공개 — 이름만)
  const [rosters, setRosters] = useState<Record<number, RosterT>>({});
  const [rosterOpen, setRosterOpen] = useState<Record<number, boolean>>({});
  // 오픈까지 남은 시간 표시용 — 1초마다 흐르는 시계
  const [nowTs, setNowTs] = useState(() => Date.now());
  // 신청 중 인원 조정 (세션 id → {훈련부, 진도부})
  const [capEdit, setCapEdit] = useState<
    Record<number, { training: string; progress: string }>
  >({});

  // ── 정기수영 열기/수정 폼 (관리자) ──
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null); // null이면 신규 등록
  const [formErr, setFormErr] = useState("");
  const [meetDate, setMeetDate] = useState("");
  const [meetTime, setMeetTime] = useState("19:00");
  const [location, setLocation] = useState("");
  const [capTraining, setCapTraining] = useState("10");
  const [capProgress, setCapProgress] = useState("10");
  const [lateQueueEnabled, setLateQueueEnabled] = useState(false);
  // 신청 시작/마감은 날짜 + 휠 시각으로 분리 입력
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("18:00");

  // 임원진(executive)·관리자(admin) 둘 다 운영 도구를 쓴다. 서버도 같은 기준으로 검사한다.
  const isAdmin = me?.role === "executive" || me?.role === "admin";
  // 신청은 '승인된 재학생'만. 서버가 403으로 막지만 버튼도 숨겨 헛클릭을 줄인다.
  const isApproved = me?.approvalStatus === "approved";
  const canJoin = me?.membership === "student" && isApproved;

  const fetchSessions = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/api/swim/sessions`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });
      if (res.ok) setSessions(await res.json());
    } catch {
      // 백엔드 미기동 등 — 목록 갱신만 건너뜀
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      setMe(raw ? JSON.parse(raw) : null);
    } catch {
      setMe(null);
    }
    fetchSessions();
    // 주기 갱신 (다른 사람의 신청/취소 반영)
    const t = setInterval(fetchSessions, 15000);
    return () => clearInterval(t);
  }, [fetchSessions]);

  // 카운트다운용 시계 (1초)
  useEffect(() => {
    const t = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // 오픈 예정 세션은 '시작 시각 정각'에 맞춰 즉시 갱신 → 새로고침 없이 신청 버튼이 열린다
  useEffect(() => {
    const timers = sessions
      .filter((s) => s.status === "upcoming")
      .map((s) => {
        const delay = new Date(s.applyStartAt).getTime() - Date.now();
        // setTimeout 상한(약 24.8일)을 넘는 먼 미래는 주기 갱신에 맡긴다
        if (delay <= 0 || delay > 2 ** 31 - 1) return null;
        return setTimeout(fetchSessions, delay + 300); // 서버 시계 오차 여유 300ms
      })
      .filter(Boolean) as ReturnType<typeof setTimeout>[];
    return () => timers.forEach(clearTimeout);
  }, [sessions, fetchSessions]);

  function setMsg(sid: number, msg: string) {
    setCardMsg((m) => ({ ...m, [sid]: msg }));
  }

  const fetchRoster = useCallback(async (sid: number) => {
    try {
      // 토큰을 실어야 서버가 소속을 보고 실명을 내준다.
      // (안 보내면 비로그인으로 취급되어 재학생·졸업생에게도 "***" 로 마스킹된다)
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/api/swim/sessions/${sid}/roster`, {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const data = (await res.json()) as RosterT;
        setRosters((r) => ({ ...r, [sid]: data }));
      }
    } catch {
      // 조회 실패 시 기존 표시 유지
    }
  }, []);

  function toggleRoster(sid: number) {
    const opening = !rosterOpen[sid];
    setRosterOpen((o) => ({ ...o, [sid]: opening }));
    if (opening) fetchRoster(sid);
  }

  function refreshRosterIfOpen(sid: number) {
    if (rosterOpen[sid]) fetchRoster(sid);
  }

  function resetForm() {
    setEditingId(null);
    setMeetDate("");
    setMeetTime("19:00");
    setLocation("");
    setCapTraining("10");
    setCapProgress("10");
    setLateQueueEnabled(false);
    setStartDate("");
    setStartTime("12:00");
    setEndDate("");
    setEndTime("18:00");
    setFormErr("");
  }

  // 오픈 예정 세션을 폼에 불러와 수정 모드로 전환
  function startEdit(s: SwimSessionT) {
    const toLocal = (iso: string) => {
      const d = new Date(iso);
      const p = (n: number) => String(n).padStart(2, "0");
      return {
        date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
        time: `${p(d.getHours())}:${p(d.getMinutes())}`,
      };
    };
    const st = toLocal(s.applyStartAt);
    const en = toLocal(s.applyEndAt);
    setEditingId(s.id);
    setMeetDate(s.meetDate);
    setMeetTime(s.meetTime);
    setLocation(s.location);
    setCapTraining(String(s.capTraining));
    setCapProgress(String(s.capProgress));
    setLateQueueEnabled(s.lateQueueEnabled);
    setStartDate(st.date);
    setStartTime(st.time);
    setEndDate(en.date);
    setEndTime(en.time);
    setFormErr("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function createSession(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setFormErr("");
    if (!meetDate || !meetTime || !location.trim()) {
      setFormErr("모이는 날·시각·위치를 입력해주세요.");
      return;
    }
    if (!startDate || !endDate) {
      setFormErr("신청 시작·마감 날짜를 입력해주세요.");
      return;
    }
    const applyStart = `${startDate}T${startTime}`;
    const applyEnd = `${endDate}T${endTime}`;
    if (new Date(applyEnd) <= new Date(applyStart)) {
      setFormErr("마감 시각은 시작 시각보다 뒤여야 합니다.");
      return;
    }
    setBusy(true);
    try {
      const token = localStorage.getItem("accessToken");
      const editing = editingId !== null;
      const res = await fetch(
        editing ? `${API_URL}/api/swim/sessions/${editingId}` : `${API_URL}/api/swim/sessions`,
        {
        method: editing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          meetDate,
          meetTime,
          location: location.trim(),
          capTraining: Number(capTraining) || 0,
          capProgress: Number(capProgress) || 0,
          lateQueueEnabled,
          applyStartAt: new Date(applyStart).toISOString(),
          applyEndAt: new Date(applyEnd).toISOString(),
        }),
      },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || (editing ? "수정에 실패했습니다." : "등록에 실패했습니다."));
      }
      setShowForm(false);
      resetForm();
      await fetchSessions();
    } catch (err) {
      setFormErr(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function apply(sid: number, division: Division) {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setMsg(sid, "로그인이 필요합니다.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/swim/sessions/${sid}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ division }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(sid, data.detail || "신청에 실패했습니다.");
      } else {
        setMsg(sid, "신청 완료!");
      }
      await fetchSessions();
      refreshRosterIfOpen(sid);
    } catch {
      setMsg(sid, "요청 중 오류가 발생했습니다.");
    }
  }

  async function cancel(sid: number) {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/swim/sessions/${sid}/apply`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      setMsg(sid, res.ok ? "취소되었습니다." : data.detail || "취소에 실패했습니다.");
      await fetchSessions();
      refreshRosterIfOpen(sid);
    } catch {
      setMsg(sid, "요청 중 오류가 발생했습니다.");
    }
  }

  async function merge(sid: number) {
    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(`${API_URL}/api/swim/sessions/${sid}/merge`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 403) setMsg(sid, "관리자만 병합할 수 있습니다.");
      else if (!res.ok) setMsg(sid, data.detail || "병합에 실패했습니다.");
      else setMsg(sid, `병합 완료 (후순위 ${data.mergedCount}명 반영)`);
      await fetchSessions();
      refreshRosterIfOpen(sid);
    } catch {
      setMsg(sid, "요청 중 오류가 발생했습니다.");
    }
  }

  async function saveCapacity(sid: number) {
    const edit = capEdit[sid];
    if (!edit) return;
    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(`${API_URL}/api/swim/sessions/${sid}/capacity`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          capTraining: Number(edit.training) || 0,
          capProgress: Number(edit.progress) || 0,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 403) setMsg(sid, "관리자만 수정할 수 있습니다.");
      else if (!res.ok) setMsg(sid, data.detail || "인원 수정에 실패했습니다.");
      else {
        setMsg(sid, "인원이 수정되었습니다.");
        setCapEdit((c) => {
          const next = { ...c };
          delete next[sid];
          return next;
        });
      }
      await fetchSessions();
      refreshRosterIfOpen(sid);
    } catch {
      setMsg(sid, "요청 중 오류가 발생했습니다.");
    }
  }

  async function closeSession(sid: number) {
    // 후순위 병합을 안 한 채 마감하면 대기자들이 명단에서 빠지므로 경고
    const target = sessions.find((s) => s.id === sid);
    const pending =
      (target?.counts.training.pendingLate ?? 0) +
      (target?.counts.progress.pendingLate ?? 0);
    const warn =
      pending > 0
        ? `\n\n⚠️ 후순위 대기 ${pending}명이 아직 병합되지 않았습니다.\n이대로 마감하면 이 인원은 명단에서 제외됩니다.\n먼저 '후순위 병합'을 눌러주세요.`
        : "";
    if (
      !window.confirm(
        "지금 바로 신청을 마감할까요?\n마감 후에는 신청·취소가 불가하고 명단 다운로드가 열립니다." +
          warn
      )
    )
      return;
    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(`${API_URL}/api/swim/sessions/${sid}/close`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 403) setMsg(sid, "관리자만 마감할 수 있습니다.");
      else if (!res.ok) setMsg(sid, data.detail || "마감에 실패했습니다.");
      else setMsg(sid, "마감되었습니다.");
      await fetchSessions();
      refreshRosterIfOpen(sid);
    } catch {
      setMsg(sid, "요청 중 오류가 발생했습니다.");
    }
  }

  async function deleteSession(sid: number) {
    // 실수 방지: 정말 삭제할지 팝업으로 재확인
    if (
      !window.confirm(
        "정말 이 정기수영을 삭제할까요?\n신청 내역도 함께 삭제되며 되돌릴 수 없습니다."
      )
    )
      return;
    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(`${API_URL}/api/swim/sessions/${sid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 403) setMsg(sid, "관리자만 삭제할 수 있습니다.");
      else if (!res.ok) setMsg(sid, data.detail || "삭제에 실패했습니다.");
      await fetchSessions();
    } catch {
      setMsg(sid, "요청 중 오류가 발생했습니다.");
    }
  }

  async function downloadRoster(sid: number) {
    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(`${API_URL}/api/swim/sessions/${sid}/roster.docx`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setMsg(sid, res.status === 403 ? "관리자만 다운로드할 수 있습니다." : "다운로드에 실패했습니다.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `정기수영_명단_${sid}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setMsg(sid, "다운로드 중 오류가 발생했습니다.");
    }
  }

  return (
    <div className="flex flex-1 flex-col pb-8 pt-24">
      <GlassCard>
        <div className="mx-auto w-full max-w-3xl px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-sky-900">정기수영</h1>
            <p className="mt-4 text-slate-600">
              정기수영 일정을 확인하고 선착순으로 신청하세요.
            </p>
          </div>

          {/* 신청이 안 되는 이유를 알려준다 (버튼만 사라지면 고장처럼 보임) */}
          {me && !canJoin && (
            <p className="mt-6 rounded-2xl bg-amber-500/15 px-4 py-3 text-center text-sm text-amber-900 ring-1 ring-inset ring-amber-300/50">
              {!isApproved
                ? "가입 신청이 접수되었습니다. 임원진 승인 후 정기수영을 신청할 수 있어요. 참석자 명단은 승인 전까지 가려집니다."
                : me.membership === "alumni"
                  ? "졸업생 계정은 일정만 확인할 수 있습니다. 신청은 재학생 부원만 가능해요."
                  : "외부인 계정은 일정만 확인할 수 있습니다. 참석자 명단은 개인정보 보호를 위해 가려집니다."}
            </p>
          )}

          {/* ── 정기수영 열기 (관리자 전용 UI — 서버도 403으로 이중 방어) ── */}
          {isAdmin && (
            <div className="mt-10">
              {!showForm ? (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowForm(true);
                    }}
                    className={`${glassBtn("sky")} px-6 py-3`}
                  >
                    정기수영 열기
                  </button>
                </div>
              ) : (
                <form onSubmit={createSession} className="glass rounded-3xl p-6">
                  <h2 className="text-lg font-bold text-sky-900">
                    {editingId !== null ? "정기수영 수정" : "정기수영 설정"}
                  </h2>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        모이는 날
                      </label>
                      <input
                        type="date"
                        value={meetDate}
                        onChange={(e) => setMeetDate(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        모이는 시각
                      </label>
                      <WheelTimePicker value={meetTime} onChange={setMeetTime} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        위치
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="예: 학교 실내 수영장"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        훈련부 인원
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={capTraining}
                        onChange={(e) => setCapTraining(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        진도부 인원
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={capProgress}
                        onChange={(e) => setCapProgress(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        신청 시작
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={inputClass}
                      />
                      <div className="mt-2">
                        <WheelTimePicker value={startTime} onChange={setStartTime} />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        신청 마감
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={inputClass}
                      />
                      <div className="mt-2">
                        <WheelTimePicker value={endTime} onChange={setEndTime} />
                      </div>
                    </div>
                  </div>

                  <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={lateQueueEnabled}
                      onChange={(e) => setLateQueueEnabled(e.target.checked)}
                      className="h-4 w-4 accent-sky-600"
                    />
                    후순위 제도 적용 (후순위 회원은 대기열에 모였다가 병합 시 맨 뒤에 합류)
                  </label>

                  {formErr && (
                    <p className="mt-3 rounded-xl bg-red-50/80 px-4 py-2.5 text-sm text-red-600">
                      {formErr}
                    </p>
                  )}

                  <div className="mt-5 flex gap-3">
                    <button
                      type="submit"
                      disabled={busy}
                      className={`${glassBtn("sky")} flex-1 py-2.5 disabled:bg-slate-300/40 disabled:text-slate-500`}
                    >
                      {busy
                        ? "저장 중…"
                        : editingId !== null
                          ? "수정 저장"
                          : "등록"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                      className={`${glassBtn("slate")} px-5 py-2.5`}
                    >
                      닫기
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ── 정기수영 목록 ── */}
          <div className="mt-10 space-y-5">
            {sessions.length === 0 && (
              <p className="text-center text-sm text-slate-500">
                아직 열린 정기수영이 없습니다.
              </p>
            )}

            {sessions.map((s) => {
              const canApply = s.status === "open" && !s.my && canJoin;
              const startMs = new Date(s.applyStartAt).getTime();
              return (
                <div key={s.id} className="glass rounded-3xl p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold text-sky-900">
                      {s.meetDate} {s.meetTime} · {s.location}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        s.status === "open"
                          ? "bg-emerald-100 text-emerald-700"
                          : s.status === "upcoming"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {s.status === "open"
                        ? `신청 중 · ${fmt(s.applyEndAt)} 마감`
                        : s.status === "upcoming"
                          ? `오픈 예정 · ${fmt(s.applyStartAt)} 시작`
                          : "마감"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {(Object.keys(DIVISION_LABEL) as Division[]).map((div) => {
                      const c = s.counts[div];
                      return (
                        <div key={div} className="rounded-2xl bg-white/50 p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sky-900">
                              {DIVISION_LABEL[div]}
                            </span>
                            <span className="text-sm text-slate-600">
                              {c.assigned}/{c.cap}명
                              {c.reserve > 0 && ` · 예비 ${c.reserve}`}
                              {s.lateQueueEnabled &&
                                c.pendingLate > 0 &&
                                ` · 후순위 대기 ${c.pendingLate}`}
                            </span>
                          </div>
                          {/* 신청 버튼 — 오픈 전에도 계속 보이되 비활성 + 실시간 카운트다운 */}
                          {(s.status === "upcoming" || s.status === "open") && !s.my && canJoin && (
                            <button
                              type="button"
                              onClick={() => apply(s.id, div)}
                              disabled={!canApply}
                              className={
                                canApply
                                  ? `${glassBtn("sky")} mt-3 w-full py-2.5`
                                  : `${GLASS_BASE} mt-3 w-full cursor-not-allowed bg-slate-400/20 py-2.5 text-slate-500 ring-slate-300/50 hover:translate-y-0`
                              }
                            >
                              {canApply
                                ? `${DIVISION_LABEL[div]} 신청하기`
                                : `${countdown(startMs - nowTs)} 후 신청 가능`}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* 내 신청 상태 + 취소 */}
                  {s.my && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sky-50/80 px-4 py-3">
                      <span className="text-sm font-semibold text-sky-800">
                        {myStateText(s.my)}
                      </span>
                      {s.status !== "closed" && (
                        <button
                          type="button"
                          onClick={() => cancel(s.id)}
                          className={`${glassBtn("red")} py-1.5`}
                        >
                          취소하기
                        </button>
                      )}
                    </div>
                  )}

                  {s.status === "upcoming" && !s.my && (
                    <p className="mt-3 text-sm text-slate-500">
                      {fmt(s.applyStartAt)}에 신청이 열립니다. (버튼이 자동으로
                      활성화돼요)
                    </p>
                  )}

                  {/* 명단 대시보드 — 누구나 조회 가능 (이름만 공개) */}
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => toggleRoster(s.id)}
                      aria-expanded={!!rosterOpen[s.id]}
                      className={`${glassBtn("sky")} inline-flex items-center gap-1.5`}
                    >
                      {rosterOpen[s.id] ? "명단 접기" : "명단 펼치기"}
                      {/* 펼침 상태 표시 — 열리면 ^ 로 뒤집힌다 */}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
                        className={`transition-transform duration-200 ${
                          rosterOpen[s.id] ? "rotate-180" : ""
                        }`}
                      >
                        <path
                          d="M6 9l6 6 6-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {rosterOpen[s.id] && rosters[s.id] && (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {(Object.keys(DIVISION_LABEL) as Division[]).map((div) => {
                          const r = rosters[s.id].divisions[div];
                          const rows = [
                            ...r.assigned.map((e) => ({ label: "배정", ...e })),
                            ...r.reserve.map((e) => ({ label: "예비", ...e })),
                            ...r.pendingLate.map((e) => ({ label: "후순위 대기", ...e })),
                          ];
                          return (
                            <div key={div} className="rounded-2xl bg-white/60 p-4">
                              <h3 className="font-semibold text-sky-900">
                                {DIVISION_LABEL[div]} 명단{" "}
                                <span className="text-sm font-normal text-slate-500">
                                  (배정 {r.assigned.length}/{r.cap})
                                </span>
                              </h3>
                              {rows.length === 0 ? (
                                <p className="mt-2 text-sm text-slate-500">
                                  아직 신청자가 없습니다.
                                </p>
                              ) : (
                                <table className="mt-2 w-full text-sm">
                                  <thead>
                                    <tr className="text-left text-slate-500">
                                      <th className="py-1 pr-2 font-medium">구분</th>
                                      <th className="py-1 pr-2 font-medium">순번</th>
                                      <th className="py-1 font-medium">이름</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {rows.map((row, i) => (
                                      <tr key={i} className="border-t border-white/70">
                                        <td className="py-1.5 pr-2">
                                          <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                              row.label === "배정"
                                                ? "bg-emerald-100 text-emerald-700"
                                                : row.label === "예비"
                                                  ? "bg-amber-100 text-amber-700"
                                                  : "bg-slate-200 text-slate-600"
                                            }`}
                                          >
                                            {row.label}
                                          </span>
                                        </td>
                                        <td className="py-1.5 pr-2 text-slate-600">{row.rank}</td>
                                        <td className="py-1.5 font-medium text-slate-800">
                                          {row.name}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 관리자 도구 */}
                  {isAdmin && (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-white/50 pt-4">
                      {s.lateQueueEnabled && (
                        <button
                          type="button"
                          onClick={() => merge(s.id)}
                          className={glassBtn("indigo")}
                        >
                          후순위 병합
                          {s.counts.training.pendingLate +
                            s.counts.progress.pendingLate >
                            0 && (
                            <span className="ml-1.5 rounded-full bg-red-500/80 px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
                              {s.counts.training.pendingLate +
                                s.counts.progress.pendingLate}
                            </span>
                          )}
                        </button>
                      )}
                      {/* 수정 — 신청이 열리기 전(오픈 예정)에만 (서버도 400으로 강제) */}
                      {s.status === "upcoming" && (
                        <button
                          type="button"
                          onClick={() => startEdit(s)}
                          className={glassBtn("sky")}
                        >
                          수정하기
                        </button>
                      )}
                      {/* 인원 조정 — 신청 중에도 가능 (줄이면 예비로, 늘리면 예비에서 자동 배정) */}
                      {s.status === "open" && (
                        <button
                          type="button"
                          onClick={() =>
                            setCapEdit((c) =>
                              c[s.id]
                                ? (() => {
                                    const n = { ...c };
                                    delete n[s.id];
                                    return n;
                                  })()
                                : {
                                    ...c,
                                    [s.id]: {
                                      training: String(s.capTraining),
                                      progress: String(s.capProgress),
                                    },
                                  }
                            )
                          }
                          className={glassBtn("sky")}
                        >
                          {capEdit[s.id] ? "인원 조정 닫기" : "인원 조정"}
                        </button>
                      )}
                      {/* 즉시 마감 — 마감 전에만 노출 (확인 팝업 후 진행) */}
                      {s.status !== "closed" && (
                        <button
                          type="button"
                          onClick={() => closeSession(s.id)}
                          className={glassBtn("amber")}
                        >
                          마감하기
                        </button>
                      )}
                      {/* 명단 다운로드 — 신청 마감 후에만 (서버도 400으로 강제) */}
                      {s.status === "closed" ? (
                        <button
                          type="button"
                          onClick={() => downloadRoster(s.id)}
                          title="명단 다운로드 (docx)"
                          aria-label="명단 다운로드"
                          className={`${glassBtn("slate")} text-base`}
                        >
                          📋
                        </button>
                      ) : (
                        <span className="self-center text-xs text-slate-500">
                          명단 다운로드는 신청 마감 후 가능합니다
                        </span>
                      )}
                      {/* 잘못 만든 회차 삭제 (확인 팝업 후 진행) */}
                      <button
                        type="button"
                        onClick={() => deleteSession(s.id)}
                        title="삭제하기"
                        aria-label="삭제하기"
                        className={`${glassBtn("red")} ml-auto`}
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden
                        >
                          <path
                            d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* 인원 조정 패널 — 줄이면 예비로, 늘리면 예비에서 자동 배정 */}
                  {isAdmin && capEdit[s.id] && (
                    <div className="mt-3 rounded-2xl bg-white/60 p-4 ring-1 ring-white/70">
                      <p className="text-sm font-semibold text-sky-900">인원 조정</p>
                      <p className="mt-1 text-xs text-slate-500">
                        줄이면 뒤쪽 인원이 예비로 밀리고, 늘리면 예비 앞사람이 자동으로
                        배정됩니다.
                      </p>
                      <div className="mt-3 flex flex-wrap items-end gap-3">
                        <label className="text-sm text-slate-700">
                          훈련부
                          <input
                            type="number"
                            min={0}
                            value={capEdit[s.id].training}
                            onChange={(e) =>
                              setCapEdit((c) => ({
                                ...c,
                                [s.id]: { ...c[s.id], training: e.target.value },
                              }))
                            }
                            className="ml-2 w-20 rounded-lg border border-white/60 bg-white/70 px-2 py-1.5 text-sm outline-none focus:border-sky-400"
                          />
                        </label>
                        <label className="text-sm text-slate-700">
                          진도부
                          <input
                            type="number"
                            min={0}
                            value={capEdit[s.id].progress}
                            onChange={(e) =>
                              setCapEdit((c) => ({
                                ...c,
                                [s.id]: { ...c[s.id], progress: e.target.value },
                              }))
                            }
                            className="ml-2 w-20 rounded-lg border border-white/60 bg-white/70 px-2 py-1.5 text-sm outline-none focus:border-sky-400"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => saveCapacity(s.id)}
                          className={glassBtn("emerald")}
                        >
                          적용
                        </button>
                      </div>
                    </div>
                  )}

                  {cardMsg[s.id] && (
                    <p className="mt-3 text-sm font-medium text-sky-700">{cardMsg[s.id]}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
