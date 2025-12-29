export function LeaderboardHero() {
  return (
    <section className="relative overflow-hidden bg-primary py-16 md:py-24">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 50px, currentColor 50px, currentColor 51px)`,
          }}
        />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground">
            <span className="text-2xl">🏌️</span>
            <span>TOUR CHAMPIONSHIP</span>
          </div>

          <h1 className="mb-4 font-sans text-5xl font-black uppercase leading-tight tracking-tight text-primary-foreground md:text-7xl text-balance">
            Happy Gilmore Invitational
          </h1>

          <p className="mb-8 text-xl font-medium text-primary-foreground/90 md:text-2xl text-pretty">
            {'"The price is wrong, Bob!"'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-bold uppercase text-primary-foreground/80">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
              <span>Live Updates</span>
            </div>
            <div className="h-4 w-px bg-primary-foreground/30" />
            <div>18 Holes</div>
            <div className="h-4 w-px bg-primary-foreground/30" />
            <div>Par 72</div>
          </div>
        </div>
      </div>

      {/* Decorative golf balls */}
      <div className="absolute -bottom-6 left-10 h-12 w-12 rounded-full bg-card opacity-20 blur-sm" />
      <div className="absolute -top-4 right-20 h-16 w-16 rounded-full bg-card opacity-10 blur-md" />
    </section>
  )
}
