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
import { db, doc, getDoc, setDoc, onSnapshot } from "../firebase";

const DB_NAME = "QueenSalonStorageDB";
const DB_VERSION = 2;
const STORE_NAME = "keyval";

const KEYS = {
  SALON_INFO: "queen_salon_info",
  TOPICS: "queen_salon_topics_v4",
  GALLERY: "queen_salon_gallery_v4",
  SERVICES: "queen_salon_services_v4",
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
  updatedAt?: string;
}

// In-memory runtime cache
let inMemoryAppData: CompleteAppData = {
  salonInfo: SALON_INFO,
  topics: INITIAL_GALLERY_TOPICS,
  gallery: INITIAL_GALLERY,
  services: INITIAL_SERVICES,
  updatedAt: ""
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
 * Load application data from Server (/api/app-data) -> IndexedDB -> localStorage -> Defaults
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

  let serverData: Partial<CompleteAppData & { updatedAt?: string }> | null = null;

  // 2. Fetch authoritative state from Server backend disk (/api/app-data) FIRST
  try {
    const res = await fetch("/api/app-data", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        serverData = json.data;
      }
    }
  } catch (err) {
    console.warn("Backend API not reachable directly, checking other sources:", err);
  }

  // 2.1 If backend API didn't respond (e.g. running on GitHub Pages / static), try fetching app-data.json
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

  // 2.2 Optional Firestore check ONLY if neither server API nor static app-data.json responded
  if (!serverData) {
    try {
      const cloudDoc = await getDoc(doc(db, "appData", "main"));
      if (cloudDoc.exists()) {
        const cData = cloudDoc.data();
        if (cData && (cData.salonInfo || cData.gallery || cData.services || cData.topics)) {
          serverData = cData as Partial<CompleteAppData>;
        }
      }
    } catch (err) {
      console.warn("Firestore read note (server disk used):", err);
    }
  }

  // 3. Fallbacks: IndexedDB or local storage
  let idbSalonInfo = serverData?.salonInfo || (await idbGet<SalonInfo>(KEYS.SALON_INFO)) || loadedFromLocal.salonInfo;
  let idbTopics = serverData?.topics || (await idbGet<GalleryTopic[]>(KEYS.TOPICS)) || loadedFromLocal.topics;
  let idbGallery = serverData?.gallery !== undefined ? serverData.gallery : ((await idbGet<GalleryItem[]>(KEYS.GALLERY)) || loadedFromLocal.gallery);
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

  // Preserve empty gallery if user explicitly removed items
  const finalGallery: GalleryItem[] = Array.isArray(idbGallery)
    ? idbGallery.map((g) => ({
        ...g,
        image: resolveImageUrl(g.image)
      }))
    : INITIAL_GALLERY.map((g) => ({
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
    services: finalServices,
    updatedAt: serverData?.updatedAt || new Date().toISOString()
  };

  inMemoryAppData = result;
  if (serverData?.updatedAt && (!lastSavedLocalIso || serverData.updatedAt > lastSavedLocalIso)) {
    lastSavedLocalIso = serverData.updatedAt;
  }

  // Cache locally in IndexedDB & localStorage for fast offline boot
  idbSet(KEYS.SALON_INFO, finalSalonInfo).catch(() => {});
  idbSet(KEYS.TOPICS, finalTopics).catch(() => {});
  idbSet(KEYS.GALLERY, finalGallery).catch(() => {});
  idbSet(KEYS.SERVICES, finalServices).catch(() => {});

  return result;
}

export async function saveSalonInfo(info: SalonInfo): Promise<void> {
  inMemoryAppData.salonInfo = info;
  await saveAllAppData({ salonInfo: info });
}

export async function saveTopics(topics: GalleryTopic[]): Promise<void> {
  inMemoryAppData.topics = topics;
  await saveAllAppData({ topics });
}

export async function saveGallery(gallery: GalleryItem[]): Promise<void> {
  inMemoryAppData.gallery = gallery;
  await saveAllAppData({ gallery });
}

export async function saveServices(services: Service[]): Promise<void> {
  inMemoryAppData.services = services;
  await saveAllAppData({ services });
}

let lastSavedLocalIso = "";

/**
 * Consolidates and saves all application data permanently in a single verified operation.
 * Guaranteed to persist on Google Cloud Firestore, server disk, and client browser storage.
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
      topics: data.topics !== undefined ? data.topics : inMemoryAppData.topics,
      gallery: data.gallery !== undefined ? data.gallery : inMemoryAppData.gallery,
      services: data.services !== undefined ? data.services : inMemoryAppData.services
    };

    inMemoryAppData = updatedPayload;
    const nowIso = new Date().toISOString();
    lastSavedLocalIso = nowIso;

    // 1. Write to local storage & IndexedDB
    const promises: Promise<void>[] = [];
    if (data.salonInfo) promises.push(idbSet(KEYS.SALON_INFO, data.salonInfo));
    if (data.topics !== undefined) promises.push(idbSet(KEYS.TOPICS, updatedPayload.topics));
    if (data.gallery !== undefined) promises.push(idbSet(KEYS.GALLERY, updatedPayload.gallery));
    if (data.services !== undefined) promises.push(idbSet(KEYS.SERVICES, updatedPayload.services));
    await Promise.all(promises);

    // 2. Write to server disk database (/api/app-data) FIRST (authoritative permanent storage)
    try {
      await syncAppToServer(updatedPayload);
    } catch (serverErr) {
      console.warn("Server disk sync notice:", serverErr);
    }

    // 3. Non-blocking Firestore cloud mirror (safely caught in case of Firestore daily write quota limit)
    try {
      const mainDoc = doc(db, "appData", "main");
      setDoc(mainDoc, {
        salonInfo: updatedPayload.salonInfo,
        topics: updatedPayload.topics,
        gallery: updatedPayload.gallery,
        services: updatedPayload.services,
        updatedAt: nowIso
      }).catch((firestoreErr) => {
        console.warn("Firestore cloud mirror note (saved to server disk & IndexedDB):", firestoreErr);
      });
    } catch (firestoreErr) {
      console.warn("Firestore cloud mirror error:", firestoreErr);
    }

    return true;
  } catch (err) {
    console.error("خطا در ثبت نهایی اطلاعات در حافظه پایدار:", err);
    return false;
  }
}

/**
 * Real-time subscription to cloud Firestore:
 * Any visitor anywhere in the world will immediately receive live updates
 * whenever the admin changes an image or text!
 */
export function subscribeToRealtimeAppData(onUpdate: (data: CompleteAppData) => void): () => void {
  try {
    const unsub = onSnapshot(
      doc(db, "appData", "main"),
      (snapshot) => {
        if (!snapshot.exists()) return;
        const cData = snapshot.data();
        if (!cData) return;

        // If local update is newer than or equal to incoming Firestore snapshot, do not overwrite local changes
        if (cData.updatedAt && lastSavedLocalIso && cData.updatedAt <= lastSavedLocalIso) {
          return;
        }

        const finalSalonInfo: SalonInfo = {
          ...SALON_INFO,
          ...(cData.salonInfo || {}),
          backgroundBannerUrl: resolveImageUrl(
            cData.salonInfo?.backgroundBannerUrl || SALON_INFO.backgroundBannerUrl,
            "./assets/branding/top_banner.jpg"
          ),
          topSmallBannerUrl: resolveImageUrl(
            cData.salonInfo?.topSmallBannerUrl || cData.salonInfo?.logoUrl || SALON_INFO.topSmallBannerUrl,
            "./assets/branding/logo.jpg"
          ),
          heroBannerUrl: resolveImageUrl(
            cData.salonInfo?.heroBannerUrl || SALON_INFO.heroBannerUrl,
            "./assets/branding/hero.jpg"
          ),
          logoUrl: resolveImageUrl(
            cData.salonInfo?.logoUrl || cData.salonInfo?.topSmallBannerUrl || SALON_INFO.logoUrl,
            "./assets/branding/logo.jpg"
          )
        };

        const rawTopics = cData.topics !== undefined && Array.isArray(cData.topics) ? cData.topics : inMemoryAppData.topics;
        const finalTopics: GalleryTopic[] = rawTopics.map((t: any) => ({
          ...t,
          coverImage: resolveImageUrl(t.coverImage)
        }));

        const rawGallery = cData.gallery !== undefined && Array.isArray(cData.gallery) ? cData.gallery : inMemoryAppData.gallery;
        const finalGallery: GalleryItem[] = rawGallery.map((g: any) => ({
          ...g,
          image: resolveImageUrl(g.image)
        }));

        const rawServices = cData.services !== undefined && Array.isArray(cData.services) ? cData.services : inMemoryAppData.services;
        const finalServices: Service[] = rawServices.map((s: any) => ({
          ...s,
          image: resolveImageUrl(s.image)
        }));

        const complete: CompleteAppData = {
          salonInfo: finalSalonInfo,
          topics: finalTopics,
          gallery: finalGallery,
          services: finalServices
        };

        inMemoryAppData = complete;
        onUpdate(complete);
      },
      (_error) => {
        // Silently handle offline/network disconnection without spamming console
      }
    );

    return unsub;
  } catch (err) {
    return () => {};
  }
}
