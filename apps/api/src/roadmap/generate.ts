import OpenAI from "openai";
import type { GenInput, Step, SourceRef, SchoolKB } from "../types";
import { schoolSources } from "../kb";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ==========================
// Date Helpers
// ==========================

function isoFromYearMonth(targetYear: number, intakeMonth: string): string {
  const monthIndex = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
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

type AiStepLink = {
  label: string;
  url: string;
};

type AiStep = {
  id: number;
  title: string;
  description: string;
  monthOffset: number;
  deps?: number[];
  links?: AiStepLink[];
};

type WebSource = {
  title?: string;
  url?: string;
};

type WebSearchSourceItem = {
  title?: string;
  url?: string;
};

type WebSearchOutputItem = {
  type?: string;
  action?: {
    sources?: WebSearchSourceItem[];
  };
};

// ==========================
// Helpers
// ==========================

function extractHostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function getAllowedDomains(schools: SchoolKB[]): string[] {
  const urls = schoolSources(schools).map((s) => s.url);
  const domains = new Set<string>();

  for (const url of urls) {
    const hostname = extractHostname(url);
    if (!hostname) continue;

    domains.add(hostname);

    if (hostname.startsWith("www.")) {
      domains.add(hostname.slice(4));
    } else {
      domains.add(`www.${hostname}`);
    }

    const parts = hostname.split(".");
    if (parts.length >= 2) {
      const root = parts.slice(-2).join(".");
      domains.add(root);
      domains.add(`www.${root}`);
      domains.add(`admissions.${root}`);
      domains.add(`www.admissions.${root}`);
      domains.add(`apply.${root}`);
      domains.add(`international.${root}`);
      domains.add(`global.${root}`);
      domains.add(`grad.${root}`);
      domains.add(`graduate.${root}`);
    }
  }

  return [...domains].slice(0, 100);
}

function prettifySourceTitle(url: string, givenTitle?: string): string {
  if (givenTitle?.trim()) return givenTitle.trim();

  try {
    const parsed = new URL(url);
    const path = parsed.pathname.split("/").filter(Boolean).slice(-2).join(" / ");
    return path ? `${parsed.hostname} — ${path}` : parsed.hostname;
  } catch {
    return "Official source";
  }
}

function isRelevantSource(url: string, intendedMajor?: string): boolean {
  const u = url.toLowerCase();

  const keywords = [
    "admission", "apply", "international", "english",
    "requirement", "requirements", "deadline", "deadlines",
    "freshman", "first-year", "undergraduate", "graduate",
    "toefl", "ielts", "duolingo", "gre", "gmat", "sat", "act",
    "program", "department", "major"
  ];

  const major = intendedMajor?.toLowerCase().trim();

  return (
    keywords.some((k) => u.includes(k)) ||
    (major
      ? u.includes(major.replace(/\s+/g, "-")) ||
        u.includes(major.replace(/\s+/g, "")) ||
        u.includes(major.split(" ")[0] || "")
      : false)
  );
}

function searchedSourcesToRefs(
  webSources: WebSource[],
  intendedMajor?: string
): SourceRef[] {
  const seen = new Set<string>();

  return webSources
    .filter((s): s is { url: string; title?: string } => Boolean(s?.url))
    .filter((s) => isRelevantSource(s.url, intendedMajor))
    .map((s) => ({
      title: prettifySourceTitle(s.url, s.title),
      url: s.url,
    }))
    .filter((s) => {
      if (seen.has(s.url)) return false;
      seen.add(s.url);
      return true;
    })
    .slice(0, 8);
}

function mergeSources(
  searched: SourceRef[],
  fallback: SourceRef[]
): SourceRef[] {
  const seen = new Set<string>();
  return [...searched, ...fallback].filter((s) => {
    if (seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });
}

function stripInlineSources(text: string): string {
  return text
    .replace(/\[.*?\]\(https?:\/\/[^\s)]+\)/g, "")
    .replace(/\(?https?:\/\/[^\s)]+\)?/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function isAllowedStepLink(url: string, allowedDomains: string[]): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return allowedDomains.some((domain) => {
      const d = domain.toLowerCase();
      return hostname === d || hostname.endsWith(`.${d}`);
    });
  } catch {
    return false;
  }
}

function normalizeStepLinks(
  links: unknown,
  allowedDomains: string[]
): { label: string; url: string }[] {
  if (!Array.isArray(links)) return [];

  const seen = new Set<string>();

  return links
    .filter((link): link is { label?: unknown; url?: unknown } => Boolean(link))
    .map((link) => ({
      label: typeof link.label === "string" ? link.label.trim() : "",
      url: typeof link.url === "string" ? link.url.trim() : "",
    }))
    .filter((link) => link.label.length > 0 && link.url.length > 0)
    .filter((link) => isAllowedStepLink(link.url, allowedDomains))
    .filter((link) => {
      if (seen.has(link.url)) return false;
      seen.add(link.url);
      return true;
    })
    .slice(0, 3);
}

// ==========================
// Main Generator
// ==========================

export async function generateRoadmap(
  input: GenInput,
  schools: SchoolKB[]
): Promise<{ steps: Step[]; sources: SourceRef[] }> {
  const anchor = isoFromYearMonth(input.targetYear, input.intakeMonth);
  const allowedDomains = getAllowedDomains(schools);

  const context = {
    studentProfile: {
      country: input.country,
      level: input.level,
      intakeMonth: input.intakeMonth,
      targetYear: input.targetYear,
      intendedMajor: input.intendedMajor ?? null,
      gpa: input["gpa"] ?? null,
    },
    universities: schools.map((s) => ({
      id: s.id,
      name: s.name,
      location: {
        city: s.city,
        state: s.state,
        country: s.country ?? "USA",
      },
      officialLinks: s.links ?? null,
      requirements: s.requirements ?? null,
    })),
  };

  const instructions = `
Generate ONLY the roadmap for applying to universities, before the visa stage.

The student has NOT taken any exams yet.

Always search official university websites for current information before writing the roadmap.

Write for a student who knows little or nothing about U.S. college applications.

Use this exact step flow:
1. Check admission requirements and deadlines
2. Plan your English proficiency test
3. Plan any additional required tests
4. Prepare transcripts and translations
5. Prepare your application materials
6. Submit your application before the deadline
7. Monitor your portal and respond to requests
8. Accept your offer and complete pre-enrollment items

Your job:
- Tailor the step descriptions to the selected universities.
- If intendedMajor is provided, incorporate program-specific requirements only when they are explicitly supported by official sources.
- Use university-wide international admission requirements as the baseline, then add program-specific requirements only when clearly stated.
- Include accepted English tests only when clearly listed by an official source.
- Include exact minimum scores only when clearly listed by an official source.
- Include SAT/ACT/GRE/GMAT policy only when clearly listed by an official source.
- Include deadlines only when clearly listed by an official source.
- Include important required materials such as transcripts, essays, recommendations, resume, portfolio, writing sample, or prerequisite coursework only when clearly listed.

Source hierarchy rules:
- Start with the official university URLs provided in the input.
- Prefer official university admissions, international admissions, department, and program pages first.
- If an official university page links to another official page that defines or clarifies a requirement, you may use that linked page as valid supporting evidence.
- Treat pages directly linked by the university as more authoritative than other pages on the same domain.
- Do not rely on third-party summaries when an official source is available.

Critical grounding rules:
- Do NOT guess.
- Do NOT infer missing facts.
- Do NOT provide unofficial competitive or recommended scores as if they were requirements.
- Do NOT say a test or requirement is optional, waived, or not required unless an official source explicitly says so.
- Do NOT say a test or requirement is required unless an official source explicitly says so.
- If you cannot confirm a claim from an official university page or an official page linked by it, do not state it as fact.
- If the source is ambiguous, use cautious wording such as "check the official page to confirm this."
- Distinguish carefully between:
  1. official requirements
  2. optional supplemental materials
  3. recommended preparation
  4. waived or exempted requirements
  5. research guidance / competitive benchmarks

Writing style:
- Write like a helpful advisor talking to a student.
- Keep each description simple, clear, and easy to follow.
- Explain terms naturally if they may be unfamiliar.
- Do NOT dump raw lists with lots of colons or semicolons.
- Do NOT include raw URLs, markdown links, citations, or source references in the descriptions.
- Keep titles close to the exact step flow above.
- Prefer cautious wording when certainty is limited.

Links rules:
- Each step may include 1 to 3 official links in a links array.
- Each link object must include:
    label (string)
    url (string)
- Include only official university pages or official pages directly linked by the university.
- Include only links that directly support that specific step.
- The label should match the page name naturally mentioned in the step description.
- Do NOT put URLs inside the description.
- Put URLs only inside the links field.

Competitive benchmark rules:
- You may include a competitive score suggestion only as research guidance, never as an official requirement.
- A competitive benchmark must be clearly described as a research target, stronger target, or score to investigate further.
- Never phrase a competitive benchmark as mandatory.
- Never use words like "required," "must," or "minimum" for a competitive benchmark unless the official source explicitly says so.
- If no trustworthy competitive benchmark is available from the official source context, do not invent one.

Output rules:
- Return EXACTLY 8 steps.
- Each step must include:
    id (number)
    title (string)
    description (string)
    monthOffset (integer)
    deps (optional array of ids)
- Each step may also include:
    links (array of 1 to 3 objects with label and url)

Use this monthOffset pattern:
1 => -12
2 => -11
3 => -10
4 => -9
5 => -8
6 => -6
7 => -5
8 => -3

Return ONLY valid JSON in this format:

{
  "steps": [
    {
      "id": 1,
      "title": "Check admission requirements and deadlines",
      "description": "Check the university's official admissions page and deadline page so you know what is required and when each item is due.",
      "monthOffset": -12,
      "deps": [],
      "links": [
        {
          "label": "UC International First-Year Admissions",
          "url": "https://admissions.uc.edu/information/international.html"
        },
        {
          "label": "UC Freshman Deadlines",
          "url": "https://admissions.uc.edu/requirements/freshman.html"
        }
      ]
    }
  ]
}
`;

  let aiStepsRaw: AiStep[] = [];
  let webSources: WebSource[] = [];

  try {
    console.log("=== ROADMAP GENERATION START ===");
    console.log("Allowed domains:", allowedDomains);

    const response = await client.responses.create({
      model: "gpt-5",
      reasoning: { effort: "medium" },
      tools: [
        {
          type: "web_search",
          filters: {
            allowed_domains: allowedDomains,
          },
        },
      ],
      tool_choice: "required",
      include: ["web_search_call.action.sources"],
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: instructions },
            { type: "input_text", text: JSON.stringify(context, null, 2) },
          ],
        },
      ],
    });

    console.log("=== OPENAI RESPONSE RECEIVED ===");
    console.log("Output text:", response.output_text);
    console.log("Raw response.output:", JSON.stringify(response.output, null, 2));

    const content = response.output_text ?? "";
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    const jsonText =
      start !== -1 && end !== -1 ? content.slice(start, end + 1) : content;

    const parsed = JSON.parse(jsonText);

    if (Array.isArray(parsed.steps)) {
      aiStepsRaw = parsed.steps;
    }

    const outputItems = Array.isArray(response.output)
      ? (response.output as WebSearchOutputItem[])
      : [];

    for (const item of outputItems) {
      if (
        item.type === "web_search_call" &&
        item.action &&
        Array.isArray(item.action.sources)
      ) {
        webSources.push(
          ...item.action.sources.map((s) => ({
            title: s.title,
            url: s.url,
          }))
        );
      }
    }

    console.log("=== WEB SOURCES EXTRACTED ===");
    console.log("Extracted webSources:", JSON.stringify(webSources, null, 2));
  } catch (err) {
    console.error("AI generation failed:", err);
  }

  if (!aiStepsRaw.length) {
    aiStepsRaw = [
      {
        id: 1,
        title: "Check admission requirements and deadlines",
        description: input.intendedMajor
          ? `Go to each university's official admissions page and check what international students need to apply. Also see whether ${input.intendedMajor} has extra program requirements, such as specific courses, a portfolio, or other materials.`
          : "Go to each university's official admissions page and check what international students need to apply, which documents are required, and when everything is due.",
        monthOffset: -12,
        deps: [],
      },
      {
        id: 2,
        title: "Plan your English proficiency test",
        description:
          "Find out which English exam the university accepts, such as TOEFL, IELTS, or Duolingo, and check the required score on the official site before you choose a test date.",
        monthOffset: -11,
        deps: [1],
      },
      {
        id: 3,
        title: "Plan any additional required tests",
        description:
          input.level === "Graduate"
            ? "Check whether your graduate program asks for exams like the GRE or GMAT. If the official site is not clear, note it and verify it before you spend time or money registering."
            : "Check whether the university uses the SAT or ACT for your application. Some schools may not require them, so confirm the policy on the official site before planning for one.",
        monthOffset: -10,
        deps: [1],
      },
      {
        id: 4,
        title: "Prepare transcripts and translations",
        description:
          "Ask your current or previous school for your transcripts, which are your official grade records. If they are not in English, arrange certified translations early so you are not delayed later.",
        monthOffset: -9,
        deps: [1],
      },
      {
        id: 5,
        title: "Prepare your application materials",
        description:
          input.intendedMajor
            ? `Start preparing the rest of your application materials, such as essays, recommendation letters, a resume, and any extra items your ${input.intendedMajor} program may ask for.`
            : "Start preparing the rest of your application materials, such as essays, recommendation letters, a resume, and any other documents the university asks for.",
        monthOffset: -8,
        deps: [4],
      },
      {
        id: 6,
        title: "Submit your application before the deadline",
        description:
          "Complete the application form and submit everything before the deadline. Make sure your documents, test scores, and other required items are sent the right way and on time.",
        monthOffset: -6,
        deps: [2, 3, 5],
      },
      {
        id: 7,
        title: "Monitor your portal and respond to requests",
        description:
          "After you apply, keep checking your application portal, which is the university website where they track your application status, along with your email in case they ask for missing items.",
        monthOffset: -5,
        deps: [6],
      },
      {
        id: 8,
        title: "Accept your offer and complete pre-enrollment items",
        description:
          "If you are admitted, follow the next steps the university gives you. This may include accepting the offer, paying a deposit to save your place, and completing setup tasks before classes begin.",
        monthOffset: -3,
        deps: [7],
      },
    ];
  }

  const steps: Step[] = aiStepsRaw
    .sort((a, b) => a.id - b.id)
    .map((s: AiStep, index: number) => {
      const id =
        typeof s.id === "number" && Number.isFinite(s.id) ? s.id : index + 1;

      const monthOffset =
        typeof s.monthOffset === "number"
          ? s.monthOffset
          : [-12, -11, -10, -9, -8, -6, -5, -3][index] ?? -12 + index;

      const deps: number[] = Array.isArray(s.deps)
        ? s.deps
            .map((d: unknown) => Number(d))
            .filter((n: number) => Number.isFinite(n))
        : id === 1
          ? []
          : [id - 1];

      return {
        id,
        title: String(s.title ?? `Step ${id}`),
        description: stripInlineSources(
          String(s.description ?? "Follow university application instructions carefully.")
        ),
        stage: "Pre-Arrival",
        status: "pending",
        deps,
        dueDate: addMonthsISO(anchor, monthOffset),
        links: normalizeStepLinks(s.links, allowedDomains),
      };
    });

  const searchedSources = searchedSourcesToRefs(webSources, input.intendedMajor);
  const fallbackSources = schoolSources(schools);
  const sources = mergeSources(searchedSources, fallbackSources);

  console.log("=== FINAL OUTPUT ===");
  console.log("Steps:", JSON.stringify(steps, null, 2));
  console.log("Searched sources:", JSON.stringify(searchedSources, null, 2));
  console.log("Fallback sources:", JSON.stringify(fallbackSources, null, 2));
  console.log("Final sources:", JSON.stringify(sources, null, 2));
  console.log("=== ROADMAP GENERATION END ===");

  return { steps, sources };
}