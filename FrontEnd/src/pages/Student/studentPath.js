export function toStudentSlug(name) {
  const slug = String(name || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "student";
}

export function getStudentDashboardPath(user, nestedPath = "") {
  const base = `/student-dashboard/${toStudentSlug(user?.fullName)}`;
  if (!nestedPath) return base;
  return `${base}/${String(nestedPath).replace(/^\//, "")}`;
}
