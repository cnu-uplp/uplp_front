"use client";

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
    <header className="sticky top-0 z-50 border-b border-sky-100 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-sky-700">
          <span className="text-2xl">🏊</span>
          UPLP SWIM
        </Link>
        <ul className="flex items-center gap-6 text-sm font-medium text-slate-600">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`transition-colors hover:text-sky-600 ${
                    active ? "text-sky-700 font-semibold" : ""
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
