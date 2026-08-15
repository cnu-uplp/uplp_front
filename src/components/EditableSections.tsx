"use client";

import { useCallback, useEffect, useState } from "react";
import Markdown from "@/components/Markdown";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const STAFF_ROLES = ["executive", "admin"];

type Width = "full" | "half" | "third";

type Section = {
  id: number;
  page: string;
  title: string | null;
  body: string;
  sortOrder: number;
  visible: boolean;
  width: Width;
};

// 6칸 그리드에서 차지하는 칸 수. 좁은 화면(sm 미만)에서는 전부 한 줄씩 쌓는다 —
// 휴대폰에서 2단으로 쪼개면 글자가 너무 좁아진다.
const SPAN: Record<Width, string> = {
  full: "col-span-6",
  half: "col-span-6 sm:col-span-3",
  third: "col-span-6 sm:col-span-2",
};

const WIDTH_LABEL: Record<Width, string> = {
  full: "한 줄 전체",
  half: "1/2 (2개 나란히)",
  third: "1/3 (3개 나란히)",
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
  seed,
}: {
  page: "home" | "about";
  fallback?: React.ReactNode;
  /** 코드에 박혀 있던 기존 안내. 임원진이 '기존 내용 가져오기'로 섹션화할 수 있다. */
  seed?: { title: string; body: string; width: Width }[];
}) {
  const [sections, setSections] = useState<Section[]>([]);
  const [isStaff, setIsStaff] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<{ title: string; body: string; width: Width }>({
    title: "",
    body: "",
    width: "full",
  });
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
    setDraft({ title: "", body: "", width: "full" });
    setEditing("new");
  }

  function startEdit(s: Section) {
    setDraft({ title: s.title ?? "", body: s.body, width: s.width ?? "full" });
    setEditing(s.id);
  }

  async function save() {
    if (!draft.body.trim() && !draft.title.trim()) {
      setMsg("제목이나 본문 중 하나는 채워주세요.");
      return;
    }
    const ok =
      editing === "new"
        ? await send("", "POST", { page, ...draft })
        : await send(`/${editing}`, "PATCH", draft);
    if (ok) setEditing(null);
  }

  /** 코드에 박혀 있던 기존 안내를 섹션으로 옮긴다 (한 번만 누르면 된다). */
  async function importDefaults() {
    if (!seed?.length) return;
    if (
      !window.confirm(
        `기존 안내 ${seed.length}개를 편집 가능한 섹션으로 가져올까요?\n\n` +
          "가져온 뒤에는 화면에서 자유롭게 고치고 지울 수 있습니다.",
      )
    )
      return;
    for (const s of seed) {
      // 순서를 지키려고 하나씩 보낸다 (동시에 보내면 sort_order가 뒤섞인다)
      await send("", "POST", { page, ...s });
    }
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
    <div className="space-y-6">
      {sections.length === 0 && fallback}

      {/* 6칸 그리드 — full=6칸, half=3칸(2개 나란히), third=2칸(3개 나란히).
          half 4개를 이어 붙이면 2x2가 된다. */}
      <div className="grid grid-cols-6 gap-5">
      {shown.map((s, i) => (
        <section
          key={s.id}
          className={`${SPAN[s.width ?? "full"]} ${
            s.visible ? "" : "rounded-2xl bg-amber-100/40 p-4 ring-1 ring-amber-300/50"
          }`}
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
      </div>

      {isStaff && editing === "new" && (
        <Editor draft={draft} setDraft={setDraft} onSave={save} onCancel={() => setEditing(null)} busy={busy} />
      )}

      {isStaff && editing !== "new" && (
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn.sky} disabled={busy} onClick={startNew}>
            + 섹션 추가
          </button>
          {/* 코드에 박혀 있던 안내를 섹션으로 옮기는 버튼. 이미 옮겼으면 숨긴다. */}
          {!!seed?.length && sections.length === 0 && (
            <button type="button" className={btn.slate} disabled={busy} onClick={importDefaults}>
              기존 내용 가져와서 편집하기
            </button>
          )}
        </div>
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
  draft: { title: string; body: string; width: Width };
  setDraft: (d: { title: string; body: string; width: Width }) => void;
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

      {/* 가로 폭 — 1/2 짜리 4개를 만들면 2x2가 된다 */}
      <div className="mt-3">
        <label className="mb-1.5 block text-sm font-medium text-slate-800">
          가로 크기
        </label>
        <div className="flex flex-wrap gap-2">
          {(["full", "half", "third"] as Width[]).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setDraft({ ...draft, width: w })}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-inset transition ${
                draft.width === w
                  ? "bg-sky-500/25 text-sky-900 ring-sky-400/70"
                  : "bg-white/60 text-slate-700 ring-white/70 hover:bg-white/80"
              }`}
            >
              {WIDTH_LABEL[w]}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-slate-600">
          휴대폰에서는 화면이 좁아 모두 한 줄씩 쌓입니다.
        </p>
      </div>

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
