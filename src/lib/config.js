// ============================================================
// EDIT THIS FILE to point at your Google Sheet.
// ============================================================
// You only edit this file. The rest of the app reads from here.

export const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRtoFJUafuOIvr4npSb0GM98GropUNp_pjsrlQwQkK3be-mHUMm6F2vyCPFKg-vpJgbsV3ZfvXAoCWP/pub?gid=0&single=true&output=csv";

// Column names must match the headers in your sheet exactly (case-sensitive).
// If you rename a column in the sheet, update the value on the right here.
export const COLUMNS = {
  name:              "Name",
  cuisinePrimary:    "Cuisine Primary",
  cuisineSecondary:  "Cuisine Secondary",
  locationPrimary:   "Location Primary",
  locationSecondary: "Location Secondary",
  date:              "Date Dined",      // expected format: MM/YY (e.g. 10/23)
  food:              "Food Score",
  ambience:          "Ambience Score",
  wine:              "Wine Score",
  cocktail:          "Cocktail Score",
  cost:              "Cost",
  reviewer:          "Reviewer",
  notes:             "Notes",
  website:           "Website",          // column N — paste the full URL (e.g. https://...)
};

// Used only when CSV_URL is blank (kept as a safety net).
export const SAMPLE_DATA = [];
