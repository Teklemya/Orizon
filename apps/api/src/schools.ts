import type { Request, Response } from "express";
import { loadSchools } from "./kb";

export function listSchoolsHandler(_req: Request, res: Response) {
  const schools = loadSchools();
  // For now we send everything; you can map to fewer fields if you want.
  res.json(schools);
}
