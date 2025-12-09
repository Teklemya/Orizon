import fs from "fs";
import path from "path";
import type { SchoolKB, Level } from "./types";

let cache: SchoolKB[] | null = null;

// Load schools.json once (cached)
export function loadSchools(): SchoolKB[] {
  if (cache) return cache;
  const p = path.resolve(__dirname, "../data/schools.json");
  cache = JSON.parse(fs.readFileSync(p, "utf-8"));
  return cache!;
}

// Pick schools by ID and filter by level
export function pickSchools(ids?: string[], level?: Level): SchoolKB[] {
  const all = loadSchools();

  // If user chooses specific IDs
  let sel =
    ids && ids.length ? all.filter((s) => ids.includes(s.id)) : all.slice(0, 3);

  // Filter by level (Undergrad / Graduate)
  if (level) sel = sel.filter((s) => s.level.includes(level));

  return sel;
}

// Build "Sources" list from links (stable)
export function schoolSources(
  schools: SchoolKB[]
): { title: string; url: string }[] {
  const out: { title: string; url: string }[] = [];

  for (const s of schools) {
    const u = s.links || {};
    if (u.admissions) {
      out.push({ title: `${s.name} Admissions`, url: u.admissions });
    }
    if (u.international) {
      out.push({ title: `${s.name} International`, url: u.international });
    }
    if (u.english_policy) {
      out.push({ title: `${s.name} English Policy`, url: u.english_policy });
    }
  }

  // Global authoritative visa resources
  out.push(
    {
      title: "U.S. Dept. of State — DS-160",
      url: "https://travel.state.gov/",
    },
    {
      title: "SEVIS I-901 Fee",
      url: "https://fmjfee.com/",
    }
  );

  return out;
}
