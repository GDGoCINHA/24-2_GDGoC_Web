import { notFound } from 'next/navigation'

import BingoBoard from '@/components/event/bingo/BingoBoard'

type BingoTeamPageProps = {
  params: Promise<{
    team: string
  }>
}

const TEAM_NUMBERS = new Set(Array.from({ length: 10 }, (_, index) => String(index + 1)))

export function generateStaticParams() {
  return Array.from({ length: 10 }, (_, index) => ({
    team: String(index + 1)
  }))
}

export default async function BingoTeamPage({ params }: BingoTeamPageProps) {
  const { team } = await params

  if (!TEAM_NUMBERS.has(team)) {
    notFound()
  }

  return <BingoBoard teamNumber={Number(team)} />
}
