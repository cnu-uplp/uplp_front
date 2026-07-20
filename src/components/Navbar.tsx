"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/about", label: "동아리 소개" },
  { href: "/notice", label: "공지/일정" },
  { href: "/ticket", label: "티케팅" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-5xl">
      <nav className="glass-thin flex items-center justify-between rounded-full px-4 py-2.5">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-sky-800"
        >
          <Image
            src="/uplp_icon.jpeg"
            alt="UPLP 로고"
            width={56}
            height={56}
            className="h-11 w-11 rounded-full object-cover ring-2 ring-white/70"
            priority
          />
          UPLP SWIM
        </Link>
        <ul className="flex items-center gap-1 text-sm font-medium text-slate-600">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`rounded-full px-3.5 py-2 transition-all hover:bg-white/50 hover:text-sky-700 ${
                    active
                      ? "bg-white/70 font-semibold text-sky-700 shadow-sm"
                      : ""
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              href="/login"
              className="ml-1 rounded-full bg-sky-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-sky-500"
            >
              로그인
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
