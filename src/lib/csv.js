import Papa from "papaparse";
import { CSV_URL, SAMPLE_DATA } from "./config";

// Fetches your published Google Sheet CSV and parses it into an array of objects.
// If CSV_URL is empty, returns SAMPLE_DATA so the app still works.
//
// next: { revalidate: 60 } tells Next.js to cache for 60 seconds, then re-fetch.
// Adding a row to your sheet shows up within ~1 minute. Bump this lower for
// faster updates, higher to reduce traffic.

export async function loadRestaurants() {
  if (!CSV_URL) return SAMPLE_DATA;

  const res = await fetch(CSV_URL, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch sheet (${res.status})`);
  const text = await res.text();

  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });
  return parsed.data;
}
