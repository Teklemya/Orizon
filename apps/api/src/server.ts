// apps/api/src/server.ts
import "dotenv/config";
import express from "express";
import cors, { type CorsOptions } from "cors";
import { z } from "zod";

import { pickSchools } from "./kb";
import { generateRoadmap } from "./roadmap/generate";
import type { GenInput } from "./types";
import { listSchoolsHandler } from "./schools";
import { getEssayFeedback } from "./essay/feedback";

// 👇 NEW: Community Q&A route
import questionsRouter from "./questions";
// Opportunities route
import opportunitiesRouter from "./opportunities";

const app = express();

const allowedOrigins = (
  process.env.CORS_ALLOWED_ORIGINS ||
  "https://orizon-web.vercel.app,http://localhost:5173,http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const previewOriginPatterns = [
  /^https:\/\/orizon-web-[a-z0-9-]+\.vercel\.app$/,
  /^https:\/\/orizon-[a-z0-9-]+-projects\.vercel\.app$/,
  /^https:\/\/orizon-[a-z0-9-]+\.vercel\.app$/,
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
];

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Allow non-browser requests that do not include Origin.
    if (!origin) return callback(null, true);

    const ok =
      allowedOrigins.includes(origin) ||
      previewOriginPatterns.some((pattern) => pattern.test(origin));

    if (ok) return callback(null, true);
    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions), (_req: any, res: any) =>
  res.sendStatus(204)
);
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

app.post("/ai/roadmap/generate", async (req: any, res: any) => {
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

app.post("/ai/essay/feedback", async (req: any, res: any) => {
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

// ====== OPPORTUNITIES ROUTE ======
app.use("/api/opportunities", opportunitiesRouter);

// ====== HEALTH CHECK + ROOT ======
app.get("/", (_req: any, res: any) =>
  res.send("Orizon AI API is running")
);
app.get("/health", (_req: any, res: any) => res.json({ ok: true }));

if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`AI generator on http://localhost:${PORT}`);
  });
}

export default app;
