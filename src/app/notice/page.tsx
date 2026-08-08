"use client";

import { useCallback, useEffect, useState } from "react";
import GlassCard from "@/components/GlassCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type Category = "notice" | "schedule";

type NoticeT = {
  id: number;
  category: Category;
  title: string;
  body: string | null;
  eventDate: string | null;
  pinned: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

const CATEGORY_LABEL: Record<Category, string> = {
  notice: "공지",
  schedule: "일정",
};

// 정기수영 페이지와 같은 유리 버튼 톤
const GLASS_BASE =
  "rounded-full px-4 py-2 text-sm font-semibold backdrop-blur-md transition ring-1 ring-inset shadow-sm hover:-translate-y-px active:translate-y-0 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.6)]";
const GLASS_TONE = {
  sky: "bg-sky-500/25 text-sky-900 ring-sky-300/60 hover:bg-sky-500/35",
  slate: "bg-slate-500/20 text-slate-800 ring-slate-300/60 hover:bg-slate-500/30",
  red: "bg-red-500/20 text-red-900 ring-red-300/60 hover:bg-red-500/30",
} as const;
const glassBtn = (tone: keyof typeof GLASS_TONE = "sky") =>
  `${GLASS_BASE} ${GLASS_TONE[tone]}`;

const inputClass =
  "w-full rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white";

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function NoticePage() {
  const [items, setItems] = useState<NoticeT[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);

  // 작성/수정 폼
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [category, setCategory] = useState<Category>("notice");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [pinned, setPinned] = useState(false);

  const fetchNotices = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/notices`);
      if (!res.ok) throw new Error();
      setItems(await res.json());
    } catch {
      setMsg("공지를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 관리자 여부는 서버에 물어본다 (localStorage를 신뢰하지 않음)
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    fetch(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => setIsAdmin(me?.role === "executive" || me?.role === "admin"))
      .catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  function resetForm() {
    setEditingId(null);
    setCategory("notice");
    setTitle("");
    setBody("");
    setEventDate("");
    setPinned(false);
  }

  function startCreate() {
    resetForm();
    setShowForm(true);
    setMsg("");
  }

  function startEdit(n: NoticeT) {
    setEditingId(n.id);
    setCategory(n.category);
    setTitle(n.title);
    setBody(n.body ?? "");
    setEventDate(n.eventDate ?? "");
    setPinned(n.pinned);
    setShowForm(true);
    setMsg("");
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!title.trim()) {
      setMsg("제목을 입력해주세요.");
      return;
    }
    if (category === "schedule" && !eventDate) {
      setMsg("일정은 날짜를 입력해주세요.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const token = localStorage.getItem("accessToken");
      const payload = {
        category,
        title: title.trim(),
        body: body.trim(),
        eventDate: category === "schedule" ? eventDate : "",
        pinned,
      };
      const res = await fetch(
        editingId ? `${API_URL}/api/notices/${editingId}` : `${API_URL}/api/notices`,
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "저장에 실패했습니다.");
      }
      setShowForm(false);
      resetForm();
      await fetchNotices();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(n: NoticeT) {
    if (
      !window.confirm(
        `"${n.title}"\n\n정말 삭제할까요? 삭제하면 되돌릴 수 없습니다.`
      )
    )
      return;
    setBusy(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/api/notices/${n.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "삭제에 실패했습니다.");
      }
      await fetchNotices();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col pb-8 pt-24">
      <GlassCard>
        <div className="mx-auto w-full max-w-3xl px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              공지사항 / 일정
            </h1>
            <p className="mt-4 text-slate-700">동아리의 새로운 소식을 확인하세요.</p>
          </div>

          {isAdmin && !showForm && (
            <div className="mt-8 flex justify-end">
              <button type="button" onClick={startCreate} className={glassBtn("sky")}>
                + 새 글 작성
              </button>
            </div>
          )}

          {/* 작성 / 수정 폼 — 관리자만 */}
          {isAdmin && showForm && (
            <form
              onSubmit={submitForm}
              className="glass mt-8 space-y-4 rounded-3xl p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId ? "글 수정" : "새 글 작성"}
                </h2>
                <div className="flex gap-2">
                  {(["notice", "schedule"] as Category[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={
                        category === c
                          ? glassBtn("sky")
                          : `${GLASS_BASE} bg-white/30 text-slate-700 ring-white/50`
                      }
                    >
                      {CATEGORY_LABEL[c]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-800">
                  제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 6월 정기 훈련 일정 변경"
                  className={inputClass}
                />
              </div>

              {category === "schedule" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-800">
                    날짜
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-800">
                  내용 <span className="font-normal text-slate-600">(선택)</span>
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={5}
                  placeholder="자세한 내용을 적어주세요."
                  className={`${inputClass} resize-y`}
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="h-4 w-4 accent-sky-600"
                />
                맨 위에 고정
              </label>

              {msg && (
                <p className="rounded-xl bg-red-50/80 px-4 py-2.5 text-sm text-red-700">
                  {msg}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={busy}
                  className={`${glassBtn("sky")} flex-1 py-2.5 disabled:opacity-50`}
                >
                  {busy ? "저장 중…" : editingId ? "수정하기" : "등록하기"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                    setMsg("");
                  }}
                  className={`${glassBtn("slate")} px-6 py-2.5`}
                >
                  취소
                </button>
              </div>
            </form>
          )}

          {msg && !showForm && (
            <p className="mt-6 rounded-xl bg-red-50/80 px-4 py-2.5 text-center text-sm text-red-700">
              {msg}
            </p>
          )}

          {/* 목록 */}
          {loading ? (
            <p className="mt-12 text-center text-slate-700">불러오는 중…</p>
          ) : items.length === 0 ? (
            <p className="glass mt-12 rounded-3xl px-6 py-12 text-center text-slate-700">
              아직 등록된 공지가 없습니다.
            </p>
          ) : (
            <ul className="glass mt-12 divide-y divide-white/40 overflow-hidden rounded-3xl">
              {items.map((n) => {
                const open = openId === n.id;
                return (
                  <li key={n.id} className="transition-colors hover:bg-white/40">
                    <div className="flex items-center justify-between gap-4 px-6 py-5">
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : n.id)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                            n.category === "schedule"
                              ? "bg-indigo-500/20 text-indigo-900 ring-indigo-300/60"
                              : "bg-sky-500/20 text-sky-900 ring-sky-300/60"
                          }`}
                        >
                          {CATEGORY_LABEL[n.category]}
                        </span>
                        {n.pinned && (
                          <span
                            className="shrink-0 text-amber-600"
                            title="고정된 글"
                            aria-label="고정된 글"
                          >
                            📌
                          </span>
                        )}
                        <span className="truncate font-medium text-slate-900">
                          {n.title}
                        </span>
                      </button>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-sm text-slate-700">
                          {n.eventDate ?? formatDate(n.createdAt)}
                        </span>
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(n)}
                              className="rounded-full p-1.5 text-slate-600 transition hover:bg-white/60 hover:text-sky-700"
                              title="수정"
                              aria-label="수정"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(n)}
                              disabled={busy}
                              className="rounded-full p-1.5 text-slate-600 transition hover:bg-white/60 hover:text-red-600 disabled:opacity-40"
                              title="삭제"
                              aria-label="삭제"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {open && n.body && (
                      <p className="whitespace-pre-wrap px-6 pb-5 text-sm leading-relaxed text-slate-800">
                        {n.body}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
