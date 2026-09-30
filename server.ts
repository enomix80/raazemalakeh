import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.resolve(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "app-data.json");

// Ensure data and uploads directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const UPLOADS_DIR = path.resolve(__dirname, "public/uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// 50MB payload limit for high quality salon images & banners
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Helper to read data safely
function readStoredData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    } catch (err) {
      console.error("Error reading data file:", err);
    }
  }
  return null;
}

// Helper to write data safely and atomically
function writeStoredData(data: any) {
  const tempFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempFile, DATA_FILE);
}

// Serve uploads and assets statically
app.use("/uploads", express.static(UPLOADS_DIR));
app.use("/assets", express.static(path.resolve(__dirname, "public/assets")));
app.use("/assets", express.static(path.resolve(__dirname, "assets")));

const TOPIC_FOLDER_MAP: Record<string, { id: string; category: string; title: string }> = {
  bridal: { id: "topic-bridal", category: "عروس و میکاپ", title: "عروس و میکاپ VIP" },
  haircolor: { id: "topic-haircolor", category: "رنگ و مو", title: "رنگ، لایت و بالیاژ" },
  keratin: { id: "topic-keratin", category: "احیا و کراتین", title: "احیا، کراتین و بوتاکس مو" },
  nails: { id: "topic-nails", category: "ناخن و پدیکور", title: "خدمات تخصصی ناخن و پدیکور" },
  lashes: { id: "topic-lashes", category: "مژه و ابرو", title: "اکستنشن مژه و لیفت ابرو" },
  skin: { id: "topic-skin", category: "پوست و فشیال", title: "پاکسازی و فشیال پوست" },
  braids: { id: "topic-braids", category: "بافت و استایل", title: "بافت و استایل مو" }
};

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg"];

function isImageFile(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

// Scans assets folder and syncs thumbnails and gallery items
function scanAssetsFolder() {
  const currentData = readStoredData() || {};
  const currentTopics = Array.isArray(currentData.topics) ? [...currentData.topics] : [];
  const currentGallery = Array.isArray(currentData.gallery) ? [...currentData.gallery] : [];
  const currentSalonInfo = currentData.salonInfo ? { ...currentData.salonInfo } : {};

  const assetsDir = path.resolve(__dirname, "assets");
  const publicAssetsDir = path.resolve(__dirname, "public/assets");

  // Helper to find files in either assets or public/assets
  const getFilesInFolder = (folderName: string): string[] => {
    const set = new Set<string>();
    [path.join(assetsDir, folderName), path.join(publicAssetsDir, folderName)].forEach((dir) => {
      if (fs.existsSync(dir)) {
        try {
          fs.readdirSync(dir).forEach((f) => set.add(f));
        } catch {}
      }
    });
    return Array.from(set);
  };

  // 1. Scan branding
  const brandingFiles = getFilesInFolder("branding");
  for (const f of brandingFiles) {
    if (!isImageFile(f)) continue;
    const lower = f.toLowerCase();
    const assetUrl = `./assets/branding/${f}`;
    if (lower.startsWith("logo")) {
      currentSalonInfo.logoUrl = assetUrl;
      currentSalonInfo.topSmallBannerUrl = assetUrl;
    } else if (lower.startsWith("hero")) {
      currentSalonInfo.heroBannerUrl = assetUrl;
    } else if (lower.startsWith("top_banner") || lower.startsWith("banner")) {
      currentSalonInfo.backgroundBannerUrl = assetUrl;
    }
  }

  // 2. Scan topics and gallery
  const updatedGallery = [...currentGallery];

  for (const [folderName, meta] of Object.entries(TOPIC_FOLDER_MAP)) {
    const files = getFilesInFolder(folderName);
    const imageFiles = files.filter(isImageFile);

    // Look for thumbnail / cover
    const thumbFile = imageFiles.find((f) => {
      const base = path.basename(f, path.extname(f)).toLowerCase();
      return base === "thumbnail" || base === "cover" || base === "thumb" || base === "main";
    }) || imageFiles[0];

    const topicIndex = currentTopics.findIndex((t) => t.id === meta.id);
    if (thumbFile) {
      const coverPath = `./assets/${folderName}/${thumbFile}`;
      if (topicIndex >= 0) {
        // If topic has no cover or was default, assign the thumbFile
        if (!currentTopics[topicIndex].coverImage) {
          currentTopics[topicIndex].coverImage = coverPath;
        }
      } else {
        currentTopics.push({
          id: meta.id,
          title: meta.title,
          category: meta.category,
          coverImage: coverPath,
          description: `خدمات تخصصی ${meta.title} در سالن زیبایی راز ملکه`,
          badgeText: meta.title
        });
      }
    }

    // Process other images as gallery items
    const sampleFiles = imageFiles.filter((f) => f !== thumbFile);
    sampleFiles.forEach((f, idx) => {
      const itemUrl = `./assets/${folderName}/${f}`;
      const existing = updatedGallery.find((g) => g.image === itemUrl);
      if (!existing) {
        const num = path.basename(f, path.extname(f));
        updatedGallery.push({
          id: `item-${folderName}-${num || idx + 1}`,
          title: `${meta.title} - شماره ${num || idx + 1}`,
          category: meta.category,
          image: itemUrl,
          description: `نمونه‌کار تخصصی ${meta.title} در سالن راز ملکه`
        });
      }
    });
  }

  // 3. Scan services folder
  const currentServices = Array.isArray(currentData.services) ? [...currentData.services] : [];
  const serviceFiles = getFilesInFolder("services");
  const serviceImageFiles = serviceFiles.filter(isImageFile);
  const SERVICE_FILE_MAP: Record<string, string> = {
    color: "1",
    haircolor: "1",
    haircut: "2",
    cut: "2",
    eyebrow: "3",
    brow: "3",
    keratin: "4",
    nails: "5",
    nail: "5",
    skin: "6",
    facial: "6",
    makeup: "7",
    bridal: "8",
    lashes: "9",
    lash: "9",
    pedicure: "10",
    braids: "11",
    braid: "11"
  };

  serviceImageFiles.forEach((file) => {
    const base = path.basename(file, path.extname(file)).toLowerCase();
    const serviceId = SERVICE_FILE_MAP[base];
    const assetUrl = `./assets/services/${file}`;
    if (serviceId) {
      const idx = currentServices.findIndex((s) => s.id === serviceId);
      if (idx >= 0) {
        currentServices[idx].image = assetUrl;
      }
    }
  });

  const updatedData = {
    ...currentData,
    salonInfo: currentSalonInfo,
    topics: currentTopics,
    gallery: updatedGallery,
    services: currentServices,
    updatedAt: new Date().toISOString()
  };

  writeStoredData(updatedData);
  return updatedData;
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Direct Image Upload & Storage Endpoint (saves image file to disk in assets or uploads)
app.post("/api/upload-image", (req, res) => {
  try {
    const { image, folder, fileName } = req.body;
    if (!image || typeof image !== "string") {
      return res.status(400).json({ success: false, error: "تصویر ارسال نشده است" });
    }

    // Determine target directory
    let targetDir = UPLOADS_DIR;
    let targetUrlPrefix = "./uploads";

    if (folder && typeof folder === "string") {
      const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
      if (sanitizedFolder) {
        const potentialAssetDir = path.resolve(__dirname, "public/assets", sanitizedFolder);
        if (fs.existsSync(potentialAssetDir)) {
          targetDir = potentialAssetDir;
          targetUrlPrefix = `./assets/${sanitizedFolder}`;
        }
      }
    }

    // Extract mime type and extension
    let ext = ".jpg";
    let base64Data = image;

    const matches = image.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (matches) {
      const mime = matches[1].toLowerCase();
      if (mime === "png") ext = ".png";
      else if (mime === "webp") ext = ".webp";
      else if (mime === "svg+xml") ext = ".svg";
      else ext = ".jpg";
      base64Data = matches[2];
    }

    const safeName = fileName && typeof fileName === "string"
      ? fileName.replace(/[^a-zA-Z0-9_-]/g, "")
      : "";
    const generatedFileName = safeName
      ? `${safeName}-${Date.now()}${ext}`
      : `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;

    const filePath = path.join(targetDir, generatedFileName);
    fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));

    // Also mirror to root /assets/folder if target was in public/assets
    if (folder) {
      const rootAssetDir = path.resolve(__dirname, "assets", folder);
      if (fs.existsSync(rootAssetDir)) {
        try {
          fs.writeFileSync(path.join(rootAssetDir, generatedFileName), Buffer.from(base64Data, "base64"));
        } catch {}
      }
    }

    const fileUrl = `${targetUrlPrefix}/${generatedFileName}`;
    res.json({
      success: true,
      url: fileUrl,
      fileName: generatedFileName
    });
  } catch (err: any) {
    console.error("Upload save error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/scan-assets", (_req, res) => {
  try {
    const data = scanAssetsFolder();
    res.json({
      success: true,
      message: "تمامی تصاویر پوشه assets با موفقیت اسکن و همگام‌سازی شدند",
      data
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/scan-assets", (_req, res) => {
  try {
    const data = scanAssetsFolder();
    res.json({
      success: true,
      message: "تمامی تصاویر پوشه assets با موفقیت اسکن و همگام‌سازی شدند",
      data
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/app-data", (_req, res) => {
  try {
    const data = readStoredData();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/app-data", (req, res) => {
  try {
    const incomingData = req.body;
    if (!incomingData || typeof incomingData !== "object") {
      return res.status(400).json({ success: false, error: "داده‌های ارسالی نامعتبر است" });
    }

    const current = readStoredData() || {};
    const updated = {
      ...current,
      ...incomingData,
      updatedAt: new Date().toISOString()
    };

    writeStoredData(updated);
    res.json({
      success: true,
      message: "کلیه اطلاعات سالن با موفقیت به صورت دائمی در سرور ثبت شد",
      updatedAt: updated.updatedAt
    });
  } catch (err: any) {
    console.error("Server save error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Queen Salon App running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});
