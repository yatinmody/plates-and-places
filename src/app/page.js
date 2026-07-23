import Link from "next/link";

// The landing page — a quiet, editorial cover for the app.
// Links to /browse (the interactive filter/sort/search view).

export default function Landing() {
  return (
    <>
      {/* ---------- HERO — warm-white, no photo ---------- */}
      <section
        className="relative min-h-[70vh] flex items-center justify-center px-6 py-16"
        style={{ background: "linear-gradient(to bottom, #fbf7f2 0%, #f5f0e8 100%)" }}
      >
        <div className="text-center max-w-3xl">
          <p className="text-stone-500 tracking-wide text-base sm:text-lg mb-8 font-light italic">
            A personal dining log
          </p>

          {/* Thin gold rules bracketing the title — editorial feel */}
          <div className="w-16 h-px bg-amber-700/50 mx-auto mb-8" />

          <h1 className="text-5xl sm:text-7xl font-light tracking-tight text-stone-900 lowercase">
            plates &amp; places
          </h1>

          <div className="w-16 h-px bg-amber-700/50 mx-auto mt-8" />

          <p className="mt-10 text-base sm:text-lg text-stone-600 max-w-xl mx-auto font-light">
            The restaurants and bars we have visited — searchable, sorted and scored.
          </p>

          <Link
            href="/browse"
            className="inline-flex items-center gap-2 mt-12 px-5 py-2.5 rounded-full
                       border border-stone-800 text-stone-800 text-sm
                       hover:bg-stone-800 hover:text-white transition-colors"
          >
            Browse the collection
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* ---------- GLOSSARY ---------- */}
      <section className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-8 sm:py-12 text-center">
        <header className="mb-4">
          <h2 className="text-lg sm:text-xl font-light tracking-tight text-stone-900 lowercase">
            how to read the scores
          </h2>
        </header>

        <p className="text-stone-600 font-light text-sm sm:text-base leading-relaxed">
          The scores are greatly influenced by our last visit, and could well
          change over time. A score of 0 simply means that the restaurant
          doesn't offer wine or cocktails, or a bar doesn't serve food.
        </p>

        <footer className="mt-16 text-xs text-stone-400 text-center">
          Built with Next.js · data from a Google Sheet
        </footer>
      </section>
    </>
  );
}
