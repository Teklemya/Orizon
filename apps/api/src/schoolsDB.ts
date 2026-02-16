import { pool } from "./db";
import type { SchoolKB, Level } from "./types";

export async function dbListSchools(level?: Level): Promise<SchoolKB[]> {
  const params: any[] = [];
  let where = "";

  if (level) {
    params.push(level);
    where = `where $1 = any(level)`;
  }

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
