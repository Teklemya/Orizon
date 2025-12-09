import OpenAI from "openai";
import type { GenInput, Step, SourceRef, SchoolKB } from "../types";
import { schoolSources } from "../kb";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// helpers
function isoFromYearMonth(targetYear: number, intakeMonth: string): string {
  const monthIndex = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ].findIndex((m) => m.startsWith(intakeMonth.toLowerCase()));

  const m = Math.max(0, monthIndex);
  const d = new Date(Date.UTC(targetYear, m, 15));
  return d.toISOString();
}

function addMonthsISO(iso: string, delta: number): string {
  const d = new Date(iso);
  const nd = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + delta, 15)
  );
  return nd.toISOString();
}

type AiStep = {
  id: number;
  title: string;
  description: string;
  monthOffset: number;
  deps?: number[];
};

export async function generateRoadmap(
  input: GenInput,
  schools: SchoolKB[]
): Promise<{ steps: Step[]; sources: SourceRef[] }> {
  const anchor = isoFromYearMonth(input.targetYear, input.intakeMonth);

  const context = {
    studentProfile: {
      country: input.country,
      level: input.level,
      intakeMonth: input.intakeMonth,
      targetYear: input.targetYear,
      // 👇 you were already passing this; keeping it
      intendedMajor: input.intendedMajor ?? null,
    },
    universities: schools.map((s) => ({
      id: s.id,
      name: s.name,
      city: s.city,
      state: s.state,
      country: s.country ?? "USA",
    })),
  };

  const systemPrompt =
    "You are an expert advisor helping international students apply to U.S. universities.";

  // ⭐ Updated prompt so AI uses intendedMajor + mentions exams / rough scores
  const instructions = `
Given the following student profile and target universities, generate ONLY
the APPLICATION part of a roadmap so the student can apply and has the chance to get into the university.


Make the steps SPECIFIC and concrete:
- When relevant, mention real exam names such as TOEFL iBT, IELTS Academic,
  Duolingo English Test, SAT / ACT (for undergrad), GRE or GMAT (for many graduate programs).
- When you can, include realistic example score targets or minimums INSIDE the description,
  like "aim for TOEFL iBT 80+ (90+ preferred)" or "IELTS 6.5+; check the university site
  for exact requirements".
- If the student's intendedMajor is provided, tailor the steps and examples to that field
  (e.g. Computer Science, Engineering, Business, Biology). For example, note when STEM or
  CS programs usually expect stronger math/quantitative scores or additional coursework.
- Also, research the university requirements to be as updated as possible.

Rules:
- Return between 6 and 10 steps.
- Use clear, student-friendly titles and descriptions.
- Each step is part of the "application" phase (before visa).
- For each step, provide an integer "monthOffset":
    - negative numbers = that many months BEFORE the intake month,
    - 0 = during the intake month itself.

You MUST return ONLY valid JSON with this structure and nothing else:

{
  "steps": [
    {
      "id": 1,
      "title": "string",
      "description": "string",
      "monthOffset": -10,
      "deps": [1, 2] // optional
    },
    ...
  ]
}
`;

  let aiStepsRaw: any[] = [];
  let content = "";

  try {
    console.log("📡 Calling OpenAI with context:", JSON.stringify(context));

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: instructions },
        { role: "user", content: JSON.stringify(context, null, 2) },
      ],
    });

    content = completion.choices[0]?.message?.content ?? "";
    console.log("🤖 Raw AI content:", content);

    // Sometimes models still wrap JSON in text, so strip outside text
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    const jsonText =
      start !== -1 && end !== -1 ? content.slice(start, end + 1) : content;

    console.log("🧩 JSON candidate:", jsonText);

    const parsed = JSON.parse(jsonText);
    if (Array.isArray(parsed.steps)) {
      aiStepsRaw = parsed.steps;
      console.log("✅ Parsed AI steps:", aiStepsRaw.length);
    } else {
      console.warn("⚠️ Parsed JSON but 'steps' is not an array:", parsed);
    }
  } catch (err) {
    console.error("❌ Error in AI / JSON pipeline:", err);
    console.error("❌ Content that failed to parse:", content);
  }

  // Fallback if nothing from AI
  if (!aiStepsRaw.length) {
    console.warn("⚠️ Falling back to static roadmap (no AI steps).");
    aiStepsRaw = [
      {
        id: 1,
        title: "Research programs & requirements",
        description:
          "Shortlist 3–5 programs that match your goals and check their international admission requirements.",
        monthOffset: -12,
        deps: [],
      },
      {
        id: 2,
        title: "Plan English test and exams",
        description:
          "Choose which English test you will take (TOEFL, IELTS, or Duolingo) and book a date that fits the universities' timelines.",
        monthOffset: -11,
        deps: [1],
      },
      {
        id: 3,
        title: "Gather documents & recommendations",
        description:
          "Request transcripts, recommendation letters, and prepare your CV and personal statement drafts.",
        monthOffset: -10,
        deps: [1],
      },
      {
        id: 4,
        title: "Complete online applications",
        description:
          "Create accounts on each university portal, fill in all sections, and upload your documents.",
        monthOffset: -8,
        deps: [2, 3],
      },
      {
        id: 5,
        title: "Submit applications & pay fees",
        description:
          "Submit your applications before the earliest deadline and pay all required application fees.",
        monthOffset: -7,
        deps: [4],
      },
      {
        id: 6,
        title: "Track decisions & scholarships",
        description:
          "Monitor your email and portals for decisions and any scholarship / document follow-ups.",
        monthOffset: -3,
        deps: [5],
      },
    ];
  }

  const steps: Step[] = aiStepsRaw.map((s: AiStep | any, index: number) => {
    const id =
      typeof s.id === "number" && Number.isFinite(s.id) ? s.id : index + 1;

    const monthOffsetRaw =
      typeof s.monthOffset === "number" ? s.monthOffset : -12 + index * 2;

    const deps: number[] = Array.isArray(s.deps)
      ? s.deps
          .map((d: unknown) => Number(d))
          .filter((n: number) => Number.isFinite(n))
      : [];

    return {
      id,
      title: String(s.title ?? `Step ${id}`),
      description: String(
        s.description ?? "Follow the application instructions carefully."
      ),
      stage: "Pre-Arrival",
      status: "pending",
      deps,
      dueDate: addMonthsISO(anchor, monthOffsetRaw),
    };
  });

  const sources = schoolSources(schools);
  return { steps, sources };
}
