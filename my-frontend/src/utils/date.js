/**
 * Format ISO date string into human-readable format
 * e.g., "29 Sep 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return ""
  try {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return ""
  }
}
