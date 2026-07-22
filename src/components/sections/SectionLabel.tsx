import { Reveal } from "@/components/motion/Reveal";

/**
 * Fuel 구조의 섹션 헤더 라벨: "◆ (01)  소개  © 2026" 형태.
 * 형태(넘버링 + 카테고리 + 연도)만 차용하고 우리 톤으로 구성한다.
 */
export default function SectionLabel({
  no,
  title,
}: {
  no: string;
  title: string;
}) {
  return (
    <Reveal>
      <div className="flex items-center gap-4 border-b border-sky-200/60 pb-3 text-sm text-sky-700">
        <span className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-2 w-2 rotate-45 bg-sky-500" />
          {no}
        </span>
        <span className="font-medium">{title}</span>
        <span className="ml-auto text-slate-400">© 2026</span>
      </div>
    </Reveal>
  );
}
