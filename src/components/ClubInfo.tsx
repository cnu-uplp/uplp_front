"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const STAFF_ROLES = ["executive", "admin"];

type Item = { id: number; title: string | null; body: string; sortOrder: number };

/** 코드에 박혀 있던 기본값. 아직 아무것도 등록하지 않았을 때 이 값이 보인다. */
export const DEFAULT_INFO = [
  { title: "활동", body: "매주 화 · 목 19:00" },
  { title: "장소", body: "충남대학교 실내수영장" },
  { title: "대상", body: "초급부터 마스터즈까지" },
  { title: "회비", body: "학기당 5만원 (강습비 별도)" },
];

/**
 * 동아리 기본 정보(항목: 값) — 홈 히어로와 소개 페이지가 **같은 목록**을 읽는다.
 *
 * 전에는 두 화면에 따로 박혀 있어서 활동 시간이 서로 달랐다(홈 19:00 / 소개 19:00~21:00).
 * 이제 한 곳에서 고치면 양쪽이 같이 바뀐다.
 *
 * variant
 *   hero  — 사진 위 흰 글씨, 가는 선으로 나눈 목록 (홈 첫 화면)
 *   cards — 유리 카드 2열 (동아리 소개)
 */
export default function ClubInfo({
  variant,
  limit,
}: {
  variant: "hero" | "cards";
  /** 히어로처럼 일부만 보여줄 때 (없으면 전부) */
  limit?: number;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/content/info`);
      if (res.ok) setItems(await res.json());
    } catch {
      /* 서버가 죽어도 기본값이 보이면 된다 */
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    fetch(`${API_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => setIsStaff(STAFF_ROLES.includes(me?.role)))
      .catch(() => setIsStaff(false));
  }, [load]);

  async function send(path: string, method: string, body?: unknown) {
    const token = localStorage.getItem("accessToken");
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`${API_URL}/api/content${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErr(d.detail || "저장하지 못했습니다.");
        return false;
      }
      await load();
      return true;
    } catch {
      setErr("저장하지 못했습니다.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  /** 코드에 있던 기본 항목을 그대로 등록한다 (처음 한 번). */
  async function importDefaults() {
    for (const d of DEFAULT_INFO) {
      await send("", "POST", { page: "info", title: d.title, body: d.body });
    }
  }

  const shown = items.length ? items : [];
  const list = (limit ? shown.slice(0, limit) : shown).map((i) => ({
    id: i.id,
    title: i.title ?? "",
    body: i.body,
  }));
  // 등록된 게 없으면 코드 기본값을 보여준다 (화면이 비지 않게)
  const display = list.length
    ? list
    : (limit ? DEFAULT_INFO.slice(0, limit) : DEFAULT_INFO).map((d) => ({
        id: -1,
        ...d,
      }));

  if (!loaded && variant === "hero") {
    // 히어로는 첫 화면이라 깜빡임이 눈에 띈다 — 기본값으로 즉시 그린다
  }

  return (
    <>
      {variant === "hero" ? (
        <dl className="flex flex-col gap-px overflow-hidden lg:min-w-[19rem]">
          {display.map((it) => (
            <div
              key={it.id + it.title}
              className="flex items-baseline justify-between gap-6 border-t border-white/20 py-3 last:border-b"
            >
              <dt className="text-[0.7rem] uppercase tracking-[0.28em] text-white/55">
                {it.title}
              </dt>
              <dd className="text-[0.95rem] font-medium text-white sm:text-base">
                {it.body}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            {display.map((it) => (
              <div key={it.id + it.title} className="glass glass-hover rounded-3xl p-6">
                <h2 className="font-semibold text-sky-900">{it.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{it.body}</p>
              </div>
            ))}
          </div>

          {/* 편집은 소개 페이지에서만 한다 — 히어로는 사진 위라 편집 UI를 얹으면 지저분하고,
              어차피 같은 목록이라 여기서 고치면 홈도 같이 바뀐다. */}
          {isStaff && (
            <div className="mt-4">
              {items.length === 0 ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={importDefaults}
                  className="rounded-full bg-sky-500/25 px-4 py-2 text-sm font-semibold text-sky-900 ring-1 ring-inset ring-sky-300/60 transition hover:bg-sky-500/35 disabled:opacity-40"
                >
                  기본 정보 가져와서 편집하기
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing((v) => !v)}
                  className="rounded-full bg-white/50 px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-white/60 transition hover:bg-white/70"
                >
                  {editing ? "편집 닫기" : "기본 정보 편집"}
                </button>
              )}
              <p className="mt-2 text-xs text-slate-600">
                여기서 고치면 홈 첫 화면의 안내도 함께 바뀝니다.
              </p>
            </div>
          )}

          {isStaff && editing && (
            <InfoEditor
              items={items}
              busy={busy}
              onSave={(id, title, body) => send(`/${id}`, "PATCH", { title, body })}
              onAdd={(title, body) => send("", "POST", { page: "info", title, body })}
              onDelete={(id) => send(`/${id}`, "DELETE")}
            />
          )}

          {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
        </>
      )}
    </>
  );
}

function InfoEditor({
  items,
  busy,
  onSave,
  onAdd,
  onDelete,
}: {
  items: Item[];
  busy: boolean;
  onSave: (id: number, title: string, body: string) => void;
  onAdd: (title: string, body: string) => void;
  onDelete: (id: number) => void;
}) {
  const [draft, setDraft] = useState({ title: "", body: "" });
  const input =
    "w-full min-w-0 rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:bg-white";

  return (
    <div className="mt-4 space-y-3 rounded-3xl bg-white/40 p-4">
      {items.map((it) => (
        <Row key={it.id} item={it} busy={busy} onSave={onSave} onDelete={onDelete} />
      ))}

      <div className="grid gap-2 border-t border-white/60 pt-3 sm:grid-cols-[10rem_1fr_auto]">
        <input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="항목 (예: 회비)"
          className={input}
        />
        <input
          value={draft.body}
          onChange={(e) => setDraft({ ...draft, body: e.target.value })}
          placeholder="값 (예: 학기당 5만원)"
          className={input}
        />
        <button
          type="button"
          disabled={busy || !draft.title.trim() || !draft.body.trim()}
          onClick={() => {
            onAdd(draft.title.trim(), draft.body.trim());
            setDraft({ title: "", body: "" });
          }}
          className="rounded-full bg-sky-500/25 px-4 py-2 text-sm font-semibold text-sky-900 ring-1 ring-inset ring-sky-300/60 disabled:opacity-40"
        >
          추가
        </button>
      </div>
    </div>
  );
}

function Row({
  item,
  busy,
  onSave,
  onDelete,
}: {
  item: Item;
  busy: boolean;
  onSave: (id: number, title: string, body: string) => void;
  onDelete: (id: number) => void;
}) {
  const [title, setTitle] = useState(item.title ?? "");
  const [body, setBody] = useState(item.body);
  const dirty = title !== (item.title ?? "") || body !== item.body;
  const input =
    "w-full min-w-0 rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:bg-white";

  return (
    <div className="grid gap-2 sm:grid-cols-[10rem_1fr_auto]">
      <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} />
      <input value={body} onChange={(e) => setBody(e.target.value)} className={input} />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy || !dirty}
          onClick={() => onSave(item.id, title.trim(), body.trim())}
          className="rounded-full bg-sky-500/25 px-4 py-2 text-sm font-semibold text-sky-900 ring-1 ring-inset ring-sky-300/60 disabled:opacity-40"
        >
          저장
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (window.confirm(`"${item.title}" 항목을 지울까요?`)) onDelete(item.id);
          }}
          className="rounded-full bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-900 ring-1 ring-inset ring-red-300/60 disabled:opacity-40"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
