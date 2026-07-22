"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/about", label: "동아리 소개" },
  { href: "/notice", label: "공지/일정" },
  { href: "/ticket", label: "티케팅" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // 스크롤 위치에 따라 투명 ↔ 유리 배경 전환
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 홈(/)에는 히어로 영상이 있어 맨 위에서 흰색 텍스트가 어울리지만,
  // 서브 페이지는 밝은 배경이라 항상 유리 배경 + 어두운 텍스트여야 글자가 보인다.
  const isHome = pathname === "/";
  const solid = scrolled || !isHome; // 유리 배경 여부
  const light = isHome && !scrolled; // 흰색 텍스트 여부

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        solid ? "glass-thin py-2.5" : "bg-transparent py-4"
      }`}
    >
      {/* 홈 최상단(투명): 이미지는 밝게 두고, 아주 옅은 상단 그늘 + 글자 그림자로만 가독성 확보 */}
      {light && (
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-sky-950/25 to-transparent" />
      )}
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between px-6 ${
          light ? "[text-shadow:0_1px_10px_rgba(8,47,73,0.5)]" : ""
        }`}
      >
        {/* 로고 */}
        <Link
          href="/"
          className={`flex items-center gap-2.5 text-base font-bold tracking-tight transition-colors ${
            light ? "text-white" : "text-sky-800"
          }`}
        >
          <Image
            src="/uplp_icon.jpeg"
            alt="UPLP 로고"
            width={40}
            height={40}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-white/70"
            priority
          />
          UPLP SWIM<sup className="text-[0.6em]">®</sup>
        </Link>

        {/* 넘버링 메뉴 (Fuel 형태 차용) */}
        <ul
          className={`hidden items-center gap-7 text-sm font-medium sm:flex ${
            light ? "text-white/90" : "text-slate-600"
          }`}
        >
          {NAV_ITEMS.map((item, i) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-1.5 transition-opacity hover:opacity-100 ${
                    active ? "opacity-100" : "opacity-70"
                  }`}
                >
                  <span
                    className={`text-[0.7em] tabular-nums ${
                      light ? "text-white/50" : "text-sky-400"
                    }`}
                  >
                    0{i + 1}
                  </span>
                  <span
                    className={
                      active
                        ? light
                          ? "font-semibold"
                          : "font-semibold text-sky-700"
                        : ""
                    }
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* 로그인 */}
        <Link
          href="/login"
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            light
              ? "bg-white/90 text-sky-700 hover:bg-white"
              : "bg-sky-600 text-white hover:bg-sky-500"
          }`}
        >
          로그인
        </Link>
      </nav>
    </header>
  );
}
