import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not configured.");
}

const client = new OpenAI({ apiKey });

export type PracticePromptCategory =
  | "personal-statement"
  | "why-major"
  | "scholarship"
  | "leadership"
  | "challenge-growth";

type PracticePromptInput = {
  category: PracticePromptCategory;
  intendedMajor?: string;
};

export type PracticePrompt = {
  title: string;
  prompt: string;
  kind?: "official" | "inspired";
  sourceUrl?: string;
};

export function isPracticePromptCategory(
  value: unknown
): value is PracticePromptCategory {
  return (
    value === "personal-statement" ||
    value === "why-major" ||
    value === "scholarship" ||
    value === "leadership" ||
    value === "challenge-growth"
  );
}

function getCategoryGuidance(
  category: PracticePromptCategory,
  intendedMajor?: string
) {
  const majorText = intendedMajor?.trim()
    ? `The student's intended major is ${intendedMajor.trim()}.`
    : "No intended major was provided.";

  switch (category) {
    case "personal-statement":
      return {
        label: "Personal Statement",
        guidance: [
          "Look for official Common App essay prompts first.",
          "If an official Common App prompt strongly matches the requested vibe, you may return that official prompt verbatim.",
          "If no official prompt is a strong fit, create a new practice prompt inspired only by Common App essay themes.",
          "Focus on reflection, identity, growth, values, curiosity, gratitude, challenge, and personal voice.",
          majorText,
        ].join(" "),
      };

    case "why-major":
      return {
        label: "Why This Major",
        guidance: [
          "Common App usually does not publish a direct official 'Why this major?' essay prompt.",
          "Search Common App only, understand the tone and themes, then generate realistic practice prompts inspired by that style.",
          "If an official prompt genuinely fits, you may use it.",
          "Focus on academic motivation, field-specific curiosity, relevant experiences, and future goals.",
          majorText,
        ].join(" "),
      };

    case "scholarship":
      return {
        label: "Scholarship",
        guidance: [
          "Common App usually does not publish official scholarship-specific prompts.",
          "Search Common App only, use its official essay themes as inspiration, and generate realistic reflective practice prompts.",
          "If an official prompt genuinely fits, you may use it.",
          "Focus on resilience, impact, opportunity, responsibility, and future contribution.",
          majorText,
        ].join(" "),
      };

    case "leadership":
      return {
        label: "Leadership",
        guidance: [
          "Common App usually does not publish official leadership-specific prompts.",
          "Search Common App only, use its official essay themes as inspiration, and generate realistic reflective practice prompts.",
          "If an official prompt genuinely fits, you may use it.",
          "Focus on initiative, teamwork, communication, responsibility, and helping others.",
          majorText,
        ].join(" "),
      };

    case "challenge-growth":
      return {
        label: "Challenge & Growth",
        guidance: [
          "Search Common App only.",
          "If an official Common App prompt strongly matches challenge, setback, growth, learning, or reflection, you may use it directly.",
          "Otherwise create an inspired practice prompt based only on Common App themes.",
          "Focus on setbacks, adaptation, maturity, and lessons learned.",
          majorText,
        ].join(" "),
      };
  }
}

function extractFirstBalancedJsonObject(raw: string): string | null {
  const text = raw.trim();

  const fenced = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const start = fenced.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < fenced.length; i++) {
    const ch = fenced[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === `"`) {
        inString = false;
      }
      continue;
    }

    if (ch === `"`) {
      inString = true;
      continue;
    }

    if (ch === "{") {
      depth += 1;
      continue;
    }

    if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        return fenced.slice(start, i + 1);
      }
    }
  }

  return null;
}

function parsePracticePrompts(raw: string): PracticePrompt[] {
  const jsonText = extractFirstBalancedJsonObject(raw);

  if (!jsonText) {
    throw new Error("Model did not return a complete JSON object.");
  }

  const parsed = JSON.parse(jsonText) as { prompts?: PracticePrompt[] };

  if (!Array.isArray(parsed.prompts)) {
    throw new Error("Parsed response did not include a prompts array.");
  }

  return parsed.prompts;
}

function normalizePrompts(prompts: PracticePrompt[]): PracticePrompt[] {
  return prompts.slice(0, 5).map((item, index) => ({
    title:
      typeof item.title === "string" && item.title.trim()
        ? item.title.trim()
        : `Prompt ${index + 1}`,
    prompt: typeof item.prompt === "string" ? item.prompt.trim() : "",
    kind: item.kind === "official" ? "official" : "inspired",
    sourceUrl: typeof item.sourceUrl === "string" ? item.sourceUrl.trim() : "",
  }));
}

async function requestPracticePrompts(
  input: PracticePromptInput,
  retry = false
): Promise<PracticePrompt[]> {
  const categoryInfo = getCategoryGuidance(
    input.category,
    input.intendedMajor
  );

  const systemPrompt = [
    "You create college-admissions practice essay prompts.",
    "You must use web search and only use commonapp.org.",
    "You may return an official Common App prompt verbatim only if it truly fits the requested category.",
    "Otherwise create an inspired practice prompt based only on what Common App publishes.",
    "Do not use any source outside commonapp.org.",
    "Return exactly one valid JSON object.",
    "Do not wrap JSON in markdown fences.",
    "Do not add commentary before or after the JSON.",
    "Keep every title and prompt concise.",
  ].join(" ");

  const userPrompt = `
Category: ${categoryInfo.label}

Guidance:
${categoryInfo.guidance}

Task:
Search Common App only and generate exactly 5 prompts.

For each prompt:
1. Decide whether an official Common App prompt is already a strong fit.
2. If yes, return that official prompt verbatim and set kind to "official".
3. If not, create a new practice prompt inspired by Common App themes and set kind to "inspired".

Rules:
- Use ONLY commonapp.org
- Never claim something is official unless it is directly from Common App
- It is okay if some prompts are official and others are inspired
- Avoid repeating the same angle
- Keep prompts realistic, concise, and student-friendly
- If a major is provided, lightly tailor some inspired prompts toward it
- Include the best Common App source URL for each prompt
- Return exactly 5 prompts in JSON

JSON shape:
{
  "prompts": [
    {
      "title": "string",
      "prompt": "string",
      "kind": "official or inspired",
      "sourceUrl": "string"
    }
  ]
}
`.trim();

  const response = await client.responses.create({
    model: "gpt-5.4-mini",
    temperature: retry ? 0.1 : 0.3,
    max_output_tokens: 3000,
    tools: [
      {
        type: "web_search",
        filters: {
          allowed_domains: ["commonapp.org"],
        },
        search_context_size: "high",
      },
    ],
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: systemPrompt }],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: userPrompt }],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "practice_prompts",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            prompts: {
              type: "array",
              minItems: 5,
              maxItems: 5,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  title: { type: "string" },
                  prompt: { type: "string" },
                  kind: {
                    type: "string",
                    enum: ["official", "inspired"],
                  },
                  sourceUrl: { type: "string" },
                },
                required: ["title", "prompt", "kind", "sourceUrl"],
              },
            },
          },
          required: ["prompts"],
        },
      },
    },
  });

  const usedWebSearch =
    Array.isArray((response as any).output) &&
    (response as any).output.some(
      (item: any) => item?.type === "web_search_call"
    );

  console.log("Practice prompts used web search:", usedWebSearch);

  if ((response as any).status === "incomplete") {
    console.error("Practice prompts response incomplete:", {
      status: (response as any).status,
      incomplete_details: (response as any).incomplete_details,
    });

    if (!retry) {
      return requestPracticePrompts(input, true);
    }

    throw new Error(
      `OpenAI response was incomplete${
        (response as any).incomplete_details?.reason
          ? `: ${(response as any).incomplete_details.reason}`
          : "."
      }`
    );
  }

  const outputText = response.output_text;
  if (!outputText) {
    console.error("No output_text returned from OpenAI:", response);
    throw new Error("The model returned an empty response.");
  }

  try {
    const prompts = normalizePrompts(parsePracticePrompts(outputText));

    if (prompts.length !== 5) {
      throw new Error("Model did not return exactly 5 prompts.");
    }

    console.log(
      "Practice prompt sources:",
      prompts.map((prompt) => ({
        title: prompt.title,
        kind: prompt.kind,
        sourceUrl: prompt.sourceUrl,
      }))
    );

    return prompts;
  } catch (error) {
    console.error("Raw practice prompt model output:");
    console.error(outputText);

    if (!retry) {
      return requestPracticePrompts(input, true);
    }

    throw error;
  }
}

export async function generatePracticePrompts(
  input: PracticePromptInput
): Promise<PracticePrompt[]> {
  return requestPracticePrompts(input);
}