// apps/api/src/questions.ts
import { Router } from "express";
import { pool } from "./db";

const router = Router();
let schemaInit: Promise<void> | null = null;

async function ensureSchema() {
  if (!schemaInit) {
    schemaInit = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS questions (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          body TEXT NOT NULL,
          author TEXT,
          category TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS tags (
          id SERIAL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS question_tags (
          question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
          tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
          PRIMARY KEY (question_id, tag_id)
        )
      `);
      await pool.query(
        `CREATE INDEX IF NOT EXISTS questions_created_at_idx ON questions(created_at DESC)`
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

// ==========================
// GET /api/questions
// ==========================
router.get("/", async (_req: any, res: any) => {
  try {
    await ensureSchema();
    const { rows } = await pool.query(`
      SELECT 
        q.id,
        q.title,
        q.body,
        q.author,
        q.category,
        COALESCE(json_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tags
      FROM questions q
      LEFT JOIN question_tags qt ON q.id = qt.question_id
      LEFT JOIN tags t ON qt.tag_id = t.id
      GROUP BY q.id
      ORDER BY q.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("GET /questions error:", err);
    res.status(500).json({
      error: "Failed to fetch questions",
      code: getErrorCode(err),
    });
  }
});

// ==========================
// POST /api/questions
// ==========================
router.post("/", async (req: any, res: any) => {
  try {
    await ensureSchema();
    const { title, body, author, tags, category } = req.body;

    // 1) Insert question (with category)
    const result = await pool.query(
      `
      INSERT INTO questions (title, body, author, category)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [title, body, author, category || null]
    );

    const questionId = result.rows[0].id;

    // 2) Insert tags (if any)
    if (tags && Array.isArray(tags)) {
      for (let rawTag of tags) {
        const tagName = rawTag.trim().toLowerCase();

        const tagRes = await pool.query(
          `
          INSERT INTO tags (name)
          VALUES ($1)
          ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
          `,
          [tagName]
        );

        const tagId = tagRes.rows[0].id;

        await pool.query(
          `
          INSERT INTO question_tags (question_id, tag_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
          `,
          [questionId, tagId]
        );
      }
    }

    res.status(201).json({ success: true, id: questionId });
  } catch (err) {
    console.error("POST /questions error:", err);
    res.status(500).json({
      error: "Failed to create question",
      code: getErrorCode(err),
    });
  }
});

export default router;
