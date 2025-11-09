import express from "express";
import cors from "cors";
import { z } from "zod";
import { pickSchools } from "./kb";
import { generateRoadmap } from "./roadmap/generate";
import type { GenInput } from "./types";

const app = express();
app.use(cors());
app.use(express.json());

const GenSchema = z.object({
  profileId: z.string().min(1),
  country: z.string().min(2),
  level: z.enum(["Undergrad","Graduate"]),
  intakeMonth: z.string().min(3),
  targetYear: z.number().int().gte(2024).lte(2035),
  targetUniversities: z.array(z.string()).optional()
});

app.post("/ai/roadmap/generate", (req, res) => {
  const parsed = GenSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const input = parsed.data as GenInput;

  const schools = pickSchools(input.targetUniversities, input.level);
  const out = generateRoadmap(input, schools);

  // (Optional) persist later; for now just return
  res.json(out);
});

// 
app.get("/", (_req, res) => res.send("Orizon AI API is running"));

// health
app.get("/health", (_req,res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`AI generator on http://localhost:${PORT}`));
