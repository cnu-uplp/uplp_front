"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SessionUser = { nickname?: string; name?: string };

// 항상 상단바에 노출되는 메뉴 (모바일 포함)
const PRIMARY_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/about", label: "동아리 소개" },
  { href: "/notice", label: "공지/일정" },
];
// 데스크톱은 상단바, 모바일은 ≡ 드로어 안으로 들어가는 항목
const TICKET_ITEM = { href: "/ticket", label: "정기수영" };

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false); // 모바일 드로어 열림 여부
  const [user, setUser] = useState<SessionUser | null>(null); // 로그인 유저(없으면 null)

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
          {/* 티케팅: 데스크톱 상단바에만 (모바일은 드로어로) */}
          <li className="hidden sm:block">
            <Link
              href={TICKET_ITEM.href}
              className={itemClass(TICKET_ITEM.href, "transition-opacity")}
            >
              {TICKET_ITEM.label}
            </Link>
          </li>
        </ul>

        <div className="flex shrink-0 items-center gap-2">
          {/* 로그인 상태 — 데스크톱 상단바 (모바일은 드로어로) */}
          {user ? (
            <div className="hidden items-center gap-3 sm:flex">
              <span
                className={`text-sm font-semibold ${
                  light ? "text-white" : "text-sky-800"
                }`}
              >
                안녕하세요, {user.nickname ?? user.name ?? "회원"}님
              </span>
              <button
                type="button"
                onClick={logout}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  light
                    ? "bg-white/20 text-white ring-1 ring-white/50 hover:bg-white/30"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className={`hidden rounded-full px-5 py-2 text-sm font-semibold transition sm:inline-flex ${
                light
                  ? "bg-white/90 text-sky-700 hover:bg-white"
                  : "bg-sky-600 text-white hover:bg-sky-500"
              }`}
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
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition sm:hidden ${
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
        className={`fixed inset-0 z-[60] bg-sky-950/40 transition-opacity duration-300 sm:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />
      {/* 패널 */}
      <aside
        id="mobile-drawer"
        className={`fixed right-0 top-0 z-[61] flex h-full w-64 max-w-[80vw] flex-col gap-1 bg-white/95 p-5 shadow-2xl backdrop-blur transition-transform duration-300 sm:hidden ${
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

        {/* 티케팅 */}
        <Link
          href={TICKET_ITEM.href}
          onClick={() => setOpen(false)}
          className={`rounded-xl px-4 py-3 text-base font-medium transition ${
            pathname === TICKET_ITEM.href
              ? "bg-sky-50 font-semibold text-sky-700"
              : "text-slate-700 hover:bg-sky-50"
          }`}
        >
          {TICKET_ITEM.label}
        </Link>

        {/* 로그인 상태 */}
        {user ? (
          <>
            <div className="mt-3 rounded-xl bg-sky-50 px-4 py-3 text-center text-sm font-semibold text-sky-800">
              안녕하세요, {user.nickname ?? user.name ?? "회원"}님
            </div>
            <button
              type="button"
              onClick={logout}
              className="mt-2 rounded-full bg-slate-100 px-4 py-3 text-center text-base font-semibold text-slate-600 transition hover:bg-slate-200"
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-3 rounded-full bg-sky-600 px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-sky-500"
          >
            로그인
          </Link>
        )}
      </aside>
    </header>
  );
}
