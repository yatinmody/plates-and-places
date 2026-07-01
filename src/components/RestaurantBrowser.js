"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COLUMNS } from "@/lib/config";

// "use client" tells Next.js: this component runs in the browser
// (so it can hold UI state like the current filter selections).
//
// The parent page (page.js) is a server component — it fetches the data
// once on the server, then passes it down here as the `rows` prop.

export default function RestaurantBrowser({ rows }) {
  const [cuisine, setCuisine]           = useState("All");
  const [location, setLocation]         = useState("All");
  const [neighborhood, setNeighborhood] = useState("All");
  const [sortBy, setSortBy]             = useState("food-desc");
  const [search, setSearch]             = useState("");

  // Build dropdown options from the actual data — if you add a new cuisine
  // or location in your sheet, it appears here automatically.
  const cuisines  = useMemo(() => ["All", ...uniqueValues(rows, COLUMNS.cuisinePrimary)],  [rows]);
  const locations = useMemo(() => ["All", ...uniqueValues(rows, COLUMNS.locationPrimary)], [rows]);

  // Neighborhoods are scoped to the currently-selected Location.
  // E.g. pick "San Francisco" → only SF neighborhoods appear.
  const neighborhoods = useMemo(() => {
    const scope = location === "All"
      ? rows
      : rows.filter((r) => r[COLUMNS.locationPrimary] === location);
    return ["All", ...uniqueValues(scope, COLUMNS.locationSecondary)];
  }, [rows, location]);

  // When location changes, reset neighborhood to "All" so the user isn't
  // left with a stale selection that no longer matches.
  function handleLocationChange(next) {
    setLocation(next);
    setNeighborhood("All");
  }

  // Apply filters + sort. useMemo caches the result; it only recomputes
  // when one of the inputs actually changes.
  const visible = useMemo(() => {
    let out = rows;
    if (cuisine !== "All")      out = out.filter((r) => r[COLUMNS.cuisinePrimary]   === cuisine);
    if (location !== "All")     out = out.filter((r) => r[COLUMNS.locationPrimary]  === location);
    if (neighborhood !== "All") out = out.filter((r) => r[COLUMNS.locationSecondary] === neighborhood);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter((r) =>
        String(r[COLUMNS.name]  ?? "").toLowerCase().includes(q) ||
        String(r[COLUMNS.notes] ?? "").toLowerCase().includes(q)
      );
    }
    return [...out].sort(sortFn(sortBy));
  }, [rows, cuisine, location, neighborhood, search, sortBy]);

  return (
    <div className="space-y-6">
      {/* Filter bar — stacks vertically on mobile, 5 across on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <input
          type="search"
          placeholder="Search name or notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <Select label="Cuisine"      value={cuisine}      onChange={setCuisine}            options={cuisines} />
        <Select label="Location"     value={location}     onChange={handleLocationChange}  options={locations} />
        <Select label="Neighborhood" value={neighborhood} onChange={setNeighborhood}       options={neighborhoods} />
        <Select
          label="Sort by"
          value={sortBy}
          onChange={setSortBy}
          options={[
            { value: "food-desc",     label: "Food score ↓" },
            { value: "food-asc",      label: "Food score ↑" },
            { value: "ambience-desc", label: "Ambience ↓" },
            { value: "date-desc",     label: "Most recent" },
            { value: "date-asc",      label: "Oldest first" },
            { value: "name-asc",      label: "Name A–Z" },
          ]}
        />
      </div>

      <p className="text-sm text-stone-500">
        Showing <span className="font-medium text-stone-800">{visible.length}</span>
        {" "}of {rows.length}
      </p>

      {visible.length === 0 ? (
        <p className="text-stone-500 text-sm">No restaurants match these filters.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((r, i) => <RestaurantCard key={i} row={r} />)}
        </ul>
      )}
    </div>
  );
}

// ---------- Card ----------

function RestaurantCard({ row }) {
  const name     = row[COLUMNS.name];
  const cuisine  = joinParts(row[COLUMNS.cuisinePrimary],  row[COLUMNS.cuisineSecondary]);
  const place    = joinParts(row[COLUMNS.locationPrimary], row[COLUMNS.locationSecondary]);
  const food     = num(row[COLUMNS.food]);
  const ambience = num(row[COLUMNS.ambience]);
  const wine     = num(row[COLUMNS.wine]);
  const cocktail = num(row[COLUMNS.cocktail]);
  const cost     = formatCost(row[COLUMNS.cost]);
  const date     = formatDateMMYY(row[COLUMNS.date]);
  const website  = cleanUrl(row[COLUMNS.website]);
  const notesUrl = cleanUrl(row[COLUMNS.notes]);          // if Notes cell is a URL
  const notesText = !notesUrl && row[COLUMNS.notes]       // otherwise treat as text
                      ? String(row[COLUMNS.notes]) : null;
  const hasExtra = ambience != null || wine != null || cocktail != null;

  // If a Website URL is set, the restaurant name becomes a clickable link.
  const NameTag = website ? (
    <a
      href={website}
      target="_blank"           // open in new tab
      rel="noopener noreferrer" // security best practice for external links
      className="font-semibold text-stone-900 leading-tight
                 hover:text-amber-700 hover:underline underline-offset-2"
    >
      {name}
    </a>
  ) : (
    <h3 className="font-semibold text-stone-900 leading-tight">{name}</h3>
  );

  return (
    <li className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm
                   hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start justify-between gap-2">
        {NameTag}
        <RatingPill value={food} />
      </div>

      <p className="text-sm text-stone-600 mt-1">
        {cuisine}{place ? " · " : ""}{place}
      </p>

      {hasExtra ? (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-500 mt-3">
          {ambience != null ? <span>Ambience <b className="text-stone-700">{ambience}</b></span> : null}
          {wine     != null ? <span>Wine <b className="text-stone-700">{wine}</b></span>         : null}
          {cocktail != null ? <span>Cocktail <b className="text-stone-700">{cocktail}</b></span> : null}
        </div>
      ) : null}

      {notesText ? <ExpandableNotes text={notesText} /> : null}

      {notesUrl ? (
        <a
          href={notesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-3 text-sm text-amber-700
                     hover:text-amber-800 hover:underline underline-offset-2"
        >
          Notes <span aria-hidden="true">→</span>
        </a>
      ) : null}

      <div className="mt-auto pt-3 flex items-center justify-between text-xs text-stone-400">
        <span>{date}</span>
        {cost ? <span className="font-medium text-stone-600">{cost}</span> : null}
      </div>
    </li>
  );
}

// Renders notes text clamped to one line. Adds a "Read more" toggle ONLY
// when the text actually overflows that one line — short notes show in full
// with no clutter.
//
// How the detection works:
//  - useRef gives us a handle to the DOM <p> element after it renders.
//  - useEffect runs after the render, in the browser.
//  - When line-clamp-1 is applied, the element's visible height (clientHeight)
//    is capped at one line, but scrollHeight reflects the full content height.
//    If scrollHeight > clientHeight, the text is being truncated.
function ExpandableNotes({ text }) {
  const [expanded, setExpanded]       = useState(false);
  const [needsToggle, setNeedsToggle] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      setNeedsToggle(ref.current.scrollHeight > ref.current.clientHeight + 1);
    }
  }, [text]);

  return (
    <div className="mt-3">
      <p
        ref={ref}
        className={`text-sm text-stone-700 ${expanded ? "" : "line-clamp-1"}`}
      >
        {text}
      </p>
      {needsToggle ? (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="text-xs text-amber-700 hover:text-amber-800 mt-1
                     hover:underline underline-offset-2"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}

// Converts the Cost cell into a "$" string.
//  - 1..4  →  "$" .. "$$$$"
//  - already a string with $ signs → returned as-is
//  - anything else (or blank) → null
function formatCost(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (Number.isFinite(n) && n >= 1 && n <= 4) return "$".repeat(Math.round(n));
  return String(v);
}

// Normalizes a URL cell:
//  - blank or plain text (no domain) → null
//  - "example.com/path"              → "https://example.com/path"
//  - leaves http(s):// URLs as-is
function cleanUrl(v) {
  if (v == null || v === "") return null;
  const s = String(v).trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  // Looks like a domain (contains a dot, no spaces) → assume URL
  if (/^[^\s]+\.[a-z]{2,}([/?#].*)?$/i.test(s)) return `https://${s}`;
  return null;
}

function RatingPill({ value }) {
  if (value == null) {
    return (
      <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full
                       bg-stone-100 text-stone-400">—</span>
    );
  }
  const tone =
    value >= 9 ? "bg-emerald-100 text-emerald-800" :
    value >= 7 ? "bg-amber-100 text-amber-800"      :
    value >= 5 ? "bg-stone-200 text-stone-700"      :
                 "bg-rose-100 text-rose-800";
  return (
    <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${tone}`}>
      {value}
    </span>
  );
}

function Select({ label, value, onChange, options }) {
  const opts = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );
  return (
    <label className="text-sm">
      <span className="block text-stone-500 mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2
                   focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        {opts.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

// ---------- Helpers ----------

function num(v) {
  // Treats blank / null / non-numeric as null (so we can show "—" instead of 0).
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function joinParts(a, b) {
  const xs = [a, b].filter((x) => x != null && x !== "");
  return xs.join(" · ");
}

function uniqueValues(rows, col) {
  const set = new Set();
  for (const r of rows) {
    const v = r[col];
    if (v != null && v !== "") set.add(String(v));
  }
  return [...set].sort();
}

// Converts "10/23" (Oct 2023) into a sortable integer like 202310.
// Returns -Infinity for blanks so they sort to the bottom in DESC order.
function dateKey(s) {
  if (!s) return -Infinity;
  const m = String(s).match(/^(\d{1,2})\/(\d{2})$/);
  if (!m) return -Infinity;
  return (2000 + parseInt(m[2], 10)) * 100 + parseInt(m[1], 10);
}

function formatDateMMYY(s) {
  if (!s) return "";
  const m = String(s).match(/^(\d{1,2})\/(\d{2})$/);
  if (!m) return String(s);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const mo = parseInt(m[1], 10);
  const yr = 2000 + parseInt(m[2], 10);
  return `${months[mo - 1] ?? m[1]} ${yr}`;
}

function sortFn(key) {
  // Helper: nulls always go to the bottom regardless of direction.
  const cmpNum = (a, b, dir) => {
    const aNull = a == null, bNull = b == null;
    if (aNull && bNull) return 0;
    if (aNull) return 1;
    if (bNull) return -1;
    return dir === "desc" ? b - a : a - b;
  };
  return (a, b) => {
    switch (key) {
      case "food-desc":     return cmpNum(num(a[COLUMNS.food]),     num(b[COLUMNS.food]),     "desc");
      case "food-asc":      return cmpNum(num(a[COLUMNS.food]),     num(b[COLUMNS.food]),     "asc");
      case "ambience-desc": return cmpNum(num(a[COLUMNS.ambience]), num(b[COLUMNS.ambience]), "desc");
      case "date-desc":     return dateKey(b[COLUMNS.date]) - dateKey(a[COLUMNS.date]);
      case "date-asc":      return dateKey(a[COLUMNS.date]) - dateKey(b[COLUMNS.date]);
      case "name-asc":      return String(a[COLUMNS.name] ?? "").localeCompare(String(b[COLUMNS.name] ?? ""));
      default:              return 0;
    }
  };
}
