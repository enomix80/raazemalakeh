/**
 * Image compressor utility to resize and optimize photos on the client side
 * using an off-screen HTML5 Canvas.
 *
 * Optimizes photos to ~60KB-180KB while preserving sharp visual clarity and colors,
 * avoiding quota errors and enabling instant page rendering.
 * Preserves alpha transparency for PNG and WebP images (e.g. logos).
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.80
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("فایل انتخاب شده تصویر معتبر نیست."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("خطا در خواندن فایل تصویر"));
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error("خطا در رمزگشایی تصویر"));
      img.onload = () => {
        let { width, height } = img;

        // Maintain aspect ratio while bounding within maxWidth & maxHeight
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const isTransparentType = file.type === "image/png" || file.type === "image/webp" || file.type === "image/svg+xml";

        if (!isTransparentType) {
          // Fill background with clean white to prevent black artifacts in non-transparent images
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for transparent types, or fall back to PNG/JPEG
        if (isTransparentType) {
          try {
            const webpData = canvas.toDataURL("image/webp", quality);
            if (webpData.startsWith("data:image/webp")) {
              resolve(webpData);
              return;
            }
          } catch {
            // fallback below
          }
          resolve(canvas.toDataURL("image/png"));
          return;
        }

        // Convert standard photos to high-efficiency JPEG
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

