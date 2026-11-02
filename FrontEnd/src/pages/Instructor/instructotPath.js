// Helper to generate a slug for instructors
export function toInstructorSlug(name) {
  const slug = String(name || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "instructor";
}


export function getInstructorDashboardPath(user, nestedPath = "") {
  const base = `/instructor-dashboard/${toInstructorSlug(user?.fullName)}`;
  if (!nestedPath) return base;
  return `${base}/${String(nestedPath).replace(/^\//, "")}`;
}
