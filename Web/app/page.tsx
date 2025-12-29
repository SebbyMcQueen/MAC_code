import { LeaderboardHero } from "@/components/leaderboard-hero"
import { LeaderboardTable } from "@/components/leaderboard-table"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <LeaderboardHero />
      <LeaderboardTable />
    </main>
  )
}
