import fs from "fs";
import path from "path";
import type { SchoolKB, Level } from "./types";

let cache: SchoolKB[] | null = null;

export function loadSchools(): SchoolKB[] {
  if (cache) return cache;
  const p = path.resolve(__dirname, "../data/schools.json");
  cache = JSON.parse(fs.readFileSync(p, "utf-8"));
  return cache!;
}

export function pickSchools(ids?: string[], level?: Level): SchoolKB[] {
  const all = loadSchools();
  let sel = ids && ids.length ? all.filter(s => ids.includes(s.id)) : all.slice(0, 3);
  if (level) sel = sel.filter(s => s.level.includes(level));
  return sel;
}

export function earliestDeadlineISO(
  schools: SchoolKB[], intakeMonth: "August" | "January" | string
): string | null {
  const isFall = /^aug/i.test(intakeMonth);
  let earliest: string | null = null;
  for (const s of schools) {
    const d = s.deadlines?.[isFall ? "fall" : "spring"];
    if (!d) continue;
    if (!earliest || d < earliest) earliest = d;
  }
  return earliest; // "YYYY-MM-DD" or null
}

export function schoolSources(schools: SchoolKB[]): {title:string; url:string}[] {
  const out: {title:string; url:string}[] = [];
  for (const s of schools) {
    const u = s.links || {};
    if (u.admissions) out.push({ title: `${s.name} Admissions`, url: u.admissions });
    if (u.international) out.push({ title: `${s.name} International`, url: u.international });
    if (u.english_policy) out.push({ title: `${s.name} English Policy`, url: u.english_policy });
  }
  // Add global authoritative sources (visa)
  out.push(
    { title: "U.S. Dept. of State — DS-160", url: "https://travel.state.gov/" },
    { title: "SEVIS I-901 Fee", url: "https://fmjfee.com/" }
  );
  return out;
}
