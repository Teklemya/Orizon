export const API_BASE =
  (import.meta.env.VITE_API_BASE as string) ||
  (import.meta.env.VITE_API_URL as string) ||
  (import.meta.env.VITE_API_BASE_URL as string) ||
  "http://localhost:4000";
