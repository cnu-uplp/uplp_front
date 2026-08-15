import type { CSSProperties } from "react";

type Props = {
  text: string;
  className?: string;
  /** 글자 사이 시차(초) — 클수록 파동이 길게 훑고 지나간다 */
  stagger?: number;
  /** 전체 시작 지연(초) */
  delay?: number;
};

/**
 * 글자를 하나씩 쪼개 시차를 두고 위아래로 흔든다 — 파동이 글자를 훑고 지나가는 모션.
 *
 * 애니메이션 자체는 globals.css의 `--animate-char-wave`(@theme)가 담당하고,
 * 여기서는 글자별 animation-delay만 준다.
 * 공백은 흔들 필요가 없으므로 애니메이션 없이 그대로 둔다.
 *
 * 서버 컴포넌트로 동작한다(상태·이벤트 없음).
 */
export default function WaveText({
  text,
  className,
  stagger = 0.075,
  delay = 0,
}: Props) {
  return (
    <span className={className} aria-label={text}>
      {Array.from(text).map((ch, i) =>
        ch === " " ? (
          <span key={i} aria-hidden>
            &nbsp;
          </span>
        ) : (
          <span
            key={i}
            aria-hidden
            className="inline-block animate-char-wave"
            style={
              { animationDelay: `${delay + i * stagger}s` } as CSSProperties
            }
          >
            {ch}
          </span>
        ),
      )}
    </span>
  );
}
