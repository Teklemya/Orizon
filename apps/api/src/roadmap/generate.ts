import type { GenInput, Step, SourceRef, SchoolKB } from "../types";
import { earliestDeadlineISO, schoolSources } from "../kb";

function isoFromYearMonth(targetYear: number, intakeMonth: string): string {
  // Anchor mid-month for soft due window
  const monthIndex = ["january","february","march","april","may","june","july","august","september","october","november","december"]
    .findIndex(m => m.startsWith(intakeMonth.toLowerCase()));
  const m = Math.max(0, monthIndex);
  const d = new Date(Date.UTC(targetYear, m, 15));
  return d.toISOString();
}
function addMonthsISO(iso: string, delta: number): string {
  const d = new Date(iso);
  const nd = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + delta, 15));
  return nd.toISOString();
}

export function generateRoadmap(input: GenInput, schools: SchoolKB[]): { steps: Step[]; sources: SourceRef[] } {
  const anchor = isoFromYearMonth(input.targetYear, input.intakeMonth);
  const earliest = earliestDeadlineISO(schools, input.intakeMonth);

  let id = 1;
  const steps: Step[] = [
    {
      id: id++,
      title: "Obtain/renew passport",
      stage: "Pre-Arrival",
      status: "pending",
      dueDate: addMonthsISO(anchor, -10),
      deps: [],
      description: "Ensure ≥ 6 months validity past program start; schedule appointment early."
    },
    {
      id: id++,
      title: "Confirm accepted English tests & minimums",
      stage: "Pre-Arrival",
      status: "pending",
      dueDate: addMonthsISO(anchor, -9),
      deps: [1],
      description: makeEnglishDescription(input.level, schools)
    },
    {
      id: id++,
      title: input.level === "Undergrad" ? "Shortlist & apply to universities" : "Shortlist & apply to graduate programs",
      stage: "Pre-Arrival",
      status: "pending",
      dueDate: earliest ? new Date(earliest).toISOString() : addMonthsISO(anchor, -8),
      deps: [1,2],
      description: makeApplyDescription(earliest, schools)
    },
    {
      id: id++,
      title: "Receive I-20 / admission package",
      stage: "Visa",
      status: "pending",
      dueDate: addMonthsISO(anchor, -5),
      deps: [3],
      description: "Provide financial documentation; verify SEVIS info on the I-20; keep copies."
    },
    {
      id: id++,
      title: "Pay I-901 (SEVIS) & complete DS-160",
      stage: "Visa",
      status: "pending",
      dueDate: addMonthsISO(anchor, -4),
      deps: [4],
      description: "Pay I-901 fee and keep the receipt; complete DS-160; schedule interview and biometrics."
    },
    {
      id: id++,
      title: "F-1 visa interview",
      stage: "Visa",
      status: "pending",
      dueDate: addMonthsISO(anchor, -3),
      deps: [5],
      description: `Bring passport, I-20, financials, photo; practice concise answers about your program and ties to ${input.country}.`
    },
    {
      id: id++,
      title: "Housing & pre-departure",
      stage: "Post-Arrival",
      status: "pending",
      dueDate: addMonthsISO(anchor, -2),
      deps: [4,6],
      description: "Book housing/roommate, vaccinations, travel; pack docs (I-20, passport, SEVIS/DS-160 receipt)."
    },
    {
      id: id++,
      title: "Arrival & orientation",
      stage: "Post-Arrival",
      status: "pending",
      dueDate: anchor,
      deps: [6],
      description: "Report to the school/DSO, activate SEVIS, get student ID, set up bank/phone."
    }
  ];

  const sources = schoolSources(schools);
  return { steps, sources };
}

function makeEnglishDescription(level: "Undergrad"|"Graduate", schools: SchoolKB[]): string {
  // Build a concise sentence listing accepted tests and notable minimums across selected schools
  const lines: string[] = [];
  for (const s of schools) {
    const mins = s.min_scores?.[level] || {};
    const pairs = Object.entries(mins).map(([k,v]) => `${k} ${v}`).join(", ");
    if (pairs) lines.push(`${s.name}: ${pairs}`);
  }
  const one = lines.slice(0,2).join(" · ");
  return one
    ? `Review accepted tests and minimums; register for the earliest accepted exam. Examples — ${one}.`
    : "Review accepted tests and minimums; register for an exam (TOEFL/IELTS/DET) or confirm waiver policy.";
}

function makeApplyDescription(earliest: string | null, schools: SchoolKB[]): string {
  const earliestStr = earliest ? `Meet the earliest deadline (${earliest}). ` : "";
  const sample = schools[0];
  const docs = sample?.docs?.slice(0,3)?.join(", ");
  return `${earliestStr}Prepare core docs${docs ? ` (${docs})` : ""}; request recommendations; submit applications and pay fees.`;
}
