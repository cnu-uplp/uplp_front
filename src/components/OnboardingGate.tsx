"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import OnboardingForm from "@/components/OnboardingForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// 이 경로들에서는 모달을 띄우지 않는다.
//  /onboarding — 같은 폼이 페이지로 이미 떠 있다 (폼이 두 번 겹친다)
//  /login      — 로그인 처리 중에는 아직 정보가 없는 게 정상이다
const EXEMPT = ["/onboarding", "/login"];

/**
 * 가입 정보를 다 넣지 않은 회원을 어느 페이지에서든 모달로 막는다.
 *
 * 예전에는 온보딩 페이지로 리다이렉트했는데, 원래 가려던 화면이 한 번 그려졌다가
 * 튕겨나가서 어수선했다. 모달은 있던 자리를 유지한 채 입력만 받고,
 * 저장되면 그 자리에서 닫힌다.
 *
 * 판정은 '실명 + 학번'으로 한다 — 두 소속(재학생·졸업생) 모두 필수인 값이다.
 * 전화번호로 판정하면 안 된다. 졸업생은 연락처를 아예 받지 않아서 영원히 걸린다.
 */
export default function OnboardingGate() {
  const pathname = usePathname();
  const [needed, setNeeded] = useState(false);

  const check = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setNeeded(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setNeeded(false);
        return;
      }
      const me = await res.json();
      setNeeded(!me?.name || !me?.admissionYear);
    } catch {
      // 서버가 안 뜬 상태에서 사이트를 막아버리면 아무것도 못 한다 — 조용히 넘어간다
      setNeeded(false);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check, pathname]);

  // 모달이 떠 있는 동안 뒤 배경이 스크롤되지 않게 잠근다
  useEffect(() => {
    if (!needed) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [needed]);

  if (!needed || EXEMPT.some((p) => pathname.startsWith(p))) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="가입 정보 입력"
      // 닫기 버튼도, 바깥 클릭으로 닫기도 두지 않는다. 정보 입력이 가입의 마지막 단계다.
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-sky-950/45 px-6 py-16 backdrop-blur-sm"
    >
      <div className="glass w-full max-w-sm rounded-3xl p-8 shadow-2xl">
        <OnboardingForm onDone={() => setNeeded(false)} />
      </div>
    </div>
  );
}
