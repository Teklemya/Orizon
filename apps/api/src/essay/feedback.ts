import OpenAI from "openai";

type EssayFeedbackInput = {
  promptContext: string;
  draft: string;
};

type EssayFeedback = {
  overall: string;
  strengths: string[];
  suggestions: string[];
};

export async function getEssayFeedback(
  input: EssayFeedbackInput
): Promise<EssayFeedback> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const client = new OpenAI({ apiKey });

  const systemPrompt =
    "You are an experienced college admissions writing coach. Be encouraging but honest and concise.";

  const userPrompt = `
Context: ${input.promptContext}

Student draft:
"""${input.draft}"""

Give brief, structured feedback:
- 2–3 sentences overall summary focusing on clarity, tone, and structure
- 3–5 bullet strengths
- 3–5 bullet concrete suggestions (what to change, cut, or add)

Return ONLY valid JSON like:
{
  "overall": "string",
  "strengths": ["...", "..."],
  "suggestions": ["...", "..."]
}
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.4,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "{}";
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  const jsonText =
    start !== -1 && end !== -1 ? content.slice(start, end + 1) : content;

  const parsed = JSON.parse(jsonText);
  return {
    overall: String(parsed.overall ?? ""),
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.map(String) : [],
  };
}
