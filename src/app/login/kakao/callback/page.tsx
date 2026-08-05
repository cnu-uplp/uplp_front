"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// 카카오 인증 후 redirect 되는 콜백 페이지.
// URL 쿼리의 인가 코드(code)를 백엔드로 넘겨 앱 JWT 로 교환한다.
export default function KakaoCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const kakaoError = params.get("error");

    if (kakaoError) {
      setError("카카오 로그인이 취소되었습니다.");
      return;
    }
    if (!code) {
      setError("인가 코드가 없습니다.");
      return;
    }

    (async () => {
      try {
        const redirectUri = `${window.location.origin}/login/kakao/callback`;
        const res = await fetch(`${API_URL}/api/auth/kakao`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, redirectUri }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || "카카오 로그인에 실패했습니다.");
        }
        const data = await res.json(); // { accessToken, user }
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        // 전화번호가 아직 없으면(최초 로그인) 연락처 입력 온보딩으로, 있으면 홈으로
        if (!data.user?.phoneNumber) {
          router.replace("/onboarding/phone");
        } else {
          router.replace("/");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
      }
    })();
  }, [router]);

  return (
    <div className="flex flex-1 items-center justify-center px-6 pb-24 pt-32">
      <div className="glass w-full max-w-sm rounded-3xl p-8 text-center">
        {error ? (
          <>
            <h1 className="text-lg font-bold text-sky-900">로그인 실패</h1>
            <p className="mt-2 text-sm text-slate-600">{error}</p>
            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="mt-6 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500"
            >
              로그인으로 돌아가기
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
            <p className="mt-4 text-sm text-slate-600">카카오 로그인 처리 중…</p>
          </>
        )}
      </div>
    </div>
  );
}
