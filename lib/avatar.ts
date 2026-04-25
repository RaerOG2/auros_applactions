export function getInitials(name?: string | null) {
  if (!name) return "?";

  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}