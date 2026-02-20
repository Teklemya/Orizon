import type { RequestHandler } from "express";
import { loadSchools } from "./kb";

export const listSchoolsHandler: RequestHandler = (_req, res) => {
  const schools = loadSchools();
  // For now we send everything; you can map to fewer fields if you want.
  res.json(schools);
};
