'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { unwrapApiResponse } from '@/utils/api/unwrap'

const CELL_COUNT = 16
const GRID_COLUMNS = 4
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL
const TEAM_TASKS: Record<number, string[]> = {
  1: [
    '다른 팀과\n잔막하기',
    'PC방 가기',
    '영화 보기',
    '인형 뽑기',
    '학식 먹기',
    '네컷사진\n찍기',
    '카페에서\n공부하기',
    '에타 시간표\n공유하기',
    '사격장 가기',
    '보드게임카페\n가기',
    '동아리방에서\n단체사진 찍기',
    '인스타그램\n맞팔로우',
    '점심 먹기',
    '노래방 가기',
    '술집 가기',
    '릴스 찍기'
  ]
}

const BOARD_FRAME = {
  top: 23.5,
  width: 74,
  height: 59.5
}

function getBoardLeft() {
  return (100 - BOARD_FRAME.width) / 2
}

const MARK_COLORS = {
  x: {
    background: 'bg-[#ffc7d1]/42',
    foreground: 'bg-[#fff1f4]/30 text-[#d85d78]'
  }
} as const

type CellMark = 'empty' | 'x'

type BingoBoardProps = {
  teamNumber: number
  editable?: boolean
  backHref?: string
  backLabel?: string
}

type BoardFrame = {
  left: number
  top: number
  width: number
  height: number
}

function createEmptyBoard() {
  return Array<CellMark>(CELL_COUNT).fill('empty')
}

type BingoBoardResponse = {
  teamNumber: number
  marks: CellMark[]
  checkedCount: number
  rank: number
}

async function fetchBingoBoard(teamNumber: number, requester: typeof fetch = fetch) {
  if (!API_BASE_URL) {
    return null
  }

  const response = await requester(`${API_BASE_URL}/game/bingo/boards/${teamNumber}`, {
    credentials: 'include',
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error('빙고 보드를 불러오지 못했습니다.')
  }

  return unwrapApiResponse<BingoBoardResponse>(await response.json())
}

async function saveBingoBoard(
  teamNumber: number,
  marks: CellMark[],
  editable: boolean,
  requester: typeof fetch = fetch
) {
  if (!API_BASE_URL) {
    return null
  }

  const path = editable
    ? `${API_BASE_URL}/admin/game/bingo/boards/${teamNumber}`
    : `${API_BASE_URL}/game/bingo/boards/${teamNumber}`

  const response = await requester(path, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ marks })
  })

  if (!response.ok) {
    throw new Error('빙고 보드를 저장하지 못했습니다.')
  }

  return unwrapApiResponse<BingoBoardResponse>(await response.json())
}

function getCompletedLines(cellMarks: CellMark[]) {
  const lines = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, 15],
    [0, 4, 8, 12],
    [1, 5, 9, 13],
    [2, 6, 10, 14],
    [3, 7, 11, 15],
    [0, 5, 10, 15],
    [3, 6, 9, 12]
  ]

  return lines.filter((line) => line.every((index) => cellMarks[index] === 'x'))
}

function getLineCoordinates(line: number[], frame: BoardFrame) {
  const [startIndex, , , endIndex] = line
  const startColumn = startIndex % GRID_COLUMNS
  const startRow = Math.floor(startIndex / GRID_COLUMNS)
  const endColumn = endIndex % GRID_COLUMNS
  const endRow = Math.floor(endIndex / GRID_COLUMNS)

  return {
    x1: frame.left + (startColumn + 0.5) * (frame.width / GRID_COLUMNS),
    y1: frame.top + (startRow + 0.5) * (frame.height / GRID_COLUMNS),
    x2: frame.left + (endColumn + 0.5) * (frame.width / GRID_COLUMNS),
    y2: frame.top + (endRow + 0.5) * (frame.height / GRID_COLUMNS)
  }
}

function SprayXMark() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="h-[74%] w-[74%]" fill="none">
      <defs>
        <filter id="spray-blur">
          <feGaussianBlur stdDeviation="0.9" />
        </filter>
      </defs>
      <path
        d="M20 22C31 31 39 40 50 50C61 61 70 71 80 80"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.9"
        filter="url(#spray-blur)"
      />
      <path
        d="M79 21C68 31 59 40 50 50C40 60 31 69 20 79"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.82"
        filter="url(#spray-blur)"
      />
      <path
        d="M24 24C35 34 43 42 50 50C58 58 67 67 76 76"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="4 7"
        opacity="0.72"
      />
      <path
        d="M76 24C65 34 58 42 50 50C42 58 35 66 24 76"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="3 8"
        opacity="0.68"
      />
      {[
        [17, 19, 2.4],
        [26, 31, 1.8],
        [35, 44, 1.5],
        [48, 51, 2.1],
        [60, 63, 1.7],
        [70, 74, 2.3],
        [82, 80, 2.0],
        [81, 19, 2.2],
        [68, 31, 1.6],
        [57, 42, 1.9],
        [42, 58, 1.7],
        [30, 70, 2.0],
        [19, 81, 2.4],
        [51, 17, 1.3],
        [50, 84, 1.5],
        [14, 49, 1.4],
        [86, 50, 1.6]
      ].map(([cx, cy, r], index) => (
        <circle key={index} cx={cx} cy={cy} r={r} fill="currentColor" opacity="0.55" />
      ))}
    </svg>
  )
}

function CherryFlower({
  className,
  petalColor = '#ff8f97',
  scale = 1
}: {
  className: string
  petalColor?: string
  scale?: number
}) {
  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
    >
      <div className="relative h-full w-full">
        {[0, 72, 144, 216, 288].map((angle) => (
          <span
            key={angle}
            className="absolute left-1/2 top-1/2 h-[42%] w-[30%] rounded-[999px]"
            style={{
              backgroundColor: petalColor,
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-38%)`,
              transformOrigin: 'center calc(100% + 10px)'
            }}
          />
        ))}
        <span className="absolute left-1/2 top-1/2 h-[28%] w-[28%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff3ef]" />
        <span className="absolute left-[5%] top-[10%] h-[14%] w-[24%] rotate-[30deg] rounded-[999px] bg-[#b8c765]" />
        <span className="absolute right-[8%] top-0 h-[14%] w-[24%] rotate-[-35deg] rounded-[999px] bg-[#b8c765]" />
        <span className="absolute left-[8%] top-[76%] h-[14%] w-[24%] rotate-[-60deg] rounded-[999px] bg-[#b8c765]" />
      </div>
    </div>
  )
}

function FallingPetal({ className }: { className: string }) {
  return (
    <span
      className={`pointer-events-none absolute rounded-[999px] bg-[rgba(255,170,170,0.55)] ${className}`}
    />
  )
}

function Crayon({ className, color }: { className: string; color: string }) {
  return (
    <div
      className={`absolute h-[84px] w-[34px] rounded-[12px] shadow-[0_4px_10px_rgba(0,0,0,0.06)] ${className}`}
      style={{ backgroundColor: color }}
    >
      <span
        className="absolute left-1/2 top-[-12px] h-0 w-0 -translate-x-1/2 border-x-[10px] border-b-[14px] border-x-transparent"
        style={{ borderBottomColor: color }}
      />
      <span className="absolute left-[5px] right-[5px] top-[26px] h-[18px] rounded-[8px] bg-white/40" />
    </div>
  )
}

function MiniFlower({ className }: { className: string }) {
  return (
    <div className={`absolute h-[44px] w-[44px] ${className}`}>
      <span className="absolute left-1/2 top-0 h-[44px] w-[44px] -translate-x-1/2 rounded-full bg-[#f7a999]" />
      <span className="absolute left-0 top-1/2 h-[44px] w-[44px] -translate-y-1/2 rounded-full bg-[#f7a999]" />
      <span className="absolute right-0 top-1/2 h-[44px] w-[44px] -translate-y-1/2 rounded-full bg-[#f7a999]" />
      <span className="absolute bottom-0 left-1/2 h-[44px] w-[44px] -translate-x-1/2 rounded-full bg-[#f7a999]" />
      <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffd7cf]" />
    </div>
  )
}

export default function BingoBoard({
  teamNumber,
  editable = false,
  backHref = '/event/2026/bingo',
  backLabel = '팀 목록으로'
}: BingoBoardProps) {
  const { authorizedFetch } = useAuthenticatedApi()
  const [cellMarks, setCellMarks] = useState<CellMark[]>(createEmptyBoard)
  const [isLoading, setIsLoading] = useState(true)
  const [syncError, setSyncError] = useState<string | null>(null)
  const boardRequester = editable ? authorizedFetch : fetch

  useEffect(() => {
    let isMounted = true

    const loadBoard = async () => {
      if (!API_BASE_URL) {
        if (isMounted) {
          setCellMarks(createEmptyBoard())
          setIsLoading(false)
        }
        return
      }

      try {
        const board = await fetchBingoBoard(teamNumber, boardRequester)
        if (!isMounted) {
          return
        }

        if (board?.marks?.length === CELL_COUNT) {
          setCellMarks(board.marks)
        } else {
          setCellMarks(createEmptyBoard())
        }
        setSyncError(null)
      } catch {
        if (isMounted) {
          setSyncError('서버와 동기화되지 않았습니다.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadBoard()
    const intervalId = window.setInterval(() => {
      void loadBoard()
    }, 10000)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [boardRequester, teamNumber])

  const checkedCount = cellMarks.filter((mark) => mark === 'x').length
  const completedLines = useMemo(() => getCompletedLines(cellMarks), [cellMarks])
  const canEditBingo = editable
  const isInteractionDisabled = !canEditBingo || isLoading
  const boardTasks = TEAM_TASKS[teamNumber] ?? TEAM_TASKS[1] ?? null
  const imageBoardFrame = useMemo<BoardFrame>(
    () => ({
      left: getBoardLeft(),
      top: BOARD_FRAME.top,
      width: BOARD_FRAME.width,
      height: BOARD_FRAME.height
    }),
    []
  )

  const applyMark = (cellIndex: number) => {
    if (isInteractionDisabled) {
      return
    }

    const nextMarks = cellMarks.map((currentMark, index) => {
      if (index !== cellIndex) {
        return currentMark
      }

      return currentMark === 'x' ? 'empty' : 'x'
    })

    setCellMarks(nextMarks)
    setSyncError(null)

    void saveBingoBoard(teamNumber, nextMarks, editable, boardRequester)
      .then((board) => {
        if (board?.marks?.length === CELL_COUNT) {
          setCellMarks(board.marks)
        }
      })
      .catch(() => {
        setSyncError('변경 내용을 저장하지 못했습니다.')
      })
  }

  const resetBoard = () => {
    if (isInteractionDisabled) {
      return
    }

    const nextMarks = createEmptyBoard()
    setCellMarks(nextMarks)
    setSyncError(null)

    void saveBingoBoard(teamNumber, nextMarks, editable, boardRequester)
      .then((board) => {
        if (board?.marks?.length === CELL_COUNT) {
          setCellMarks(board.marks)
        }
      })
      .catch(() => {
        setSyncError('초기화 내용을 저장하지 못했습니다.')
      })
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff2dc_0%,#f7dccf_38%,#f1c8bc_70%,#e8bba8_100%)] px-4 py-8 text-[#34261d] sm:px-6 lg:px-8">
      <div
        className={`mx-auto flex w-full flex-col gap-6 ${
          editable ? 'max-w-[1128px]' : 'max-w-[720px]'
        }`}
      >
        <div className="flex flex-col gap-4 rounded-[2rem] border border-white/60 bg-white/55 p-5 shadow-[0_24px_80px_rgba(92,53,35,0.14)] backdrop-blur md:flex-row md:items-end md:justify-between md:p-8">
          <div className="space-y-3">
            <Link
              href={backHref}
              className="inline-flex w-fit items-center gap-2 rounded-[1rem] border border-[#d7ab7e] bg-white/70 px-4 py-2 text-sm font-semibold text-[#7c4c29] transition hover:bg-white"
            >
              {backLabel}
            </Link>
            <div className="space-y-2">
              <p className="font-(family-name:--font-dunggeunmo) text-sm tracking-[0.3em] text-[#d9766d]">
                GDGoC 2026 Event
              </p>
              <h1 className="font-(family-name:--font-google-sans-flex) text-4xl font-[800] text-[#6e8c5e] sm:text-5xl">
                Team {teamNumber}
              </h1>
              {isLoading ? (
                <p className="text-sm font-semibold text-[#8f7a6d]">
                  보드 상태를 불러오는 중입니다.
                </p>
              ) : null}
              {syncError ? (
                <p className="text-sm font-semibold text-[#c96f68]">{syncError}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-[1.5rem] border border-[#efcfb9] bg-[#fff8f1] p-4 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:min-w-80">
            <div className="rounded-[1rem] border border-[#f0dbc8] bg-white/75 px-4 py-3 text-center">
              <span className="font-(family-name:--font-ocra) text-lg text-[#e06f62]">
                {checkedCount}/{CELL_COUNT}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#f1d7c5]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#ff8b7c_0%,#77c8a8_100%)] transition-[width] duration-300"
                style={{ width: `${(checkedCount / CELL_COUNT) * 100}%` }}
              />
            </div>
            {editable ? (
              <button
                type="button"
                onClick={resetBoard}
                disabled={isInteractionDisabled}
                className="rounded-[1rem] bg-[#6e8c5e] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5f7b50]"
              >
                전체 초기화
              </button>
            ) : null}
          </div>
        </div>

        <div className={editable ? 'grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]' : ''}>
          <section>
            <div className="relative w-full max-w-[720px] overflow-hidden rounded-[1.5rem] border border-white/70 bg-[#f7dfd4] shadow-[0_28px_70px_rgba(120,72,46,0.2)]">
              <Image
                src={`/images/bingo/team${teamNumber}.png`}
                alt={`${teamNumber}팀 빙고판`}
                width={1545}
                height={1999}
                priority
                className="h-auto w-full"
              />

              <div
                className="absolute grid overflow-hidden rounded-[1.6rem] border-[4px] border-[#77d0b1] sm:rounded-[2.6rem] sm:border-[6px]"
                style={{
                  left: '50%',
                  top: `${BOARD_FRAME.top}%`,
                  width: `${BOARD_FRAME.width}%`,
                  height: `${BOARD_FRAME.height}%`,
                  transform: 'translateX(-50%)',
                  gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`
                }}
              >
                {cellMarks.map((mark, index) => {
                  const isX = mark === 'x'

                  return (
                    <button
                      key={index}
                      type="button"
                      aria-label={`${index + 1}번 칸 표시`}
                      disabled={isInteractionDisabled}
                      onClick={() => applyMark(index)}
                      className={`group relative transition ${
                        isX ? MARK_COLORS.x.background : 'bg-white/0 hover:bg-white/10'
                      } ${isInteractionDisabled ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {boardTasks ? (
                        <span className="typo-c2 sm:typo-m-b1 pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-2 text-center font-[900] text-[#111] sm:px-3">
                          {boardTasks[index]?.split('\n').map((line, lineIndex) => (
                            <span key={lineIndex} className="block">
                              {line}
                            </span>
                          ))}
                        </span>
                      ) : null}
                      <span
                        className={`absolute inset-[8%] z-20 flex items-center justify-center transition ${
                          isX
                            ? `scale-100 ${MARK_COLORS.x.foreground}`
                            : 'scale-75 bg-white/0 text-transparent group-hover:scale-90 group-hover:text-white/80'
                        }`}
                      >
                        {isX ? <SprayXMark /> : null}
                      </span>
                    </button>
                  )
                })}

                <svg
                  aria-hidden="true"
                  viewBox="0 0 100 100"
                  className="pointer-events-none absolute inset-0 z-10 h-full w-full"
                  preserveAspectRatio="none"
                >
                  {[25, 50, 75].map((position) => (
                    <line
                      key={`v-${position}`}
                      x1={position}
                      y1={0}
                      x2={position}
                      y2={100}
                      stroke="#77d0b1"
                      strokeWidth="0.9"
                    />
                  ))}
                  {[25, 50, 75].map((position) => (
                    <line
                      key={`h-${position}`}
                      x1={0}
                      y1={position}
                      x2={100}
                      y2={position}
                      stroke="#77d0b1"
                      strokeWidth="0.9"
                    />
                  ))}
                </svg>
              </div>

              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                className="pointer-events-none absolute inset-0 z-20 h-full w-full"
                preserveAspectRatio="none"
              >
                {completedLines.map((line) => {
                  const { x1, y1, x2, y2 } = getLineCoordinates(line, imageBoardFrame)

                  return (
                    <g key={line.join('-')}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#ffd8d2"
                        strokeWidth="2"
                        strokeLinecap="round"
                        opacity="0.9"
                      />
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#ff8b7c"
                        strokeWidth="1.1"
                        strokeLinecap="round"
                      />
                    </g>
                  )
                })}
              </svg>
            </div>
          </section>

          {canEditBingo ? (
            <aside className="flex flex-col gap-4 rounded-[2.75rem] border border-white/60 bg-[#fffaf4]/85 p-5 shadow-[0_24px_70px_rgba(92,53,35,0.12)]">
              <h2 className="font-(family-name:--font-google-sans-flex) text-2xl font-[700] text-[#c96f68]">
                사용 방법
              </h2>
              <div className="space-y-3 text-sm leading-6 text-[#6f5647]">
                <p>칸을 한 번 누르면 X가 찍히고, 다시 누르면 해제됩니다.</p>
                <p>현재 보드 상태는 백엔드와 동기화되며, 저장에 실패해도 화면 상태는 유지됩니다.</p>
                <p>전체 초기화 버튼으로 현재 팀 보드를 한 번에 비울 수 있습니다.</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#f2d3bd] bg-white px-4 py-5">
                <p className="font-(family-name:--font-dunggeunmo) text-sm text-[#e18376]">
                  TEAM {teamNumber}
                </p>
                <p className="mt-2 text-sm text-[#7b5a46]">
                  현재 팀 보드 전체 상태를 기준으로 서버에 저장합니다.
                </p>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </main>
  )
}
