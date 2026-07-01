import { loadRestaurants } from "@/lib/csv";
import RestaurantBrowser from "@/components/RestaurantBrowser";

// This is a *server component* (no "use client" at the top). It runs on the
// server, fetches data, and passes the result to a client component that
// handles the interactive filter/sort UI.

export default async function Home() {
  const rows = await loadRestaurants();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900">
          Plates &amp; Places
        </h1>
        <p className="text-stone-500 mt-1 text-sm">
          A personal log of places I've been to — filter, sort, and search.
        </p>
      </header>

      <RestaurantBrowser rows={rows} />

      <footer className="mt-16 text-xs text-stone-400">
        Built with Next.js · data from a Google Sheet
      </footer>
    </main>
  );
}
