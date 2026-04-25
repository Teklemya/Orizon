import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
};

const commonAppSeedPrompts = [
  "Reflect on a background, identity, interest, or talent that is so meaningful your application would be incomplete without it.",
  "Recount a time when you faced a challenge, setback, or failure. How did it affect you, and what did you learn?",
  "Reflect on a time when you questioned or challenged a belief or idea.",
  "Reflect on something that someone has done for you that made you happy or thankful in a surprising way.",
  "Discuss an accomplishment, event, or realization that sparked a period of personal growth and a new understanding of yourself or others.",
  "Describe a topic, idea, or concept you find so engaging that it makes you lose track of time.",
  "Share an essay on any topic of your choice.",
];

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
          "Generate practice prompts inspired by current Common App-style personal essay themes.",
          "Focus on identity, growth, values, curiosity, challenge, gratitude, and reflection.",
          majorText,
        ].join(" "),
      };

    case "why-major":
      return {
        label: "Why This Major",
        guidance: [
          "Generate practice prompts for a 'Why this major?' college essay.",
          "Focus on academic motivation, field-specific curiosity, experiences, and future goals.",
          majorText,
        ].join(" "),
      };

    case "scholarship":
      return {
        label: "Scholarship Essay",
        guidance: [
          "Generate practice prompts for scholarship essays.",
          "Focus on resilience, service, impact, financial opportunity, responsibility, and future contribution.",
          majorText,
        ].join(" "),
      };

    case "leadership":
      return {
        label: "Leadership",
        guidance: [
          "Generate practice prompts for leadership-focused essays.",
          "Focus on initiative, teamwork, responsibility, communication, and helping others.",
          majorText,
        ].join(" "),
      };

    case "challenge-growth":
      return {
        label: "Challenge & Growth",
        guidance: [
          "Generate practice prompts focused on overcoming difficulty and personal growth.",
          "Focus on setbacks, adaptation, maturity, and lessons learned.",
          majorText,
        ].join(" "),
      };

    default:
      return {
        label: "Essay Practice",
        guidance: majorText,
      };
  }
}

export async function generatePracticePrompts(
  input: PracticePromptInput
): Promise<PracticePrompt[]> {
  const categoryInfo = getCategoryGuidance(
    input.category,
    input.intendedMajor
  );

  const systemPrompt = [
    "You create college-admissions practice essay prompts.",
    "These are practice prompts, not official prompts.",
    "Use current Common App-style themes as inspiration where relevant.",
    "Make prompts realistic, concise, and useful.",
    "Do not copy seed prompts word-for-word unless necessary.",
    "Return only valid JSON.",
  ].join(" ");

  const userPrompt = `
Category: ${categoryInfo.label}

Guidance:
${categoryInfo.guidance}

Reference prompt families:
${commonAppSeedPrompts.map((p, i) => `${i + 1}. ${p}`).join("\n")}

Generate exactly 5 practice prompts.
Each should include:
- title
- prompt

Rules:
- sound like realistic college admissions prompts
- keep each prompt clear and student-friendly
- avoid repeating the same angle
- if a major is provided, lightly tailor some prompts toward it
- these should be practice prompts inspired by real admissions patterns, not claimed as official school prompts
`.trim();

  const response = await client.responses.create({
    model: "gpt-5.4-mini",
    temperature: 0.8,
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
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  title: { type: "string" },
                  prompt: { type: "string" },
                },
                required: ["title", "prompt"],
              },
            },
          },
          required: ["prompts"],
        },
      },
    },
  });

  const outputText = response.output_text;
  if (!outputText) {
    throw new Error("The model returned an empty response.");
  }

  const parsed = JSON.parse(outputText) as { prompts?: PracticePrompt[] };

  return Array.isArray(parsed.prompts) ? parsed.prompts : [];
}