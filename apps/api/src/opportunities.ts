import { Router } from "express";
import { pool } from "./db";
import { z } from "zod";

const router = Router();

const CreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.string().optional(),
  location: z.string().optional(),
  paid: z.boolean().optional(),
  deadline: z.string().optional(),
  link: z.string().optional(),
  created_by: z.string().min(1),
});

// GET /api/opportunities
router.get("/", async (req: any, res: any) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, description, type, location, paid, deadline, link, created_by, posted_at FROM opportunities ORDER BY posted_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /opportunities error:", err);
    res.status(500).json({ error: "Failed to fetch opportunities" });
  }
});

// POST /api/opportunities
router.post("/", async (req: any, res: any) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { title, description, type, location, paid, deadline, link, created_by } = parsed.data;

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
        created_by,
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
  const id = parseInt(req.params.id, 10);
  const requesterId = req.body?.requester_id ?? req.body?.created_by;

  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  if (!requesterId) {
    return res.status(400).json({ error: "requester_id required" });
  }

  try {
    const ownerDeleteResult = await pool.query(
      `DELETE FROM opportunities WHERE id = $1 AND created_by = $2`,
      [id, requesterId]
    );

    if (ownerDeleteResult.rowCount && ownerDeleteResult.rowCount > 0) {
      return res.json({ success: true });
    }

    const { rowCount: opportunityExists } = await pool.query(
      `SELECT 1 FROM opportunities WHERE id = $1`,
      [id]
    );

    if (!opportunityExists) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    const { rows: profileRows } = await pool.query<{ role: string | null }>(
      `SELECT role FROM public.profiles WHERE id = $1`,
      [requesterId]
    );

    const requesterRole = profileRows[0]?.role?.toLowerCase() ?? null;
    const isAdmin = requesterRole === "admin";

    if (!isAdmin) {
      return res.status(403).json({ error: "Not authorized to delete this opportunity" });
    }

    await pool.query(`DELETE FROM opportunities WHERE id = $1`, [id]);

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /opportunities/:id error:", err);
    res.status(500).json({ error: "Failed to delete opportunity" });
  }
});

export default router;
