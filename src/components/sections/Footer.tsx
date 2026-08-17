import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import TextReveal from "@/components/motion/TextReveal";

const NAV = [
  { href: "/", label: "홈" },
  { href: "/about", label: "동아리 소개" },
  { href: "/notice", label: "공지/일정" },
  { href: "/ticket", label: "정기수영" },
];

export default function Footer() {
  return (
    <footer className="mt-8 bg-sky-950 px-6 pb-10 pt-20 text-white">
      <div className="mx-auto max-w-5xl">
        {/* CTA — "함께 헤엄쳐요" */}
        <div className="flex flex-col gap-6 border-b border-white/10 pb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sky-300/80">함께 물살을 가르실 준비가 되셨나요?</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              <TextReveal text="지금 UPLP와 헤엄쳐요" stagger={0.06} />
            </h2>
          </div>
          <Reveal delay={0.2}>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 font-semibold text-sky-800 transition hover:scale-[1.03]"
            >
              카카오로 시작하기 <span aria-hidden>→</span>
            </Link>
          </Reveal>
        </div>

        {/* 하단 */}
        <div className="flex flex-col gap-8 pt-10 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold">
              <span>🏊</span> UPLP SWIM
            </div>
            <p className="mt-2 text-sm text-white/60">
              충남대학교 수영 동아리 · uplp.swim@gmail.com
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-white">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* 저작자 표시는 원문(영어) 그대로 둔다 — 라이선스 표기는 번역하지 않는다 */}
        <p className="mt-10 text-xs leading-relaxed text-white/40">
          Background photograph{" "}
          <a
            href="https://www.flickr.com/photos/globaledgephotography/45549155674/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white/70"
          >
            &ldquo;Life&apos;s a Bit Pink&rdquo;
          </a>{" "}
          © graham earnshaw ·{" "}
          <a
            href="https://creativecommons.org/licenses/by-nc-nd/2.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white/70"
          >
            CC BY-NC-ND 2.0
          </a>{" "}
          · Upscaled with the photographer&apos;s permission.
        </p>

        <p className="mt-3 text-xs leading-relaxed text-white/40">
          Liquid background based on{" "}
          <a
            href="https://github.com/PavelDoGreat/WebGL-Fluid-Simulation"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white/70"
          >
            WebGL-Fluid-Simulation
          </a>{" "}
          © 2017 Pavel Dobryakov · MIT License
        </p>

        <p className="mt-3 text-xs text-white/40">
          © 2026 UPLP Swimming Club, Chungnam National University. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
