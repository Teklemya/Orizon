export type Level = "Undergrad" | "Graduate";

export type GenInput = {
  profileId: string;            // "demo" for now
  country: string;              // e.g., "Peru"
  level: Level;                 // UG or Grad
  intakeMonth: string;          // "August", "January", etc.
  targetYear: number;           // 2026
  targetUniversities?: string[]; // ["purdue","ucincinnati"] - ids from schools.json
};

export type Step = {
  id: number;
  title: string;
  stage: "Pre-Arrival" | "Visa" | "Post-Arrival";
  status: "pending" | "in-progress" | "done";
  dueDate: string | null;        // ISO
  deps: number[];
  description?: string;
};

export type SourceRef = { title: string; url: string };

export type SchoolKB = {
  id: string; name: string; level: Level[]; english_tests: string[];
  min_scores?: Record<Level, Record<string, number>>;
  deadlines?: { fall?: string; spring?: string; rolling?: boolean };
  docs?: string[];
  links?: Record<string, string>;
};
