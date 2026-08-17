"use client";

import { useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// 만료 안내는 페이지 이동 전까지 딱 한 번만 띄운다.
// 화면 하나가 API를 여러 번 부르므로(내 정보·목록·명단…) 만료된 순간 401이 동시에
// 여러 개 돌아온다. 막지 않으면 경고창이 그 수만큼 겹쳐 뜬다.
let notified = false;

/** 로그인 화면으로 되돌릴 필요가 없는 경로 (되돌리면 무한 반복이 된다) */
const EXEMPT = ["/login", "/onboarding"];

/**
 * 토큰이 만료되면 안내하고 로그인 화면으로 보낸다.
 *
 * 전에는 API가 401을 주면 각 화면이 제각각 "인증이 필요합니다" 같은 문구만 띄워서,
 * 회원들은 그게 만료인지 고장인지 알 수 없었다.
 *
 * 호출부가 수십 군데라 하나씩 고치는 대신 `fetch`를 한 번 감싼다.
 * 우리 API로 나가는 요청만 들여다보고, 401이면 저장된 토큰을 지우고 로그인으로 보낸다.
 * (Next 내부 요청이나 외부 주소는 건드리지 않는다)
 */
export default function SessionExpiryGuard() {
  useEffect(() => {
    const origin = window.fetch;

    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const res = await origin(...args);

      // 우리 API 응답이 아니면 그대로 통과
      const url =
        typeof args[0] === "string"
          ? args[0]
          : args[0] instanceof Request
            ? args[0].url
            : String(args[0]);
      if (!API_URL || !url.startsWith(API_URL)) return res;

      // 서버가 유효기간을 밀어주며 새 토큰을 함께 내려보낸다(슬라이딩 만료).
      // 401 검사보다 위에 둔다 — 아래에 두면 정상 응답이 먼저 return돼서 실행되지 않는다.
      const fresh = res.headers.get("X-Refreshed-Token");
      if (fresh) localStorage.setItem("accessToken", fresh);

      if (res.status !== 401) return res;

      // 애초에 로그인한 적이 없으면 '만료'가 아니다 — 비로그인 상태로 둘러보는 중일 뿐
      if (!localStorage.getItem("accessToken")) return res;

      if (!notified) {
        notified = true;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.alert("인증이 만료되었습니다. 다시 로그인해주세요.");
        if (!EXEMPT.some((p) => window.location.pathname.startsWith(p))) {
          // router.replace 대신 통째로 이동한다 — 남아 있던 화면 상태까지 확실히 비운다
          window.location.href = "/login";
        } else {
          notified = false;
        }
      }
      return res;
    };

    return () => {
      window.fetch = origin;
    };
  }, []);

  return null;
}
