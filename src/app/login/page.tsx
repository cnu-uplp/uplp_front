"use client";

// 카카오 REST API 키 (카카오 개발자 콘솔 > 앱 키 > REST API 키).
// authorize URL에 노출되는 값이라 NEXT_PUBLIC_ 으로 둔다. (client secret 은 백엔드에만!)
const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID ?? "";
const KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize";

export default function LoginPage() {
  function loginWithKakao() {
    if (!KAKAO_CLIENT_ID) {
      alert("카카오 로그인 설정(NEXT_PUBLIC_KAKAO_CLIENT_ID)이 필요합니다.");
      return;
    }
    // 콜백 URL — 카카오 개발자 콘솔의 'Redirect URI'에 동일하게 등록되어 있어야 함
    const redirectUri = `${window.location.origin}/login/kakao/callback`;
    const params = new URLSearchParams({
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      // 닉네임만 요청 (프로필 사진 제외). 이메일 등 필요해지면 "profile_nickname,account_email" 처럼 추가.
      scope: "profile_nickname",
    });
    window.location.href = `${KAKAO_AUTH_URL}?${params.toString()}`;
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 pb-24 pt-32">
      <div className="glass w-full max-w-sm rounded-3xl p-8">
        <h1 className="text-center text-2xl font-bold tracking-tight text-sky-900">
          로그인
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          UPLP SWIM에 오신 것을 환영합니다 🏊
        </p>

        <button
          type="button"
          onClick={loginWithKakao}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] px-4 py-3 text-sm font-semibold text-[#191600] shadow-sm transition hover:brightness-95"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 3C6.9 3 2.75 6.2 2.75 10.15c0 2.5 1.68 4.7 4.2 5.98-.14.5-.9 3.1-.93 3.3 0 0-.02.16.09.22.1.06.23.01.23.01.3-.04 3.44-2.25 3.98-2.63.55.08 1.11.12 1.68.12 5.1 0 9.25-3.2 9.25-7.15S17.1 3 12 3Z"
              fill="#191600"
            />
          </svg>
          카카오로 로그인
        </button>

        <p className="mt-6 text-center text-xs text-slate-400">
          카카오 계정으로 간편하게 시작하세요. 최초 로그인 시 자동으로 가입됩니다.
        </p>
      </div>
    </div>
  );
}
