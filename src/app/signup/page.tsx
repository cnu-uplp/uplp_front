"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "회원가입에 실패했습니다.");
      }
      const data = await res.json(); // { accessToken, user }
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/");
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 pb-24 pt-32">
      <div className="glass w-full max-w-sm rounded-3xl p-8">
        <h1 className="text-center text-2xl font-bold tracking-tight text-sky-900">
          회원가입
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          UPLP SWIM 동아리원이 되어보세요 🌊
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="이름을 입력하세요"
              className="w-full rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              아이디
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder="사용할 아이디를 입력하세요"
              className="w-full rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="비밀번호를 입력하세요"
              className="w-full rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              비밀번호 확인
            </label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="비밀번호를 다시 입력하세요"
              className="w-full rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50/80 px-4 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-500 disabled:bg-slate-300"
          >
            {loading ? "가입 중…" : "회원가입"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-semibold text-sky-600 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
