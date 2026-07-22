import type { ReactNode } from "react";

// 홈·서브페이지가 공유하는 '엄청 투명한 유리' 카드.
// 값을 한 곳에서만 관리해 모든 페이지가 항상 동일하게 유지되도록 한다.
// (뒤 전역 물결 배경이 은은히 비치고, 양옆 엣지로 유리 두께감이 난다.)
const GLASS_CARD_CLASS =
  "relative mx-auto mb-10 mt-6 flex w-[92%] max-w-7xl scroll-mt-24 flex-col overflow-clip rounded-[2.5rem] bg-white/[0.02] ring-1 ring-inset ring-white/40 backdrop-blur-[3px] [box-shadow:inset_0_1.5px_0_rgba(255,255,255,0.85),inset_0_-1.5px_0_rgba(255,255,255,0.25),inset_2px_0_0_rgba(255,255,255,0.6),inset_-2px_0_0_rgba(255,255,255,0.5),inset_20px_0_30px_-20px_rgba(255,255,255,0.65),inset_-20px_0_30px_-20px_rgba(255,255,255,0.65),inset_10px_0_14px_-12px_rgba(8,47,73,0.18),inset_-10px_0_14px_-12px_rgba(8,47,73,0.18),0_24px_70px_-20px_rgba(8,47,73,0.45)]";

export default function GlassCard({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className={`${GLASS_CARD_CLASS} ${className}`}>
      {children}
    </div>
  );
}
