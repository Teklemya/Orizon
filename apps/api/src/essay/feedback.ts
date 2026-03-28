import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type EssayFeedbackInput = {
  promptContext: string;
  draftHtml: string;
  draftText: string;
};

type EssayFeedback = {
  overall: string;
  strengths: string[];
  suggestions: string[];
};

const essayFeedbackSchema = {
  name: "essay_feedback",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      overall: {
        type: "string",
        description:
          "A brief 2-3 sentence summary of the essay's clarity, tone, structure, and use of formatting.",
      },
      strengths: {
        type: "array",
        description: "3-5 concise strengths of the essay.",
        items: { type: "string" },
      },
      suggestions: {
        type: "array",
        description:
          "3-5 concise, concrete suggestions on what to improve, cut, add, or reformat.",
        items: { type: "string" },
      },
    },
    required: ["overall", "strengths", "suggestions"],
  },
} as const;

function normalizeEssayFeedback(data: unknown): EssayFeedback {
  const obj = (data ?? {}) as Record<string, unknown>;

  return {
    overall: typeof obj.overall === "string" ? obj.overall : "",
    strengths: Array.isArray(obj.strengths)
      ? obj.strengths.map((item) => String(item))
      : [],
    suggestions: Array.isArray(obj.suggestions)
      ? obj.suggestions.map((item) => String(item))
      : [],
  };
}

export async function getEssayFeedback(
  input: EssayFeedbackInput
): Promise<EssayFeedback> {
  const systemPrompt = [
    "You are an experienced college admissions writing coach.",
    "Be encouraging, honest, concise, and specific.",
    "The student's draft may include rich-text HTML formatting such as paragraphs, headings, bold text, italics, and lists.",
    "Treat formatting as intentional rhetorical structure.",
    "Evaluate both the writing itself and whether the formatting helps or hurts clarity, flow, emphasis, and professionalism.",
    "Do not rewrite the full essay unless asked.",
    "Return feedback only in the requested JSON schema.",
  ].join(" ");

  const userPrompt = `
Context:
${input.promptContext}

The student's essay draft is provided in two forms.

HTML rich-text draft:
${input.draftHtml}

Plain-text draft:
${input.draftText}

Instructions:
- Use the HTML draft to understand emphasis, formatting, paragraphing, headings, and structure.
- Use the plain-text draft to read the content clearly.
- Consider whether bold, italics, or layout choices improve or weaken the essay.
- Focus your feedback on clarity, tone, structure, and effective presentation.

Return:
- an overall summary in 2-3 sentences
- 3-5 strengths
- 3-5 concrete suggestions
`.trim();

  const response = await client.responses.create({
    model: "gpt-5.4-mini",
    temperature: 0.4,
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
        ...essayFeedbackSchema,
      },
    },
  });

  const outputText = response.output_text;

  if (!outputText) {
    throw new Error("The model returned an empty response.");
  }

  const parsed = JSON.parse(outputText);
  return normalizeEssayFeedback(parsed);
}