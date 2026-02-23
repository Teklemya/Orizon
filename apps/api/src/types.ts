// Level of study
export type Level = "Undergrad" | "Graduate";

// Input the generator receives from the frontend
export type GenInput = {
  profileId: string;             // "demo" for now
  country: string;               // e.g., "Peru"
  level: Level;                  // Undergrad or Graduate
  intakeMonth: string;           // "August", "January", etc.
  targetYear: number;            // e.g., 2026
  targetUniversities?: string[]; // ["purdue", "ucincinnati"] - ids from schools.json
  intendedMajor?: string; 
  gpa?: number;
};

// Roadmap step shape used by backend + frontend
export type Step = {
  id: number;
  title: string;
  stage: "Pre-Arrival" | "Visa" | "Post-Arrival"; // we treat "Pre-Arrival" as Application for now
  status: "pending" | "in-progress" | "done";
  dueDate: string | null;        // ISO string
  deps: number[];                // ids of prerequisite steps
  description?: string;
};

// Link shown in the Sources panel
export type SourceRef = { title: string; url: string };

// University knowledge-base entry (minimal, AI-friendly)
export type SchoolKB = {
  id: string;
  name: string;
  level: Level[];

  city?: string;
  state?: string;
  country?: string;
  imageUrl?: string;
  shortDescription?: string;

  links?: {
    admissions?: string;
    international?: string;
    english_policy?: string;
  };

  requirements?: {
    satActPolicy?: string;
    deadlines?: any;
    english?: any;
    lastVerifiedAt?: string;
  };
};
