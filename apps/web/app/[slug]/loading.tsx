export default function Loading() {
  return (
    <main className="tenant-public min-h-[100dvh] bg-cream">
      <div className="page-shell py-8">
        <div className="h-16 w-full animate-pulse bg-ink/5" />
        <section className="grid gap-8 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div className="space-y-5">
            <div className="h-3 w-40 animate-pulse bg-ink/10" />
            <div className="h-14 w-3/4 animate-pulse bg-ink/10" />
            <div className="h-14 w-2/3 animate-pulse bg-ink/10" />
            <div className="h-24 w-full max-w-xl animate-pulse bg-ink/5" />
          </div>
          <div className="min-h-[420px] animate-pulse bg-ink/10" />
        </section>
        <section className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="h-80 animate-pulse bg-ink/5" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-72 animate-pulse bg-ink/5" />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
