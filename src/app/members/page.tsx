"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/GlassCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type Role = "member" | "executive" | "admin";

type MemberT = {
  id: number;
  name: string | null;
  nickname: string | null;
  phoneNumber: string | null;
  college: string | null;
  department: string | null;
  role: Role;
  isDeprioritized: boolean | null;
};

const ROLE_LABEL: Record<Role, string> = {
  member: "일반 부원",
  executive: "임원진",
  admin: "관리자",
};

const ROLE_TONE: Record<Role, string> = {
  member: "bg-slate-500/20 text-slate-800 ring-slate-300/60",
  executive: "bg-indigo-500/20 text-indigo-900 ring-indigo-300/60",
  admin: "bg-amber-500/25 text-amber-900 ring-amber-300/60",
};

const GLASS_BASE =
  "rounded-full px-4 py-2 text-sm font-semibold backdrop-blur-md transition ring-1 ring-inset shadow-sm hover:-translate-y-px active:translate-y-0 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.6)]";
const GLASS_TONE = {
  sky: "bg-sky-500/25 text-sky-900 ring-sky-300/60 hover:bg-sky-500/35",
  slate: "bg-slate-500/20 text-slate-800 ring-slate-300/60 hover:bg-slate-500/30",
  amber: "bg-amber-500/25 text-amber-900 ring-amber-300/60 hover:bg-amber-500/35",
} as const;
const glassBtn = (tone: keyof typeof GLASS_TONE = "sky") =>
  `${GLASS_BASE} ${GLASS_TONE[tone]}`;

// 01012345678 → 010-1234-5678 (보기용. 저장은 하이픈 없이)
function prettyPhone(v: string | null) {
  if (!v) return "-";
  const d = v.replace(/\D/g, "");
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return v;
}

export default function MembersPage() {
  const router = useRouter();
  const [me, setMe] = useState<MemberT | null>(null);
  const [members, setMembers] = useState<MemberT[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [msg, setMsg] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");

  const isAdmin = me?.role === "admin";

  const load = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
      return;
    }
    const auth = { Authorization: `Bearer ${token}` };
    try {
      const meRes = await fetch(`${API_URL}/api/users/me`, { headers: auth });
      if (!meRes.ok) throw new Error("auth");
      const meData: MemberT = await meRes.json();
      setMe(meData);

      const listRes = await fetch(`${API_URL}/api/users`, { headers: auth });
      if (listRes.status === 403) {
        setDenied(true);
        return;
      }
      if (!listRes.ok) throw new Error("list");
      setMembers(await listRes.json());
    } catch {
      setMsg("부원 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function patch(id: number, path: string, body: object, label: string) {
    setBusyId(id);
    setMsg("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/api/users/${id}/${path}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `${label}에 실패했습니다.`);
      }
      const updated: MemberT = await res.json();
      setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch (err) {
      setMsg(err instanceof Error ? err.message : `${label}에 실패했습니다.`);
    } finally {
      setBusyId(null);
    }
  }

  function changeRole(m: MemberT, role: Role) {
    if (role === m.role) return;
    const who = m.name ?? m.nickname ?? `회원${m.id}`;
    if (
      !window.confirm(
        `${who} 님의 역할을\n\n  ${ROLE_LABEL[m.role]} → ${ROLE_LABEL[role]}\n\n으로 변경할까요?`
      )
    )
      return;
    patch(m.id, "role", { role }, "역할 변경");
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (roleFilter !== "all" && m.role !== roleFilter) return false;
      if (!q) return true;
      return [m.name, m.nickname, m.phoneNumber, m.college, m.department]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [members, query, roleFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: members.length };
    (["member", "executive", "admin"] as Role[]).forEach((r) => {
      c[r] = members.filter((m) => m.role === r).length;
    });
    return c;
  }, [members]);

  if (denied) {
    return (
      <div className="flex flex-1 flex-col pb-8 pt-24">
        <GlassCard>
          <div className="mx-auto w-full max-w-3xl px-6 py-24 text-center">
            <h1 className="text-2xl font-bold text-slate-900">접근 권한이 없습니다</h1>
            <p className="mt-3 text-slate-700">
              부원 관리는 임원진만 볼 수 있습니다.
            </p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col pb-8 pt-24">
      <GlassCard>
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              부원 관리
            </h1>
            <p className="mt-4 text-slate-700">
              가입한 부원 {counts.all}명 · 임원진 {counts.executive ?? 0}명 · 관리자{" "}
              {counts.admin ?? 0}명
            </p>
            {!isAdmin && (
              <p className="mt-2 text-sm text-slate-700">
                역할 변경은 관리자만 할 수 있습니다.
              </p>
            )}
          </div>

          {/* 검색 + 역할 필터 */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="이름 · 전화번호 · 학과로 검색"
              className="w-full flex-1 rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            />
            <div className="flex flex-wrap gap-2">
              {(["all", "member", "executive", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={
                    roleFilter === r
                      ? glassBtn("sky")
                      : `${GLASS_BASE} bg-white/30 text-slate-700 ring-white/50`
                  }
                >
                  {r === "all" ? "전체" : ROLE_LABEL[r]} {counts[r] ?? 0}
                </button>
              ))}
            </div>
          </div>

          {msg && (
            <p className="mt-6 rounded-xl bg-red-50/80 px-4 py-2.5 text-center text-sm text-red-700">
              {msg}
            </p>
          )}

          {loading ? (
            <p className="mt-12 text-center text-slate-700">불러오는 중…</p>
          ) : filtered.length === 0 ? (
            <p className="glass mt-10 rounded-3xl px-6 py-12 text-center text-slate-700">
              조건에 맞는 부원이 없습니다.
            </p>
          ) : (
            <ul className="glass mt-10 divide-y divide-white/40 overflow-hidden rounded-3xl">
              {filtered.map((m) => {
                const who = m.name ?? m.nickname ?? `회원${m.id}`;
                const isMe = m.id === me?.id;
                return (
                  <li
                    key={m.id}
                    className="flex flex-col gap-3 px-6 py-5 transition-colors hover:bg-white/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">{who}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${ROLE_TONE[m.role]}`}
                        >
                          {ROLE_LABEL[m.role]}
                        </span>
                        {isMe && (
                          <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-xs font-semibold text-sky-900 ring-1 ring-inset ring-sky-300/60">
                            나
                          </span>
                        )}
                        {m.isDeprioritized && (
                          <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-semibold text-red-900 ring-1 ring-inset ring-red-300/60">
                            후순위
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-700">
                        {prettyPhone(m.phoneNumber)}
                        {(m.college || m.department) && (
                          <>
                            {" · "}
                            {[m.college, m.department].filter(Boolean).join(" ")}
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {/* 후순위 토글 — 임원진 이상 */}
                      <button
                        type="button"
                        disabled={busyId === m.id}
                        onClick={() =>
                          patch(
                            m.id,
                            "deprioritized",
                            { value: !m.isDeprioritized },
                            "후순위 변경"
                          )
                        }
                        className={`${
                          m.isDeprioritized ? glassBtn("amber") : glassBtn("slate")
                        } disabled:opacity-40`}
                      >
                        {m.isDeprioritized ? "후순위 해제" : "후순위 지정"}
                      </button>

                      {/* 역할 변경 — 관리자만 */}
                      {isAdmin && (
                        <select
                          value={m.role}
                          disabled={busyId === m.id}
                          onChange={(e) => changeRole(m, e.target.value as Role)}
                          className="rounded-full border border-white/60 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white disabled:opacity-40"
                        >
                          <option value="member">일반 부원</option>
                          <option value="executive">임원진</option>
                          <option value="admin">관리자</option>
                        </select>
                      )}
                    </div>
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
