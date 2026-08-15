import type { ReactNode } from "react";

/**
 * 마크다운의 안전한 부분집합 렌더러.
 *
 * 라이브러리를 쓰지 않고 직접 만든 이유:
 *  - 임원진이 쓰는 건 제목·목록·굵게·링크 정도지, 표나 각주까지는 필요 없다.
 *  - `dangerouslySetInnerHTML`을 쓰지 않고 React 엘리먼트로 조립하므로
 *    본문에 <script>를 적어도 그냥 글자로 보인다. 편집 권한이 임원진이라
 *    악의적 입력을 걱정할 상황은 아니지만, 공개 페이지에 그대로 나가는 값이라
 *    구조적으로 막아두는 편이 낫다.
 *
 * 지원 문법
 *   ## 제목 / ### 소제목
 *   - 목록 / 1. 번호 목록
 *   > 인용
 *   **굵게**  *기울임*  `코드`  [링크](https://…)
 *   빈 줄로 문단 구분, 문단 안 줄바꿈은 그대로 유지
 */

// 인라인 문법을 앞에서부터 하나씩 잘라 React 노드로 바꾼다.
// 정규식 하나로 전체를 치환하면 중첩·이스케이프에서 어긋나기 쉬워 순차 소비 방식을 쓴다.
const INLINE = [
  { re: /^\*\*([^*]+)\*\*/, node: (m: string, k: number) => <strong key={k}>{m}</strong> },
  { re: /^\*([^*]+)\*/, node: (m: string, k: number) => <em key={k}>{m}</em> },
  {
    re: /^`([^`]+)`/,
    node: (m: string, k: number) => (
      <code key={k} className="rounded bg-sky-900/8 px-1.5 py-0.5 text-[0.9em]">
        {m}
      </code>
    ),
  },
];

// [텍스트](주소) — 주소는 http/https/mailto만 허용한다.
// javascript: 스킴을 막기 위한 것이다(허용하면 링크 클릭이 코드 실행이 된다).
const LINK = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/;

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = text;
  let buf = "";
  let key = 0;

  const flush = () => {
    if (buf) {
      out.push(buf);
      buf = "";
    }
  };

  while (rest) {
    const link = LINK.exec(rest);
    if (link) {
      flush();
      out.push(
        <a
          key={key++}
          href={link[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-sky-700 underline underline-offset-2 hover:text-sky-900"
        >
          {link[1]}
        </a>,
      );
      rest = rest.slice(link[0].length);
      continue;
    }

    const hit = INLINE.find((r) => r.re.test(rest));
    if (hit) {
      const m = hit.re.exec(rest)!;
      flush();
      out.push(hit.node(m[1], key++));
      rest = rest.slice(m[0].length);
      continue;
    }

    // 어떤 문법에도 안 걸리는 한 글자를 버퍼에 흘려보낸다.
    buf += rest[0];
    rest = rest.slice(1);
  }
  flush();
  return out;
}

// 블록은 종류만 다르고 담는 것은 항상 '줄 목록'이라 한 모양으로 둔다.
// (ul/ol에서는 lines가 항목 목록, 문단에서는 줄바꿈으로 이어지는 줄들)
type Block = {
  kind: "h2" | "h3" | "p" | "quote" | "ul" | "ol";
  lines: string[];
};

function parse(src: string): Block[] {
  const blocks: Block[] = [];
  // 줄 끝 공백은 눈에 안 보이는 차이를 만들어서 미리 턴다.
  const lines = src.replace(/\r\n/g, "\n").split("\n").map((l) => l.trimEnd());

  for (const line of lines) {
    const t = line.trim();
    const prev = blocks[blocks.length - 1];

    if (!t) {
      // 빈 줄 = 블록 경계. 다음 줄은 새 블록에서 시작한다.
      if (prev) blocks.push({ kind: "p", lines: [] });
      continue;
    }

    const h3 = /^###\s+(.*)$/.exec(t);
    const h2 = /^##\s+(.*)$/.exec(t);
    const ul = /^[-*]\s+(.*)$/.exec(t);
    const ol = /^\d+\.\s+(.*)$/.exec(t);
    const quote = /^>\s?(.*)$/.exec(t);

    if (h3) blocks.push({ kind: "h3", lines: [h3[1]] });
    else if (h2) blocks.push({ kind: "h2", lines: [h2[1]] });
    else if (ul) {
      if (prev?.kind === "ul") prev.lines.push(ul[1]);
      else blocks.push({ kind: "ul", lines: [ul[1]] });
    } else if (ol) {
      if (prev?.kind === "ol") prev.lines.push(ol[1]);
      else blocks.push({ kind: "ol", lines: [ol[1]] });
    } else if (quote) {
      if (prev?.kind === "quote") prev.lines.push(quote[1]);
      else blocks.push({ kind: "quote", lines: [quote[1]] });
    } else if (prev?.kind === "p" && prev.lines.length) {
      prev.lines.push(t); // 문단 안 줄바꿈
    } else if (prev?.kind === "p") {
      prev.lines.push(t);
    } else {
      blocks.push({ kind: "p", lines: [t] });
    }
  }
  // 빈 줄 때문에 만들어진 빈 문단은 버린다.
  return blocks.filter((b) => b.lines.length > 0);
}

export default function Markdown({
  source,
  className = "",
}: {
  source: string;
  className?: string;
}) {
  const blocks = parse(source);

  return (
    <div className={`space-y-4 text-slate-700 ${className}`}>
      {blocks.map((b, i) => {
        if (b.kind === "h2")
          return (
            <h2 key={i} className="text-xl font-bold text-sky-900 sm:text-2xl">
              {inline(b.lines[0])}
            </h2>
          );
        if (b.kind === "h3")
          return (
            <h3 key={i} className="text-base font-semibold text-sky-900 sm:text-lg">
              {inline(b.lines[0])}
            </h3>
          );
        if (b.kind === "ul")
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-5 text-sm sm:text-base">
              {b.lines.map((it, j) => (
                <li key={j}>{inline(it)}</li>
              ))}
            </ul>
          );
        if (b.kind === "ol")
          return (
            <ol key={i} className="list-decimal space-y-1.5 pl-5 text-sm sm:text-base">
              {b.lines.map((it, j) => (
                <li key={j}>{inline(it)}</li>
              ))}
            </ol>
          );
        if (b.kind === "quote")
          return (
            <blockquote
              key={i}
              className="border-l-3 border-sky-300/70 pl-4 text-sm italic text-slate-600 sm:text-base"
            >
              {b.lines.map((l, j) => (
                <p key={j}>{inline(l)}</p>
              ))}
            </blockquote>
          );
        return (
          <p key={i} className="text-sm leading-relaxed sm:text-base">
            {b.lines.map((l, j) => (
              <span key={j}>
                {inline(l)}
                {j < b.lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
