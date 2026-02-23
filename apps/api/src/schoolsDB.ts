import { pool } from "./db";
import type { SchoolKB, Level } from "./types";

export async function dbListSchools(
  level?: Level
): Promise<(SchoolKB & {
  requirements?: any;
})[]> {
  const params: any[] = [];
  let where = "";

  if (level) {
    params.push(level);
    where = `where $1 = any(s.level)`;
  }

  const q = `
    select
      s.id,
      s.name,
      s.level,
      s.city,
      s.state,
      s.country,
      s.image_url,
      s.short_description,
      s.admissions_link,
      s.international_link,
      s.english_policy_link,

      r.sat_act_policy,
      r.deadlines,
      r.english_proficiency,
      r.last_verified_at

    from schools s
    left join schools_requirements r
      on r.school_id = s.id

    ${where}
    order by s.name asc
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
    requirements: r.sat_act_policy
      ? {
          satActPolicy: r.sat_act_policy,
          deadlines: r.deadlines,
          english: r.english_proficiency,
          lastVerifiedAt: r.last_verified_at,
        }
      : undefined,
  }));
}