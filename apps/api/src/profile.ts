import { Router } from "express";
import type { Request, Response } from "express";

import { pool } from "./db";

type ProfileRow = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

type AuthUserRow = {
  id: string;
  email: string | null;
  raw_user_meta_data: {
    display_name?: unknown;
    full_name?: unknown;
    name?: unknown;
    preferred_username?: unknown;
  } | null;
};

const router = Router();

function toProfileResponse(profile: ProfileRow) {
  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.display_name ?? undefined,
    avatarUrl: profile.avatar_url ?? undefined,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { rows } = await pool.query<ProfileRow>(
    `
      SELECT id, email, display_name, avatar_url, created_at, updated_at
      FROM public.profiles
      WHERE id = $1
    `,
    [userId]
  );

  return rows[0] ?? null;
}

function pickDisplayName(
  metadata: AuthUserRow["raw_user_meta_data"],
  email: string
): string {
  const candidates = [
    metadata?.display_name,
    metadata?.full_name,
    metadata?.name,
    metadata?.preferred_username,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return email.split("@")[0];
}

async function createProfileFromAuthUser(
  userId: string
): Promise<ProfileRow | null> {
  const { rows: authRows } = await pool.query<AuthUserRow>(
    `
      SELECT id, email, raw_user_meta_data
      FROM auth.users
      WHERE id = $1
    `,
    [userId]
  );

  const authUser = authRows[0];

  if (!authUser?.email) {
    return null;
  }

  const displayName = pickDisplayName(authUser.raw_user_meta_data, authUser.email);

  const { rows } = await pool.query<ProfileRow>(
    `
      INSERT INTO public.profiles (id, email, display_name)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO UPDATE
      SET
        email = EXCLUDED.email,
        display_name = CASE
          WHEN public.profiles.display_name IS NULL
            OR btrim(public.profiles.display_name) = ''
            OR public.profiles.display_name = split_part(public.profiles.email, '@', 1)
          THEN EXCLUDED.display_name
          ELSE public.profiles.display_name
        END,
        updated_at = NOW()
      RETURNING id, email, display_name, avatar_url, created_at, updated_at
    `,
    [authUser.id, authUser.email, displayName]
  );

  return rows[0] ?? null;
}

router.get(
  "/profile/:userId",
  async (req: Request<{ userId: string }>, res: Response) => {
    const userId = req.params.userId?.trim();

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    try {
      let profile = await fetchProfile(userId);

      if (!profile) {
        profile = await createProfileFromAuthUser(userId);
      }

      if (!profile) {
        return res.status(404).json({
          error: "Profile not found",
          detail:
            "No profile record exists for this user. Run the profiles migration if signup backfill has not been configured yet.",
        });
      }

      return res.json(toProfileResponse(profile));
    } catch (error) {
      console.error("Error fetching profile:", error);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }
  }
);

export default router;
