/**
 * Helper to safely resolve image URLs across local development,
 * GitHub Pages (subpaths), and production environments.
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string") {
    return "./assets/branding/logo.jpg";
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return "./assets/branding/logo.jpg";
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
