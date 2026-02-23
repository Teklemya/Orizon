import { Router } from "express";
import { pool } from "./db";

const router = Router();

/* ==========================
   GET /api/roadmaps
========================== */
router.get("/", async (req, res) => {
  const { author_id } = req.query;

  if (!author_id) {
    return res.status(400).json({ error: "author_id required" });
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT id, label, steps, sources, created_at
      FROM roadmaps
      WHERE author_id = $1
      ORDER BY created_at DESC
      `,
      [author_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET /roadmaps error:", err);
    res.status(500).json({ error: "Failed to fetch roadmaps" });
  }
});

/* ==========================
   POST /api/roadmaps
========================== */
router.post("/", async (req, res) => {
  const { author_id, label, steps, sources } = req.body;

  if (!author_id || !label || !steps) {
    return res.status(400).json({
      error: "author_id, label and steps are required",
    });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO roadmaps (author_id, label, steps, sources)
      VALUES ($1, $2, $3, $4)
      RETURNING id, label, steps, sources, created_at
      `,
      [author_id, label, JSON.stringify(steps), JSON.stringify(sources || null)]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("POST /roadmaps error:", err);
    res.status(500).json({ error: "Failed to save roadmap" });
  }
});

/* ==========================
   PATCH /api/roadmaps/:id
   Update roadmap steps
========================== */
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { author_id, steps, label } = req.body;

  if (!author_id) {
    return res.status(400).json({
      error: "author_id required",
    });
  }

  try {
    const { rows } = await pool.query(
      `
      UPDATE roadmaps
      SET
        steps = COALESCE($1::jsonb, steps),
        label = COALESCE($2, label)
      WHERE id = $3
        AND author_id = $4
      RETURNING id, label, steps
      `,
  [
    steps ? JSON.stringify(steps) : null,
    label ?? null,
    id,
    author_id,
  ]
);

    if (rows.length === 0) {
      return res.status(403).json({ error: "Not authorized" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("PATCH /roadmaps error:", err);
    res.status(500).json({ error: "Failed to update roadmap" });
  }
});

/* ==========================
   DELETE /api/roadmaps/:id
========================== */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { author_id } = req.body;

  if (!author_id) {
    return res.status(400).json({ error: "author_id required" });
  }

  try {
    const result = await pool.query(
      `
      DELETE FROM roadmaps
      WHERE id = $1
        AND author_id = $2
      `,
      [id, author_id]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: "Not authorized" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /roadmaps error:", err);
    res.status(500).json({ error: "Failed to delete roadmap" });
  }
});

export default router;