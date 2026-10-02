/**
 * Helper to safely resolve image URLs across local development,
 * GitHub Pages (subpaths), and production environments.
 */
export function resolveImageUrl(url?: string | null, fallback: string = ""): string {
  if (url === undefined || url === null) {
    return fallback;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return fallback;
  }

  // Base64 data URLs or Blob URLs are fully self-contained
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  // External absolute URLs
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // If starts with leading slash like "/assets/..." or "/salon-images/..."
  // On GitHub Pages (https://user.github.io/repo/), leading slash points to domain root
  // We strip the leading slash so it resolves relative to current repository subpath
  if (trimmed.startsWith("/")) {
    return `.${trimmed}`;
  }

  // If already relative with "./"
  if (trimmed.startsWith("./")) {
    return trimmed;
  }

  return `./${trimmed}`;
}
