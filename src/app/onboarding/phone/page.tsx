"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// 숫자만 남기고 최대 11자리 (하이픈 없이 저장·전송)
function digitsOnly(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

export default function PhoneOnboardingPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 로그인 상태 확인 + 닉네임 인사
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const user = JSON.parse(localStorage.getItem("user") ?? "{}");
      if (user?.nickname) setNickname(user.nickname);
    } catch {
      // 저장값 깨졌으면 인사 생략
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    const digits = phone.replace(/\D/g, "");
    if (!/^01\d{8,9}$/.test(digits)) {
      setError("올바른 휴대폰 번호를 입력해주세요. (예: 01012345678)");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/api/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phoneNumber: digits }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "전화번호 저장에 실패했습니다.");
      }
      const data = await res.json(); // 갱신된 user
      try {
        const prev = JSON.parse(localStorage.getItem("user") ?? "{}");
        localStorage.setItem("user", JSON.stringify({ ...prev, ...data, phoneNumber: digits }));
      } catch {
        localStorage.setItem("user", JSON.stringify({ phoneNumber: digits }));
      }
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 pb-24 pt-32">
      <div className="glass w-full max-w-sm rounded-3xl p-8">
        <h1 className="text-center text-2xl font-bold tracking-tight text-sky-900">
          연락처 입력
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          {nickname ? `${nickname}님, 환영해요! ` : ""}티켓·훈련 안내를 위해 연락처가 필요해요.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              휴대폰 번호
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(digitsOnly(e.target.value))}
              required
              autoComplete="tel"
              placeholder="01012345678"
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
            {loading ? "저장 중…" : "시작하기"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.replace("/")}
          className="mt-4 w-full text-center text-xs text-slate-400 transition hover:text-slate-600"
        >
          나중에 입력할게요
        </button>
      </div>
    </div>
  );
}
