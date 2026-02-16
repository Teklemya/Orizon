import { pool } from "./db";
import type { SchoolKB, Level } from "./types";

// Pick schools by ID and filter by level (DB-backed)
export async function pickSchools(
  ids?: string[],
  level?: Level
): Promise<SchoolKB[]> {
  const params: any[] = [];
  const whereClauses: string[] = [];

  if (ids && ids.length > 0) {
    params.push(ids);
    whereClauses.push(`id = any($${params.length})`);
  }

  if (level) {
    params.push(level);
    whereClauses.push(`$${params.length} = any(level)`);
  }

  const where =
    whereClauses.length > 0
      ? `where ${whereClauses.join(" and ")}`
      : "";

  const q = `
    select
      id,
      name,
      level,
      city,
      state,
      country,
      image_url,
      short_description,
      admissions_link,
      international_link,
      english_policy_link
    from schools
    ${where}
    order by name asc
    limit 5
  `;

  const { rows } = await pool.query(q, params);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    level: r.level,
    city: r.city ?? undefined,
    state: r.state ?? undefined,
    country: r.country ?? undefined,
    imageUrl: r.image_url ?? undefined,
    shortDescription: r.short_description ?? undefined,
    links: {
      admissions: r.admissions_link ?? undefined,
      international: r.international_link ?? undefined,
      english_policy: r.english_policy_link ?? undefined,
    },
  }));
}

// Build "Sources" list from links (unchanged)
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
