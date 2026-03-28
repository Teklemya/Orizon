import { dbListSchools } from "./schoolsDB";
import type { Level, SchoolKB } from "./types";

export async function pickSchools(
  ids?: string[],
  level?: Level
) {
  const schools = await dbListSchools(level);

  let filtered = schools;

  if (ids && ids.length > 0) {
    filtered = schools.filter((s) => ids.includes(s.id));
  }

  return filtered.slice(0, 5);
}

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

  return out;
}