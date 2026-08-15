"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type Membership = "student" | "alumni";

// 가입은 재학생·졸업생만 받는다 (외부인 가입 경로는 두지 않는다).
//   재학생  이름 + 학번 + 전화번호 + 단과대·학과   (대관 명단에 들어감)
//   졸업생  이름 + 학번 + 단과대·학과(재학 당시)   (신청 불가라 연락처 불필요)
const MEMBERSHIP_OPTIONS: { value: Membership; label: string; desc: string }[] = [
  { value: "student", label: "재학생", desc: "충남대 재학 중인 동아리 부원" },
  { value: "alumni", label: "졸업생 (OB)", desc: "졸업한 동아리 선배" },
];

// 숫자만 남기고 최대 11자리 (하이픈 없이 저장·전송)
function digitsOnly(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

export default function PhoneOnboardingPage() {
  const router = useRouter();
  // 소속 — 이걸 먼저 고르면 아래 입력 항목이 달라진다
  const [membership, setMembership] = useState<Membership>("student");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [year, setYear] = useState("");   // 학번 뒤 2자리
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
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
      // 이미 저장된 값이 있으면 채워둔다 (재입력 시 그대로 보이도록)
      if (user?.membership) setMembership(user.membership as Membership);
      if (user?.name) setName(user.name);
      if (user?.admissionYear) setYear(user.admissionYear);
      if (user?.college) setCollege(user.college);
      if (user?.department) setDepartment(user.department);
      if (user?.phoneNumber) setPhone(user.phoneNumber);
    } catch {
      // 저장값 깨졌으면 인사 생략
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    const digits = phone.replace(/\D/g, "");
    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    if (!/^\d{2}$/.test(year)) {
      setError("학번을 두 자리로 입력해주세요. (예: 21)");
      return;
    }
    if (membership === "student" && !/^01\d{8,9}$/.test(digits)) {
      setError("올바른 휴대폰 번호를 입력해주세요. (예: 01012345678)");
      return;
    }
    if (!college.trim() || !department.trim()) {
      setError("단과대와 학과를 입력해주세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const payload = {
        membership,
        name: name.trim(),
        admissionYear: year,
        // 학생만 연락처를 보낸다. 졸업생·외부인은 신청을 못 하므로 수집하지 않는다.
        phoneNumber: membership === "student" ? digits : null,
        college: college.trim(),
        department: department.trim(),
      };
      const res = await fetch(`${API_URL}/api/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "정보 저장에 실패했습니다.");
      }
      const data = await res.json(); // 갱신된 user
      try {
        const prev = JSON.parse(localStorage.getItem("user") ?? "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({ ...prev, ...data, ...payload })
        );
      } catch {
        localStorage.setItem("user", JSON.stringify(payload));
      }
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white";

  return (
    <div className="flex flex-1 items-center justify-center px-6 pb-24 pt-32">
      <div className="glass w-full max-w-sm rounded-3xl p-8">
        <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          정보 입력
        </h1>
        <p className="mt-2 text-center text-sm font-medium text-slate-800">
          {nickname ? `${nickname}님, 환영해요! ` : ""}정기수영·훈련 안내와 부원 관리를
          위해 정보가 필요해요.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          {/* 소속 — 이걸 고르면 아래 입력 항목이 달라진다 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              어떤 분이신가요?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MEMBERSHIP_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setMembership(o.value)}
                  className={`rounded-xl px-2 py-2.5 text-sm font-semibold ring-1 ring-inset transition ${
                    membership === o.value
                      ? "bg-sky-500/25 text-sky-900 ring-sky-400/70"
                      : "bg-white/60 text-slate-700 ring-white/70 hover:bg-white/80"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-slate-600">
              {MEMBERSHIP_OPTIONS.find((o) => o.value === membership)?.desc}
              {membership !== "student" && " · 정기수영 신청은 재학생만 가능합니다."}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="예: 홍길동"
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-slate-600">
              레인대관 신청서에 그대로 들어가니 실명으로 입력해주세요.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              학번
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 2))}
              required
              placeholder="21"
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-slate-600">
              뒤 두 자리만 입력해주세요. 이름 옆에{" "}
              <b className="text-slate-800">
                {name.trim() || "김철수"} {year || "21"}
                {membership === "alumni" ? " OB" : ""}
              </b>{" "}
              처럼 표시됩니다.
            </p>
          </div>

          {/* 휴대폰 번호 — 재학생만. 대관 명단에 들어가므로 신청 가능한 사람만 받는다 */}
          {membership === "student" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-800">
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
                className={inputClass}
              />
            </div>
          )}

          {/* 단과대·학과 — 졸업생은 '재학 당시' 기준 */}
          {(
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-800">
                  단과대
                  {membership === "alumni" && (
                    <span className="font-normal text-slate-600"> (재학 당시)</span>
                  )}
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  required
                  placeholder="예: 공과대학"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-800">
                  학과
                  {membership === "alumni" && (
                    <span className="font-normal text-slate-600"> (재학 당시)</span>
                  )}
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  placeholder="예: 컴퓨터공학과"
                  className={inputClass}
                />
              </div>
            </>
          )}

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
          className="mt-4 w-full text-center text-xs text-slate-700 transition hover:text-slate-900"
        >
          나중에 입력할게요
        </button>
      </div>
    </div>
  );
}
