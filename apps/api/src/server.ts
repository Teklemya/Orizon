// apps/api/src/server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { z } from "zod";

import { pickSchools } from "./kb";
import { generateRoadmap } from "./roadmap/generate";
import type { GenInput } from "./types";
import { listSchoolsHandler } from "./schools";
import { getEssayFeedback } from "./essay/feedback";

// 👇 NEW: Community Q&A route
import questionsRouter from "./questions";

const app = express();
app.use(cors());
app.use(express.json());

// ====== AI ROADMAP ENDPOINT ======
const GenSchema = z.object({
  profileId: z.string().min(1),
  country: z.string().min(2),
  level: z.enum(["Undergrad", "Graduate"]),
  intakeMonth: z.string().min(3),
  targetYear: z.number().int().gte(2024).lte(2035),
  targetUniversities: z.array(z.string()).optional(),
});

app.post("/ai/roadmap/generate", async (req, res) => {
  const parsed = GenSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const input = parsed.data as GenInput;

  try {
    const schools = pickSchools(input.targetUniversities, input.level);
    const out = await generateRoadmap(input, schools);
    res.json(out);
  } catch (err: any) {
    console.error("Error in /ai/roadmap/generate:", err);
    res.status(500).json({
      error: "Failed to generate AI roadmap",
      detail: err?.message,
    });
  }
});

// ====== ESSAY FEEDBACK ENDPOINT ======
const EssaySchema = z.object({
  promptContext: z.string().optional(),
  draft: z.string().min(1, "Draft is required"),
});

app.post("/ai/essay/feedback", async (req, res) => {
  const parsed = EssaySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { promptContext, draft } = parsed.data;

  try {
    const feedback = await getEssayFeedback({
      promptContext:
        promptContext ?? "U.S. college application personal statement",
      draft,
    });

    res.json(feedback);
  } catch (err: any) {
    console.error("Error in /ai/essay/feedback:", err);
    res.status(500).json({
      error: "Failed to generate essay feedback",
      detail: err?.message,
    });
  }
});

// ====== SCHOOLS LIST ENDPOINT ======
app.get("/ai/schools", listSchoolsHandler);

// ====== COMMUNITY Q&A ROUTE (NEW) ======
app.use("/api/questions", questionsRouter);

// ====== HEALTH CHECK + ROOT ======
app.get("/", (_req, res) => res.send("Orizon AI API is running"));
app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`AI generator on http://localhost:${PORT}`);
});
