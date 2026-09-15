/**
 * Suggests a URL slug from a community name. Purely a client-side convenience — the actual
 * slug is whatever the owner submits (they can edit the suggestion), and the server
 * re-validates it against the same rules as everything else in communityDraftSchema.
 */
export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
