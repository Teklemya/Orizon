import { Router } from "express";
import { pool } from "./db";
import { z } from "zod";

const router = Router();
let schemaInit: Promise<void> | null = null;

async function ensureSchema() {
  if (!schemaInit) {
    schemaInit = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS opportunities (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          type TEXT,
          location TEXT,
          paid BOOLEAN DEFAULT FALSE,
          deadline TEXT,
          link TEXT,
          posted_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      await pool.query(
        `CREATE INDEX IF NOT EXISTS opportunities_posted_at_idx ON opportunities(posted_at DESC)`
      );
      await pool.query(
        `CREATE INDEX IF NOT EXISTS opportunities_type_idx ON opportunities(type)`
      );
    })().catch((err) => {
      schemaInit = null;
      throw err;
    });
  }

  await schemaInit;
}

function getErrorCode(err: unknown): string | undefined {
  if (typeof err !== "object" || err === null) return undefined;
  const maybeCode = (err as { code?: unknown }).code;
  return typeof maybeCode === "string" ? maybeCode : undefined;
}

const CreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.string().optional(),
  location: z.string().optional(),
  paid: z.boolean().optional(),
  deadline: z.string().optional(),
  link: z.string().optional(),
});

// GET /api/opportunities
router.get("/", async (req: any, res: any) => {
  try {
    await ensureSchema();
    const { rows } = await pool.query(
      `SELECT id, title, description, type, location, paid, deadline, link, posted_at FROM opportunities ORDER BY posted_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /opportunities error:", err);
    res.status(500).json({
      error: "Failed to fetch opportunities",
      code: getErrorCode(err),
    });
  }
});

// POST /api/opportunities
router.post("/", async (req: any, res: any) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { title, description, type, location, paid, deadline, link } = parsed.data;

  try {
    await ensureSchema();
    const result = await pool.query(
      `INSERT INTO opportunities (title, description, type, location, paid, deadline, link, posted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7, now())
       RETURNING id, title, description, type, location, paid, deadline, link, posted_at`,
      [title, description || null, type || null, location || null, paid || false, deadline || null, link || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /opportunities error:", err);
    res.status(500).json({
      error: "Failed to create opportunity",
      code: getErrorCode(err),
    });
  }
});

// DELETE /api/opportunities/:id
router.delete("/:id", async (req: any, res: any) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  try {
    await ensureSchema();
    await pool.query(`DELETE FROM opportunities WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /opportunities/:id error:", err);
    res.status(500).json({
      error: "Failed to delete opportunity",
      code: getErrorCode(err),
    });
  }
});

export default router;
