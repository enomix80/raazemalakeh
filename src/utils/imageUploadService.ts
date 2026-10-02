import { compressImageFile } from "./imageCompressor";

export interface UploadResult {
  url: string;
  isUploadedToServer: boolean;
}

/**
 * Direct image upload service:
 * 1. Optimizes and compresses the image client-side to prevent network lag.
 * 2. Directly uploads to server disk (/api/upload-image) so all visitors get a fast static URL.
 * 3. Falls back gracefully to optimized base64 if server endpoint is temporarily unavailable.
 */
export async function uploadImageDirectly(
  fileOrBase64: File | string,
  folder: "branding" | "topics" | "gallery" | "services" = "gallery",
  fileNamePrefix?: string,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.82
): Promise<UploadResult> {
  let base64Data: string;

  if (typeof fileOrBase64 === "string") {
    base64Data = fileOrBase64;
  } else {
    try {
      base64Data = await compressImageFile(fileOrBase64, maxWidth, maxHeight, quality);
    } catch (err) {
      console.error("Compression error:", err);
      throw new Error("خطا در بهینه‌سازی و فشرده‌سازی تصویر.");
    }
  }

  // Attempt direct server upload
  try {
    const res = await fetch("/api/upload-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image: base64Data,
        folder,
        fileName: fileNamePrefix
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.url) {
        return {
          url: data.url,
          isUploadedToServer: true
        };
      }
    }
  } catch (err) {
    console.warn("Direct server upload endpoint unavailable, using optimized base64:", err);
  }

  return {
    url: base64Data,
    isUploadedToServer: false
  };
}
