import { dbListSchools } from "./schoolsDB";

export async function listSchoolsHandler(
  _req: any,
  res: any
) {
  try {
    const schools = await dbListSchools();
    res.json(schools);
  } catch (err: any) {
    console.error("Error listing schools:", err);
    res.status(500).json({
      error: "Failed to load schools",
      detail: err?.message,
    });
  }
}