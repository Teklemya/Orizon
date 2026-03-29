import { Router } from "express";
import { pool } from "../db";

const router = Router();

// Get profile for a specific user (identified by user ID from frontend)
router.get("/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    // Query profiles table from PostgreSQL
    const query = `
      SELECT id, email, display_name, avatar_url, created_at, updated_at
      FROM public.profiles
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }
    
    const profile = result.rows[0];
    
    return res.json({
      id: profile.id,
      email: profile.email,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    });
  } catch (err: any) {
    console.error("Error fetching profile:", err);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

export default router;