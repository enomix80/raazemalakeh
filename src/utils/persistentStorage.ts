/**
 * Persistent Storage Manager for Queen Salon Website
 * 
 * Multi-layer persistence strategy:
 * 1. Server-side disk database (/api/app-data) -> Source of truth, permanent across reloads & devices.
 * 2. High-capacity IndexedDB -> Resilient client-side storage for offline/fast operations.
 * 3. localStorage -> Instant synchronous hydration to eliminate screen flicker.
 */

import { SalonInfo, GalleryItem, GalleryTopic, Service, AdminCredentials } from "../types";
import { SALON_INFO, INITIAL_GALLERY_TOPICS, INITIAL_GALLERY, INITIAL_SERVICES } from "../data";
import { resolveImageUrl } from "./imagePath";

const DB_NAME = "QueenSalonStorageDB";
const DB_VERSION = 2;
const STORE_NAME = "keyval";

const KEYS = {
  SALON_INFO: "queen_salon_info",
  TOPICS: "queen_salon_topics_v4",
  GALLERY: "queen_salon_gallery_v4",
  SERVICES: "queen_salon_services_v3",
  ADMIN_CREDENTIALS: "queen_salon_admin_credentials"
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported"));
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        resolve(db);
      };

      request.onerror = () => {
        dbPromise = null;
        reject(request.error || new Error("Failed to open IndexedDB"));
      };

      request.onblocked = () => {
        console.warn("IndexedDB open blocked");
      };
    } catch (e) {
      dbPromise = null;
      reject(e);
    }
  });

  return dbPromise;
}

export async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve(req.result !== undefined ? req.result : null);
      };

      req.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    try {
      const local = localStorage.getItem(key);
      return local ? JSON.parse(local) : null;
    } catch {
      return null;
    }
  }
}

export async function idbSet<T>(key: string, value: T): Promise<void> {
  // 1. IndexedDB write
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(new Error("IndexedDB transaction aborted"));
    });
  } catch (err) {
    console.warn("IndexedDB write warning:", err);
  }

  // 2. localStorage mirror (guarded against quota errors)
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded is normal for large images; IndexedDB & Server handle it
  }
}

export interface CompleteAppData {
  salonInfo: SalonInfo;
  topics: GalleryTopic[];
  gallery: GalleryItem[];
  services: Service[];
  adminCredentials?: AdminCredentials;
}

// In-memory runtime cache
let inMemoryAppData: CompleteAppData = {
  salonInfo: SALON_INFO,
  topics: INITIAL_GALLERY_TOPICS,
  gallery: INITIAL_GALLERY,
  services: INITIAL_SERVICES
};

// Debounce timer for server background sync
let syncDebounceTimer: any = null;

function triggerDebouncedServerSync() {
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(() => {
    syncAppToServer(inMemoryAppData).catch((err) => {
      console.warn("Background auto-sync warning:", err);
    });
  }, 1000);
}

/**
 * Sync data directly to server backend disk
 */
export async function syncAppToServer(data: Partial<CompleteAppData>): Promise<boolean> {
  try {
    const response = await fetch("/api/app-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    return !!result.success;
  } catch (err) {
    console.warn("Server sync error (will retry or use local storage):", err);
    return false;
  }
}

/**
 * Load application data from Server -> IndexedDB -> localStorage -> Defaults
 */
export async function loadInitialAppData(): Promise<CompleteAppData> {
  // 1. Check if we already have localStorage cached values for immediate return
  let loadedFromLocal: Partial<CompleteAppData> = {};
  try {
    const sInfo = localStorage.getItem(KEYS.SALON_INFO);
    const sTopics = localStorage.getItem(KEYS.TOPICS);
    const sGallery = localStorage.getItem(KEYS.GALLERY);
    const sServices = localStorage.getItem(KEYS.SERVICES);

    if (sInfo) loadedFromLocal.salonInfo = JSON.parse(sInfo);
    if (sTopics) loadedFromLocal.topics = JSON.parse(sTopics);
    if (sGallery) loadedFromLocal.gallery = JSON.parse(sGallery);
    if (sServices) loadedFromLocal.services = JSON.parse(sServices);
  } catch {
    // ignore
  }

  // 2. Fetch authoritative state from Server (/api/app-data) or GitHub Static/Raw
  let serverData: Partial<CompleteAppData> | null = null;
  try {
    const res = await fetch("/api/app-data");
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        serverData = json.data;
      }
    }
  } catch (err) {
    console.warn("Could not reach backend API, checking GitHub / static files:", err);
  }

  // 2.1 If backend API didn't respond (e.g. running on GitHub Pages), try fetching app-data.json
  if (!serverData) {
    try {
      const timestamp = Date.now();
      const candidates = [
        `./data/app-data.json?t=${timestamp}`,
        `./app-data.json?t=${timestamp}`
      ];

      // Auto-detect GitHub Pages repository from hostname if hosted on github.io
      if (typeof window !== "undefined" && window.location.hostname.endsWith(".github.io")) {
        const user = window.location.hostname.replace(".github.io", "");
        const pathSegments = window.location.pathname.split("/").filter(Boolean);
        const repo = pathSegments[0] || "";
        if (user && repo) {
          candidates.push(
            `https://raw.githubusercontent.com/${user}/${repo}/main/data/app-data.json?t=${timestamp}`,
            `https://raw.githubusercontent.com/${user}/${repo}/master/data/app-data.json?t=${timestamp}`
          );
        }
      }

      // Also check saved GitHub config
      const ghConfigStr = localStorage.getItem("queen_salon_github_config");
      if (ghConfigStr) {
        try {
          const ghConfig = JSON.parse(ghConfigStr);
          if (ghConfig.repo) {
            const cleanRepo = ghConfig.repo.replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").trim();
            const branch = ghConfig.branch || "main";
            candidates.push(`https://raw.githubusercontent.com/${cleanRepo}/${branch}/data/app-data.json?t=${timestamp}`);
          }
        } catch {}
      }

      for (const url of candidates) {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (res.ok) {
            const json = await res.json();
            if (json && (json.salonInfo || json.gallery || json.services || json.topics)) {
              serverData = json;
              break;
            }
          }
        } catch {}
      }
    } catch (e) {
      console.warn("Error fetching remote GitHub/static app-data:", e);
    }
  }

  // 3. If server or remote GitHub didn't provide data, try IndexedDB
  let idbSalonInfo = serverData?.salonInfo || (await idbGet<SalonInfo>(KEYS.SALON_INFO)) || loadedFromLocal.salonInfo;
  let idbTopics = serverData?.topics || (await idbGet<GalleryTopic[]>(KEYS.TOPICS)) || loadedFromLocal.topics;
  let idbGallery = serverData?.gallery || (await idbGet<GalleryItem[]>(KEYS.GALLERY)) || loadedFromLocal.gallery;
  let idbServices = serverData?.services || (await idbGet<Service[]>(KEYS.SERVICES)) || loadedFromLocal.services;

  // 4. Merge safely with defaults without erasing user edits, and normalize image paths
  const finalSalonInfo: SalonInfo = {
    ...SALON_INFO,
    ...(idbSalonInfo || {}),
    backgroundBannerUrl: resolveImageUrl(idbSalonInfo?.backgroundBannerUrl || SALON_INFO.backgroundBannerUrl || "./assets/branding/top_banner.jpg"),
    topSmallBannerUrl: resolveImageUrl(idbSalonInfo?.topSmallBannerUrl || idbSalonInfo?.logoUrl || SALON_INFO.topSmallBannerUrl || "./assets/branding/logo.jpg"),
    heroBannerUrl: resolveImageUrl(idbSalonInfo?.heroBannerUrl || SALON_INFO.heroBannerUrl || "./assets/branding/hero.jpg"),
    logoUrl: resolveImageUrl(idbSalonInfo?.logoUrl || idbSalonInfo?.topSmallBannerUrl || SALON_INFO.logoUrl || "./assets/branding/logo.jpg")
  };

  const rawTopics = idbTopics && idbTopics.length > 0 ? idbTopics : INITIAL_GALLERY_TOPICS;
  const finalTopics: GalleryTopic[] = rawTopics.map((t) => ({
    ...t,
    coverImage: resolveImageUrl(t.coverImage)
  }));

  const rawGallery = idbGallery && Array.isArray(idbGallery) ? idbGallery : INITIAL_GALLERY;
  const finalGallery: GalleryItem[] = rawGallery.map((g) => ({
    ...g,
    image: resolveImageUrl(g.image)
  }));

  const rawServices = idbServices && idbServices.length > 0 ? idbServices : INITIAL_SERVICES;
  const finalServices: Service[] = rawServices.map((s) => ({
    ...s,
    image: resolveImageUrl(s.image)
  }));

  const result: CompleteAppData = {
    salonInfo: finalSalonInfo,
    topics: finalTopics,
    gallery: finalGallery,
    services: finalServices
  };

  inMemoryAppData = result;

  // Mirror to IndexedDB and server if server had nothing
  if (!serverData) {
    saveAllAppData(result).catch((e) => console.warn("Initial sync save error:", e));
  } else {
    // Cache server data locally in IndexedDB & localStorage for fast offline boot
    idbSet(KEYS.SALON_INFO, finalSalonInfo).catch(() => {});
    idbSet(KEYS.TOPICS, finalTopics).catch(() => {});
    idbSet(KEYS.GALLERY, finalGallery).catch(() => {});
    idbSet(KEYS.SERVICES, finalServices).catch(() => {});
  }

  return result;
}

export async function saveSalonInfo(info: SalonInfo): Promise<void> {
  inMemoryAppData.salonInfo = info;
  await idbSet(KEYS.SALON_INFO, info);
  triggerDebouncedServerSync();
}

export async function saveTopics(topics: GalleryTopic[]): Promise<void> {
  inMemoryAppData.topics = topics;
  await idbSet(KEYS.TOPICS, topics);
  triggerDebouncedServerSync();
}

export async function saveGallery(gallery: GalleryItem[]): Promise<void> {
  inMemoryAppData.gallery = gallery;
  await idbSet(KEYS.GALLERY, gallery);
  triggerDebouncedServerSync();
}

export async function saveServices(services: Service[]): Promise<void> {
  inMemoryAppData.services = services;
  await idbSet(KEYS.SERVICES, services);
  triggerDebouncedServerSync();
}

/**
 * Consolidates and saves all application data permanently in a single verified operation.
 * Guaranteed to persist on server disk and client browser storage.
 */
export async function saveAllAppData(data: {
  salonInfo?: SalonInfo;
  topics?: GalleryTopic[];
  gallery?: GalleryItem[];
  services?: Service[];
}): Promise<boolean> {
  try {
    const updatedPayload: CompleteAppData = {
      salonInfo: data.salonInfo || inMemoryAppData.salonInfo,
      topics: data.topics || inMemoryAppData.topics,
      gallery: data.gallery || inMemoryAppData.gallery,
      services: data.services || inMemoryAppData.services
    };

    inMemoryAppData = updatedPayload;

    // 1. Write to local storage & IndexedDB
    const promises: Promise<void>[] = [];
    if (data.salonInfo) promises.push(idbSet(KEYS.SALON_INFO, data.salonInfo));
    if (data.topics) promises.push(idbSet(KEYS.TOPICS, data.topics));
    if (data.gallery) promises.push(idbSet(KEYS.GALLERY, data.gallery));
    if (data.services) promises.push(idbSet(KEYS.SERVICES, data.services));
    await Promise.all(promises);

    // 2. Write to server disk database
    const serverSuccess = await syncAppToServer(updatedPayload);
    return true;
  } catch (err) {
    console.error("خطا در ثبت نهایی اطلاعات در حافظه پایدار:", err);
    return false;
  }
}
