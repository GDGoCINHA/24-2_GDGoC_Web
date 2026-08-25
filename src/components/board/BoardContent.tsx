import type { ReactNode } from 'react'

/**
 * 본문에 넣은 이미지 문법. 마크다운의 이미지 표기 하나만 받는다.
 * 굵게·제목 같은 다른 문법은 지원하지 않는다 — 기존 글이 마크다운으로 재해석되면
 * 의도치 않게 보이므로, 새로 넣기로 한 이 표기만 특별 취급한다.
 */
const IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)\s]+)\)/g

/**
 * http(s) 만 그린다. javascript: 나 data: 로 시작하는 주소를 그대로 <img src> 에 넣으면
 * 작성 권한이 있는 사람이 다른 사람 화면에서 스크립트를 돌릴 수 있다.
 */
const isSafeImageUrl = (url: string): boolean => /^https?:\/\//i.test(url)

type Segment = { kind: 'text'; value: string } | { kind: 'image'; alt: string; url: string }

/** 본문을 텍스트와 이미지 조각으로 가른다. 안전하지 않은 주소는 원문 그대로 텍스트로 남긴다. */
const toSegments = (content: string): Segment[] => {
  const segments: Segment[] = []
  let cursor = 0

  for (const match of content.matchAll(IMAGE_PATTERN)) {
    const [raw, alt, url] = match
    const start = match.index ?? 0

    if (start > cursor) {
      segments.push({ kind: 'text', value: content.slice(cursor, start) })
    }
    segments.push(isSafeImageUrl(url) ? { kind: 'image', alt, url } : { kind: 'text', value: raw })
    cursor = start + raw.length
  }

  if (cursor < content.length) {
    segments.push({ kind: 'text', value: content.slice(cursor) })
  }
  return segments
}

export interface BoardContentProps {
  content: string
}

export function BoardContent({ content }: BoardContentProps): ReactNode {
  const segments = toSegments(content)

  // break-keep 은 한글을 단어째 지키지만, 링크처럼 끊을 자리가 없는 문자열은 그대로
  // 밀고 나가 좁은 화면에서 가로 스크롤을 만든다. break-words 로 그때만 끊는다.

  return (
    <div className="flex flex-col gap-5 break-keep border-t border-t-[rgba(240,234,228,0.10)] pt-[34px] text-base leading-[1.85] text-dusk-ink-200">
      {segments.map((segment, index) =>
        segment.kind === 'image' ? (
          <a
            key={index}
            href={segment.url}
            target="_blank"
            rel="noreferrer"
            className="block w-fit"
          >
            {/* next/image 는 못 쓴다 — 임의의 외부 호스트라 remotePatterns 에 적을 수 없다. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={segment.url}
              alt={segment.alt}
              loading="lazy"
              className="max-h-[520px] w-auto max-w-full rounded-lg"
            />
          </a>
        ) : (
          <p key={index} className="whitespace-pre-wrap break-words">
            {segment.value}
          </p>
        )
      )}
    </div>
  )
}
