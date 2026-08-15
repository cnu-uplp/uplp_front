"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * 카카오 로그인 직후 오는 정보 입력 화면.
 *
 * 폼 자체는 OnboardingForm 하나를 쓴다. 로그인은 했는데 정보를 안 넣은 채
 * 다른 페이지로 간 경우는 OnboardingGate 가 같은 폼을 모달로 띄워 막는다.
 */
export default function PhoneOnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) router.replace("/login");
  }, [router]);

  return (
    <div className="flex flex-1 items-center justify-center px-6 pb-24 pt-32">
      <div className="glass w-full max-w-sm rounded-3xl p-8">
        <OnboardingForm onDone={() => router.replace("/")} />
      </div>
    </div>
  );
}
