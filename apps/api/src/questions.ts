// apps/api/src/questions.ts
import { Router } from "express";
import { pool } from "./db";

const router = Router();

// ==========================
// GET /api/questions
// ==========================
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        q.id,
        q.title,
        q.body,
        q.author,
        q.category,
        q.email,
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
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// ==========================
// POST /api/questions
// ==========================
router.post("/", async (req, res) => {
  try {
    const { title, body, author, email, tags, category } = req.body;

    const result = await pool.query(
      `
      INSERT INTO questions (title, body, author, email, category)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [title, body, author, email, category || null]
    );

    const questionId = result.rows[0].id;

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
    res.status(500).json({ error: "Failed to create question" });
  }
});

// ==========================
// PUT /api/questions/:id
// ==========================
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, body, email, category } = req.body;

  try {
    const result = await pool.query(
      `UPDATE questions SET title = $1, body = $2, category = $3
       WHERE id = $4 AND email = $5`,
      [title, body, category || null, id, email]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: "Not authorized to edit this question" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("PUT /questions/:id error:", err);
    res.status(500).json({ error: "Failed to update question" });
  }
});

// ==========================
// DELETE /api/questions/:id
// ==========================
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  try {
    const result = await pool.query(
      `DELETE FROM questions WHERE id = $1 AND email = $2`,
      [id, email]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: "Not authorized to delete this question" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /questions/:id error:", err);
    res.status(500).json({ error: "Failed to delete question" });
  }
});

// ==========================
// GET /api/questions/:id/answers
// ==========================
router.get("/:id/answers", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT id, question_id, author, body, email, created_at FROM answers WHERE question_id = $1 ORDER BY created_at ASC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /questions/:id/answers error:", err);
    res.status(500).json({ error: "Failed to fetch answers" });
  }
});

// ==========================
// POST /api/questions/:id/answers
// ==========================
router.post("/:id/answers", async (req, res) => {
  const { id } = req.params;
  const { author, body, email } = req.body;

  try {
    await pool.query(
      `INSERT INTO answers (question_id, author, body, email) VALUES ($1, $2, $3, $4)`,
      [id, author, body, email]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("POST /questions/:id/answers error:", err);
    res.status(500).json({ error: "Failed to post answer" });
  }
});

// ==========================
// PUT /api/answers/:answerId
// ==========================
router.put("/:questionId/answers/:answerId", async (req, res) => {
  const { answerId } = req.params;
  const { body, email } = req.body;

  try {
    const result = await pool.query(
      `UPDATE answers SET body = $1 WHERE id = $2 AND email = $3`,
      [body, answerId, email]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: "Not authorized to edit this answer" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("PUT /answers/:id error:", err);
    res.status(500).json({ error: "Failed to update answer" });
  }
});

// ==========================
// DELETE /api/answers/:answerId
// ==========================
router.delete("/:questionId/answers/:answerId", async (req, res) => {
  const { answerId } = req.params;
  const { email } = req.body;

  try {
    const result = await pool.query(
      `DELETE FROM answers WHERE id = $1 AND email = $2`,
      [answerId, email]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: "Not authorized to delete this answer" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /answers/:id error:", err);
    res.status(500).json({ error: "Failed to delete answer" });
  }
});

export default router;
