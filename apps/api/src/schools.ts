import { loadSchools } from "./kb";

export const listSchoolsHandler = (_req: any, res: any) => {
  const schools = loadSchools();
  // For now we send everything; you can map to fewer fields if you want.
  res.json(schools);
}
