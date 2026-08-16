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
  imageUrl: string | null;
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
  const [imageUrl, setImageUrl] = useState("");   // 업로드 후 받은 "/uploads/..."
  const [uploading, setUploading] = useState(false);

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
    setImageUrl("");
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
    setImageUrl(n.imageUrl ?? "");
    setShowForm(true);
    setMsg("");
  }

  /** 파일을 고르는 즉시 올리고 경로만 폼에 들고 있는다.
   *  글 저장과 함께 올리면 저장이 느려지고, 실패했을 때 뭐가 실패한 건지 알기 어렵다. */
  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg("");
    try {
      const token = localStorage.getItem("accessToken");
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_URL}/api/notices/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,   // Content-Type은 브라우저가 boundary와 함께 자동으로 넣는다
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "이미지 업로드에 실패했습니다.");
      }
      const { url } = await res.json();
      setImageUrl(url);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "이미지 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
      e.target.value = "";   // 같은 파일을 다시 골라도 change가 걸리게
    }
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
        imageUrl,   // 빈 문자열이면 서버가 '이미지 제거'로 처리한다
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

              {/* 이미지 첨부 — 한 장. 고르면 바로 올라가고 경로만 폼에 들고 있는다 */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-800">
                  이미지 (선택)
                </label>
                {imageUrl ? (
                  <div className="flex items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${API_URL}${imageUrl}`}
                      alt="첨부 이미지 미리보기"
                      className="h-24 w-24 rounded-xl object-cover ring-1 ring-white/60"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className={glassBtn("slate")}
                    >
                      이미지 제거
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={uploadImage}
                    className="w-full text-sm text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-sky-500/25 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-sky-900 hover:file:bg-sky-500/35"
                  />
                )}
                <p className="mt-1.5 text-xs text-slate-600">
                  {uploading ? "업로드 중…" : "jpg · png · gif · webp, 5MB 이하"}
                </p>
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
                    {/* 모바일은 두 줄로 나눈다.
                        한 줄에 배지·📌·제목·날짜·아이콘을 다 넣으면 제목이 먼저 잘려서
                        정작 무슨 글인지가 안 보인다. 좁은 화면에서는
                        (윗줄) 배지 + 제목 / (아랫줄) 날짜 + 관리 버튼 으로 쌓는다. */}
                    <div className="flex flex-col gap-2 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : n.id)}
                        className="flex min-w-0 flex-1 items-start gap-2.5 text-left sm:items-center sm:gap-3"
                      >
                        <span
                          className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset sm:mt-0 ${
                            n.category === "schedule"
                              ? "bg-indigo-500/20 text-indigo-900 ring-indigo-300/60"
                              : "bg-sky-500/20 text-sky-900 ring-sky-300/60"
                          }`}
                        >
                          {CATEGORY_LABEL[n.category]}
                        </span>
                        {n.pinned && (
                          <span
                            className="mt-0.5 shrink-0 text-amber-600 sm:mt-0"
                            title="고정된 글"
                            aria-label="고정된 글"
                          >
                            📌
                          </span>
                        )}
                        {/* 모바일은 제목을 두 줄까지 펼쳐 보여주고, 데스크톱은 한 줄로 자른다 */}
                        <span className="line-clamp-2 min-w-0 font-medium text-slate-900 sm:truncate">
                          {n.title}
                        </span>
                      </button>

                      <div className="flex shrink-0 items-center gap-2 pl-[3.25rem] sm:pl-0">
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

                    {open && (
                      <div className="px-6 pb-5">
                        {n.body && (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                            {n.body}
                          </p>
                        )}
                        {n.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`${API_URL}${n.imageUrl}`}
                            alt={n.title}
                            className="mt-4 max-h-[28rem] w-full rounded-2xl object-contain ring-1 ring-white/50"
                          />
                        )}
                        <Comments noticeId={n.id} />
                      </div>
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

type CommentT = {
  id: number;
  body: string;
  author: string | null;
  authorId: number | null;
  createdAt: string | null;
};

/**
 * 공지 하나에 달린 댓글 목록 + 작성 폼.
 *
 * 글을 펼칠 때만 마운트되므로, 목록 화면에서 공지 수만큼 요청이 나가지 않는다.
 * 읽기는 누구나, 쓰기는 승인된 회원만(서버가 403으로 막고 여기선 안내만 한다).
 */
function Comments({ noticeId }: { noticeId: number }) {
  const [items, setItems] = useState<CommentT[]>([]);
  const [text, setText] = useState("");
  const [me, setMe] = useState<{ id?: number; role?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/notices/${noticeId}/comments`);
      if (res.ok) setItems(await res.json());
    } catch {
      /* 목록만 비어 보이면 되므로 조용히 넘어간다 */
    }
  }, [noticeId]);

  useEffect(() => {
    load();
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    fetch(`${API_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then(setMe)
      .catch(() => setMe(null));
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !text.trim()) return;
    setBusy(true);
    setErr("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/api/notices/${noticeId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: text.trim() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "댓글을 남기지 못했습니다.");
      }
      setText("");
      await load();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "댓글을 남기지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(c: CommentT) {
    if (!window.confirm("댓글을 지울까요?")) return;
    const token = localStorage.getItem("accessToken");
    await fetch(`${API_URL}/api/notices/${noticeId}/comments/${c.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await load();
  }

  const canDelete = (c: CommentT) =>
    me?.id === c.authorId || me?.role === "executive" || me?.role === "admin";

  return (
    <div className="mt-5 border-t border-white/50 pt-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        댓글 {items.length}
      </p>

      <ul className="space-y-3">
        {items.map((c) => (
          <li key={c.id} className="rounded-2xl bg-white/45 px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold text-slate-900">{c.author}</span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-slate-500">{formatDate(c.createdAt)}</span>
                {canDelete(c) && (
                  <button
                    type="button"
                    onClick={() => remove(c)}
                    className="text-xs text-slate-500 transition hover:text-red-600"
                  >
                    삭제
                  </button>
                )}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{c.body}</p>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-sm text-slate-500">아직 댓글이 없습니다.</li>
        )}
      </ul>

      {me ? (
        <form onSubmit={submit} className="mt-3 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="댓글 남기기"
            maxLength={1000}
            className="flex-1 rounded-full border border-white/60 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          />
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className={`${glassBtn("sky")} disabled:opacity-40`}
          >
            {busy ? "등록 중…" : "등록"}
          </button>
        </form>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          댓글을 남기려면 로그인이 필요합니다.
        </p>
      )}

      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
    </div>
  );
}
