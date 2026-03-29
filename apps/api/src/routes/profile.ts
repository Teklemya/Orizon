import { Router } from "express";

const router = Router();

//Mock authentication
router.get("/profile", async (req, res) => {
  const user = {
    id: 1,
    name: "Student User",
    email: "user@example.com",
    avatarUrl: "https://placekitten.com/150/150",
    createdAt: "2025-11-03",
    updatedAt:"2026-3-03"
  };

  return res.json(user);
});

export default router;