import { Router } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import { pool } from "./db";
import { z } from "zod";

const router = Router();
let hasProfilesRoleColumn: boolean | null = null;

const CreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.string().optional(),
  location: z.string().optional(),
  paid: z.boolean().optional(),
  deadline: z.string().optional(),
  link: z.string().optional(),
});

type JwtPayload = Record<string, unknown> & {
  sub?: string;
  email?: string;
  exp?: number;
  role?: string;
};

type AuthenticatedUser = {
  id: string;
  email: string | null;
  isAdmin: boolean;
};

type SupabaseAuthUser = {
  id?: string;
  email?: string | null;
  role?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

function getBearerToken(req: any): string | null {
  const header = req.headers.authorization;
  if (typeof header !== "string" || !header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

function parseJsonRecord(value: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function signToken(unsignedToken: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(unsignedToken)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function verifyJwt(token: string): JwtPayload | null {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = parseJsonRecord(decodeBase64Url(encodedHeader));
  if (header?.alg !== "HS256") return null;

  const expectedSignature = signToken(`${encodedHeader}.${encodedPayload}`, secret);
  const providedBuffer = Buffer.from(encodedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  const payload = parseJsonRecord(decodeBase64Url(encodedPayload)) as JwtPayload | null;
  if (!payload?.sub) return null;

  if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
    return null;
  }

  return payload;
}

function isAdminValue(value: unknown): boolean {
  if (value === true) return true;
  if (typeof value === "string") return value.toLowerCase() === "admin";
  if (Array.isArray(value)) return value.some((item) => isAdminValue(item));
  return false;
}

function isAdminFromClaims(claims: Record<string, unknown>): boolean {
  const appMetadata =
    claims.app_metadata && typeof claims.app_metadata === "object"
      ? (claims.app_metadata as Record<string, unknown>)
      : undefined;
  const userMetadata =
    claims.user_metadata && typeof claims.user_metadata === "object"
      ? (claims.user_metadata as Record<string, unknown>)
      : undefined;

  return [
    claims.role,
    claims.roles,
    claims.is_admin,
    claims.isAdmin,
    appMetadata?.role,
    appMetadata?.roles,
    appMetadata?.is_admin,
    appMetadata?.isAdmin,
    userMetadata?.role,
    userMetadata?.roles,
    userMetadata?.is_admin,
    userMetadata?.isAdmin,
  ].some((value) => isAdminValue(value));
}

async function ensureProfilesRoleColumn(): Promise<boolean> {
  if (hasProfilesRoleColumn !== null) return hasProfilesRoleColumn;

  try {
    const { rows } = await pool.query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'profiles'
           AND column_name = 'role'
       )`
    );

    hasProfilesRoleColumn = rows[0]?.exists ?? false;
  } catch {
    hasProfilesRoleColumn = false;
  }

  return hasProfilesRoleColumn;
}

async function isAdminFromProfile(userId: string): Promise<boolean> {
  if (!(await ensureProfilesRoleColumn())) return false;

  try {
    const { rows } = await pool.query<{ role: string | null }>(
      `SELECT role FROM public.profiles WHERE id = $1 LIMIT 1`,
      [userId]
    );

    return rows[0]?.role?.toLowerCase() === "admin";
  } catch {
    return false;
  }
}

async function fetchSupabaseAuthUser(token: string): Promise<SupabaseAuthUser | null> {
  const supabaseUrl = (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ""
  )
    .trim()
    .replace(/\/+$/g, "");
  const supabaseAnonKey = (
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ""
  ).trim();

  if (!supabaseUrl || !supabaseAnonKey) return null;

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
      },
    });

    if (!response.ok) return null;

    const user = (await response.json()) as SupabaseAuthUser;
    return user?.id ? user : null;
  } catch {
    return null;
  }
}

async function authenticateUser(req: any): Promise<AuthenticatedUser | null> {
  const token = getBearerToken(req);
  if (!token) return null;

  const supabaseUser = await fetchSupabaseAuthUser(token);
  if (supabaseUser?.id) {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? null,
      isAdmin:
        isAdminFromClaims({
          role: supabaseUser.role,
          app_metadata: supabaseUser.app_metadata,
          user_metadata: supabaseUser.user_metadata,
        }) || (await isAdminFromProfile(supabaseUser.id)),
    };
  }

  const claims = verifyJwt(token);
  if (!claims?.sub) return null;

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    isAdmin: isAdminFromClaims(claims) || (await isAdminFromProfile(claims.sub)),
  };
}

// GET /api/opportunities
router.get("/", async (req: any, res: any) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, description, type, location, paid, deadline, link, created_by, posted_at
       FROM opportunities
       ORDER BY posted_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /opportunities error:", err);
    res.status(500).json({ error: "Failed to fetch opportunities" });
  }
});

// POST /api/opportunities
router.post("/", async (req: any, res: any) => {
  const user = await authenticateUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { title, description, type, location, paid, deadline, link } = parsed.data;

  try {
    const result = await pool.query(
      `INSERT INTO opportunities (title, description, type, location, paid, deadline, link, created_by, posted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now())
       RETURNING id, title, description, type, location, paid, deadline, link, created_by, posted_at`,
      [
        title,
        description || null,
        type || null,
        location || null,
        paid || false,
        deadline || null,
        link || null,
        user.id,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /opportunities error:", err);
    res.status(500).json({ error: "Failed to create opportunity" });
  }
});

// DELETE /api/opportunities/:id
router.delete("/:id", async (req: any, res: any) => {
  const user = await authenticateUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  try {
    const existing = await pool.query<{ created_by: string | null }>(
      `SELECT created_by FROM opportunities WHERE id = $1`,
      [id]
    );

    const record = existing.rows[0];
    if (!record) return res.status(404).json({ error: "Opportunity not found" });

    const canDelete = user.isAdmin || (!!record.created_by && record.created_by === user.id);
    if (!canDelete) return res.status(403).json({ error: "Not authorized to delete this opportunity" });

    await pool.query(`DELETE FROM opportunities WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /opportunities/:id error:", err);
    res.status(500).json({ error: "Failed to delete opportunity" });
  }
});

export default router;
