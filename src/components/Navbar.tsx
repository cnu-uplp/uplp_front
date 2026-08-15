"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type SessionUser = { nickname?: string; name?: string };

// 임원진 이상만 보이는 메뉴. 노출 여부는 서버(/api/users/me)의 role로 판정한다
// — localStorage는 사용자가 고칠 수 있으므로 신뢰하지 않는다.
// (설령 메뉴를 억지로 띄워도 /api/users 가 403을 낸다.)
const STAFF_ITEM = { href: "/members", label: "부원 관리" };
const STAFF_ROLES = ["executive", "admin"];
// 온보딩 강제에서 제외할 경로 — 여기서까지 되돌리면 무한 리다이렉트가 된다.
const ONBOARDING_EXEMPT = ["/onboarding", "/login"];

// 상단바 유리 버튼 — 배경 사진 위든 유리 네비 위든 같은 모양으로 둔다.
//
// ⚠️ [text-shadow:none] 이 핵심이다.
// 부모 <nav>가 흰 글자용으로 진한 남색 그림자를 걸어두는데, 그게 버튼 글자에도 상속돼
// '진한 글자 + 진한 그림자'가 겹치며 번져 보였다. 버튼 안에서는 그림자를 꺼야 또렷하다.
//
// 유리를 조금 더 채우고(70%) 블러를 키워(16px) 뒤 사진이 균일한 면으로 깔리게 한 뒤,
// 그 위에 sky-900 글자를 얹는다 — 950은 배경 대비가 지나쳐 딱딱해 보였다.
const NAV_GLASS =
  "rounded-full px-5 py-2 text-sm font-bold tracking-tight backdrop-blur-[16px] backdrop-saturate-150 " +
  "ring-1 ring-inset transition [text-shadow:none] " +
  "bg-white/70 text-sky-900 ring-white/90 hover:bg-white/85 hover:-translate-y-px active:translate-y-0 " +
  "[box-shadow:inset_0_1px_0_rgba(255,255,255,0.95),0_4px_14px_-4px_rgba(8,47,73,0.3)]";

// 모바일 상단바에 항상 남기는 메뉴 — 좁은 화면에서 글자가 겹치지 않게 2개만 둔다.
const PRIMARY_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/about", label: "동아리 소개" },
];
// 데스크톱 상단바에는 나오고, 모바일에서는 ≡ 드로어로 내려가는 항목
const SECONDARY_ITEMS = [
  { href: "/notice", label: "공지/일정" },
  { href: "/ticket", label: "정기수영" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false); // 모바일 드로어 열림 여부
  const [user, setUser] = useState<SessionUser | null>(null); // 로그인 유저(없으면 null)
  const [isStaff, setIsStaff] = useState(false); // 임원진 이상 여부 (서버 판정)
  const [pending, setPending] = useState(0);    // 승인 대기 인원 (임원진에게만)

  // 로그인 상태 읽기 — 마운트 + 페이지 이동마다 (로그인 직후 홈으로 오면 인사 반영)
  useEffect(() => {
    try {
      const token = localStorage.getItem("accessToken");
      const raw = localStorage.getItem("user");
      setUser(token && raw ? (JSON.parse(raw) as SessionUser) : null);
    } catch {
      setUser(null);
    }
  }, [pathname]);

  // 임원진 메뉴 노출 여부 — 서버에 직접 물어본다
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsStaff(false);
      return;
    }
    let alive = true;
    fetch(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => {
        if (!alive || !me) return;
        // 가입 정보를 다 안 넣은 사람은 어느 페이지에 있든 온보딩으로 되돌린다.
        // 온보딩 화면에 '건너뛰기'를 두지 않는 것만으로는, 주소를 직접 쳐서
        // 빠져나가는 경로가 남는다. 실명·학번이 없으면 대관 명단도 승인 판단도 불가능하다.
        if (!me.name || !me.admissionYear) {
          if (!ONBOARDING_EXEMPT.some((p) => pathname.startsWith(p))) {
            router.replace("/onboarding/phone");
          }
          return;
        }
        const staff = STAFF_ROLES.includes(me?.role);
        setIsStaff(staff);
        if (!staff) return;
        // 승인 대기 인원 — 배지가 없으면 임원진이 대기자를 모른 채 방치하게 된다.
        return fetch(`${API_URL}/api/users/pending-count`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (alive) setPending(d?.count ?? 0);
          });
      })
      .catch(() => {
        if (alive) setIsStaff(false);
      });
    return () => {
      alive = false;
    };
  }, [pathname, router]);

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    setOpen(false);
    router.push("/");
  }

  // 스크롤 위치에 따라 투명 ↔ 유리 배경 전환
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 페이지 이동 시 드로어 자동 닫힘
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // 열려 있을 때: Escape 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // 홈(/)에는 히어로 영상이 있어 맨 위에서 흰색 텍스트가 어울리지만,
  // 서브 페이지는 밝은 배경이라 항상 유리 배경 + 어두운 텍스트여야 글자가 보인다.
  const isHome = pathname === "/";
  const solid = scrolled || !isHome; // 유리 배경 여부
  const light = isHome && !scrolled; // 흰색 텍스트 여부

  const itemClass = (href: string, base: string) => {
    const active = pathname === href;
    return `${base} ${
      active
        ? light
          ? "font-semibold opacity-100"
          : "font-semibold text-sky-700 opacity-100"
        : "opacity-70 hover:opacity-100"
    }`;
  };

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        solid ? "glass-thin py-2.5" : "bg-transparent py-4"
      }`}
    >
      {/* 홈 최상단(투명): 밝은 물 사진에 글자가 묻히지 않도록 상단 그늘 + 진한 글자 그림자 */}
      {light && (
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-sky-950/60 via-sky-950/25 to-transparent" />
      )}
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 ${
          light
            ? "[text-shadow:0_1px_2px_rgba(8,47,73,0.9),0_2px_12px_rgba(8,47,73,0.7)]"
            : ""
        }`}
      >
        {/* 로고 */}
        <Link
          href="/"
          className={`flex shrink-0 items-center gap-2 text-base font-bold tracking-tight transition-colors sm:gap-2.5 ${
            light ? "text-white" : "text-sky-800"
          }`}
        >
          <Image
            src="/uplp_icon.jpeg"
            alt="UPLP 로고"
            width={40}
            height={40}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-white/70 sm:h-9 sm:w-9"
            priority
          />
          <span className="hidden sm:inline">UPLP SWIM</span>
        </Link>

        {/* 메뉴 — 홈·동아리 소개·공지/일정은 모바일에서도 노출, 티케팅은 데스크톱만 */}
        <ul
          className={`flex items-center gap-3 text-xs font-medium sm:gap-7 sm:text-sm ${
            light ? "text-white" : "text-slate-600"
          }`}
        >
          {PRIMARY_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={itemClass(item.href, "transition-opacity")}
              >
                {item.label}
              </Link>
            </li>
          ))}
          {/* 공지·정기수영: 데스크톱 상단바에만 (모바일은 드로어로) */}
          {SECONDARY_ITEMS.map((item) => (
            <li key={item.href} className="hidden lg:block">
              <Link
                href={item.href}
                className={itemClass(item.href, "transition-opacity")}
              >
                {item.label}
              </Link>
            </li>
          ))}
          {/* 부원 관리: 정기수영 옆 — 임원진 이상에게만 */}
          {isStaff && (
            <li className="hidden lg:block">
              <Link
                href={STAFF_ITEM.href}
                className={itemClass(STAFF_ITEM.href, "inline-flex items-center gap-1.5 transition-opacity")}
              >
                {STAFF_ITEM.label}
                {pending > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[0.68rem] font-bold text-white [text-shadow:none]">
                    {pending}
                  </span>
                )}
              </Link>
            </li>
          )}
        </ul>

        <div className="flex shrink-0 items-center gap-2">
          {/* 로그인 상태 — 데스크톱 상단바 (모바일은 드로어로) */}
          {user ? (
            <div className="hidden items-center gap-3 lg:flex">
              <span
                className={`text-sm font-bold ${
                  light
                    ? "text-white [text-shadow:0_1px_3px_rgba(8,47,73,0.55)]"
                    : "text-sky-950"
                }`}
              >
                안녕하세요, {user.name ?? user.nickname ?? "회원"}님
              </span>
              <button
                type="button"
                onClick={logout}
                className={NAV_GLASS}
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className={`hidden lg:inline-flex ${NAV_GLASS}`}
            >
              로그인
            </Link>
          )}

          {/* 햄버거 — 모바일 전용 */}
          <button
            type="button"
            aria-label="메뉴 열기"
            aria-expanded={open}
            aria-controls="mobile-drawer"
            onClick={() => setOpen(true)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition lg:hidden ${
              light ? "text-white hover:bg-white/15" : "text-sky-800 hover:bg-sky-100"
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* ── 모바일 드로어 (오른쪽 슬라이드) ───────────────── */}
      {/* 배경 딤 */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[60] bg-sky-950/40 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />
      {/* 패널 */}
      <aside
        id="mobile-drawer"
        className={`fixed right-0 top-0 z-[61] flex h-full w-64 max-w-[80vw] flex-col gap-1 bg-white/95 p-5 shadow-2xl backdrop-blur transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-bold text-sky-800">메뉴</span>
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={() => setOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-sky-800 transition hover:bg-sky-100"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* 상단바에서 내려온 메뉴 — 모바일에서는 여기가 유일한 진입점 */}
        {SECONDARY_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`rounded-xl px-4 py-3 text-base font-medium transition ${
              pathname === item.href
                ? "bg-sky-50 font-semibold text-sky-700"
                : "text-slate-700 hover:bg-sky-50"
            }`}
          >
            {item.label}
          </Link>
        ))}

        {/* 부원 관리 — 임원진 이상에게만 */}
        {isStaff && (
          <Link
            href={STAFF_ITEM.href}
            onClick={() => setOpen(false)}
            className={`rounded-xl px-4 py-3 text-base font-medium transition ${
              pathname === STAFF_ITEM.href
                ? "bg-sky-50 font-semibold text-sky-700"
                : "text-slate-700 hover:bg-sky-50"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {STAFF_ITEM.label}
              {pending > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[0.68rem] font-bold text-white">
                  {pending}
                </span>
              )}
            </span>
          </Link>
        )}

        {/* 로그인 상태 — 링크 목록과 떨어뜨려 드로어 맨 아래에 붙인다
            (위에 몰아두면 아래가 텅 비어 메뉴가 잘린 것처럼 보인다) */}
        <div className="mt-auto border-t border-slate-200 pt-4">
        {user ? (
          <>
            <div className="rounded-xl bg-sky-50 px-4 py-3 text-center text-sm font-semibold text-sky-800">
              안녕하세요, {user.name ?? user.nickname ?? "회원"}님
            </div>
            <button
              type="button"
              onClick={logout}
              className="mt-2 block w-full rounded-full bg-slate-500/15 px-4 py-3 text-center text-base font-bold text-slate-800 ring-1 ring-inset ring-slate-300/60 backdrop-blur-md transition hover:bg-slate-500/25 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.8)]"
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="block w-full rounded-full bg-sky-500/25 px-4 py-3 text-center text-base font-bold text-sky-950 ring-1 ring-inset ring-sky-300/60 backdrop-blur-md transition hover:bg-sky-500/35 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.8)]"
          >
            로그인
          </Link>
        )}
        </div>
      </aside>
    </header>
  );
}
