"use client";

import { useCallback, useEffect, useState } from "react";
import Markdown from "@/components/Markdown";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const STAFF_ROLES = ["executive", "admin"];

type Section = {
  id: number;
  page: string;
  title: string | null;
  body: string;
  sortOrder: number;
  visible: boolean;
};

const GLASS =
  "rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset transition disabled:opacity-40";
const btn = {
  sky: `${GLASS} bg-sky-500/25 text-sky-900 ring-sky-300/60 hover:bg-sky-500/35`,
  slate: `${GLASS} bg-white/50 text-slate-700 ring-white/60 hover:bg-white/70`,
  red: `${GLASS} bg-red-500/20 text-red-900 ring-red-300/60 hover:bg-red-500/30`,
};

/**
 * DB에 저장된 페이지 섹션을 렌더하고, 임원진에게는 편집 UI를 함께 보여준다.
 *
 * `fallback`은 아직 섹션을 하나도 만들지 않았을 때 보여줄 기존 화면이다.
 * 이게 없으면 기능을 붙이는 순간 소개 페이지가 빈 화면이 된다.
 */
export default function EditableSections({
  page,
  fallback,
}: {
  page: "home" | "about";
  fallback?: React.ReactNode;
}) {
  const [sections, setSections] = useState<Section[]>([]);
  const [isStaff, setIsStaff] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState({ title: "", body: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const token = () =>
    typeof window === "undefined" ? null : localStorage.getItem("accessToken");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/content/${page}`);
      if (res.ok) setSections(await res.json());
    } catch {
      /* 백엔드가 죽어도 fallback이 보이면 되므로 조용히 넘어간다 */
    } finally {
      setLoaded(true);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = token();
    if (!t) return;
    fetch(`${API_URL}/api/users/me`, { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => setIsStaff(STAFF_ROLES.includes(me?.role)))
      .catch(() => setIsStaff(false));
  }, []);

  async function send(path: string, method: string, body?: unknown) {
    const t = token();
    if (!t) return null;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`${API_URL}/api/content${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setMsg(d.detail || "요청에 실패했습니다.");
        return null;
      }
      await load();
      return true;
    } catch {
      setMsg("요청 중 오류가 발생했습니다.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  function startNew() {
    setDraft({ title: "", body: "" });
    setEditing("new");
  }

  function startEdit(s: Section) {
    setDraft({ title: s.title ?? "", body: s.body });
    setEditing(s.id);
  }

  async function save() {
    if (!draft.body.trim() && !draft.title.trim()) {
      setMsg("제목이나 본문 중 하나는 채워주세요.");
      return;
    }
    const ok =
      editing === "new"
        ? await send("", "POST", { page, title: draft.title, body: draft.body })
        : await send(`/${editing}`, "PATCH", {
            title: draft.title,
            body: draft.body,
          });
    if (ok) setEditing(null);
  }

  async function remove(s: Section) {
    const name = s.title || "제목 없는 섹션";
    if (!window.confirm(`"${name}"을(를) 삭제할까요?\n\n되돌릴 수 없습니다.`)) return;
    await send(`/${s.id}`, "DELETE");
  }

  async function move(index: number, dir: -1 | 1) {
    const next = [...sections];
    const to = index + dir;
    if (to < 0 || to >= next.length) return;
    [next[index], next[to]] = [next[to], next[index]];
    // 화면을 먼저 바꿔 반응을 즉시 보여주고, 서버 확정은 뒤따르게 한다.
    setSections(next);
    await send(`/${page}/reorder`, "POST", { ids: next.map((s) => s.id) });
  }

  const shown = isStaff ? sections : sections.filter((s) => s.visible);

  // 섹션이 하나도 없고 편집 권한도 없으면 기존 화면을 그대로 보여준다.
  if (loaded && sections.length === 0 && !isStaff) return <>{fallback ?? null}</>;
  if (!loaded) return <>{fallback ?? null}</>;

  return (
    <div className="space-y-8">
      {sections.length === 0 && fallback}

      {shown.map((s, i) => (
        <section
          key={s.id}
          className={s.visible ? "" : "rounded-2xl bg-amber-100/40 p-4 ring-1 ring-amber-300/50"}
        >
          {isStaff && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button type="button" className={btn.slate} disabled={busy || i === 0} onClick={() => move(i, -1)}>
                ↑
              </button>
              <button
                type="button"
                className={btn.slate}
                disabled={busy || i === shown.length - 1}
                onClick={() => move(i, 1)}
              >
                ↓
              </button>
              <button type="button" className={btn.sky} disabled={busy} onClick={() => startEdit(s)}>
                수정
              </button>
              <button
                type="button"
                className={btn.slate}
                disabled={busy}
                onClick={() => send(`/${s.id}`, "PATCH", { visible: !s.visible })}
              >
                {s.visible ? "숨기기" : "다시 보이기"}
              </button>
              <button type="button" className={btn.red} disabled={busy} onClick={() => remove(s)}>
                삭제
              </button>
              {!s.visible && (
                <span className="text-xs font-semibold text-amber-800">
                  숨김 — 임원진에게만 보입니다
                </span>
              )}
            </div>
          )}

          {editing === s.id ? (
            <Editor draft={draft} setDraft={setDraft} onSave={save} onCancel={() => setEditing(null)} busy={busy} />
          ) : (
            <>
              {s.title && (
                <h2 className="mb-3 text-2xl font-bold tracking-tight text-sky-900">
                  {s.title}
                </h2>
              )}
              <Markdown source={s.body} />
            </>
          )}
        </section>
      ))}

      {isStaff && editing === "new" && (
        <Editor draft={draft} setDraft={setDraft} onSave={save} onCancel={() => setEditing(null)} busy={busy} />
      )}

      {isStaff && editing !== "new" && (
        <button type="button" className={btn.sky} disabled={busy} onClick={startNew}>
          + 섹션 추가
        </button>
      )}

      {msg && (
        <p className="rounded-xl bg-red-50/80 px-4 py-2.5 text-sm text-red-600">{msg}</p>
      )}
    </div>
  );
}

function Editor({
  draft,
  setDraft,
  onSave,
  onCancel,
  busy,
}: {
  draft: { title: string; body: string };
  setDraft: (d: { title: string; body: string }) => void;
  onSave: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  return (
    <div className="glass rounded-3xl p-5">
      <input
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        placeholder="섹션 제목 (비워두면 본문만 나옵니다)"
        className="w-full rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-sky-400 focus:bg-white"
      />
      <textarea
        value={draft.body}
        onChange={(e) => setDraft({ ...draft, body: e.target.value })}
        rows={10}
        placeholder={"본문 (마크다운)\n\n## 큰 제목\n### 작은 제목\n- 목록\n**굵게**  *기울임*  [링크](https://…)"}
        className="mt-3 w-full rounded-xl border border-white/60 bg-white/70 px-4 py-3 font-mono text-sm text-slate-900 outline-none focus:border-sky-400 focus:bg-white"
      />

      {draft.body.trim() && (
        <div className="mt-4 rounded-2xl bg-white/50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            미리보기
          </p>
          <Markdown source={draft.body} />
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button type="button" className={btn.sky} disabled={busy} onClick={onSave}>
          {busy ? "저장 중…" : "저장"}
        </button>
        <button type="button" className={btn.slate} disabled={busy} onClick={onCancel}>
          취소
        </button>
      </div>
    </div>
  );
}
