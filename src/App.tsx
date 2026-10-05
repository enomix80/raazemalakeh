import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Gallery from "./components/Gallery";
import AdminPanel from "./components/AdminPanel";
import Footer from "./components/Footer";
import { INITIAL_SERVICES, INITIAL_GALLERY, INITIAL_GALLERY_TOPICS, SALON_INFO } from "./data";
import { Service, GalleryItem, GalleryTopic, SalonInfo } from "./types";
import { resolveImageUrl } from "./utils/imagePath";
import {
  loadInitialAppData,
  saveSalonInfo,
  saveTopics,
  saveGallery,
  saveServices,
  saveAllAppData,
  subscribeToRealtimeAppData
} from "./utils/persistentStorage";

import logoImg from "./assets/images/queen_salon_logo_1790400000616.jpg";
import heroImg from "./assets/images/queen_salon_hero_1784275349018.jpg";

// Dedicated branding image paths
const LOGO_IMAGE_PATH = "./assets/branding/logo.jpg";
const HERO_IMAGE_PATH = "./assets/branding/hero.jpg";
const TOP_BANNER_IMAGE_PATH = "./assets/branding/top_banner.jpg";

export default function App() {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [topics, setTopics] = useState<GalleryTopic[]>(INITIAL_GALLERY_TOPICS);
  const [salonInfo, setSalonInfo] = useState<SalonInfo>(SALON_INFO);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Load state from IndexedDB (with synchronous localStorage initial hydration for instant render)
  useEffect(() => {
    if (!window.location.hash || window.location.hash === "#") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }

    // 1. Instant hydration from localStorage if available
    try {
      const savedInfo = localStorage.getItem("queen_salon_info");
      if (savedInfo) setSalonInfo(JSON.parse(savedInfo));

      const savedTopics = localStorage.getItem("queen_salon_topics_v4");
      if (savedTopics) setTopics(JSON.parse(savedTopics));

      const savedGallery = localStorage.getItem("queen_salon_gallery_v4");
      if (savedGallery) setGallery(JSON.parse(savedGallery));

      const savedServices = localStorage.getItem("queen_salon_services_v5");
      if (savedServices) setServices(JSON.parse(savedServices));
    } catch {
      // ignore
    }

    // 2. Load authoritative cloud & persistent data
    loadInitialAppData()
      .then((data) => {
        setSalonInfo(data.salonInfo);
        setTopics(data.topics);
        setGallery(data.gallery);
        setServices(data.services);
      })
      .catch((err) => {
        console.warn("Storage load error:", err);
      });

    // 3. Subscribe to real-time Google Cloud Firestore updates
    // Whenever an image is changed in Admin Panel, EVERY visitor with the link gets the update in real time!
    const unsubscribeCloud = subscribeToRealtimeAppData((cloudData) => {
      setSalonInfo(cloudData.salonInfo);
      setTopics(cloudData.topics);
      setGallery(cloudData.gallery);
      setServices(cloudData.services);
    });

    const savedAdminLogin = sessionStorage.getItem("queen_admin_logged_in");
    if (savedAdminLogin === "true") {
      setIsAdminLoggedIn(true);
    }

    // Check if URL has #admin
    if (window.location.hash === "#admin") {
      setShowAdminPanel(true);
    }

    // Keyboard shortcut (Ctrl+Shift+A) for admin access
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setShowAdminPanel(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      unsubscribeCloud();
    };
  }, []);

  // Sync state helpers with durable IndexedDB persistent storage
  const handleUpdateServices = (newServices: Service[]) => {
    setServices(newServices);
    saveServices(newServices).catch((e) => console.error("Error saving services:", e));
  };

  const handleUpdateGallery = (newGallery: GalleryItem[]) => {
    setGallery(newGallery);
    saveGallery(newGallery).catch((e) => console.error("Error saving gallery:", e));
  };

  const handleAddGalleryItem = (newItem: GalleryItem) => {
    const updated = [newItem, ...gallery];
    setGallery(updated);
    saveGallery(updated).catch((e) => console.error("Error saving gallery:", e));
  };

  const handleUpdateTopics = (newTopics: GalleryTopic[]) => {
    setTopics(newTopics);
    saveTopics(newTopics).catch((e) => console.error("Error saving topics:", e));
  };

  const handleUpdateSalonInfo = (newInfo: SalonInfo) => {
    setSalonInfo(newInfo);
    saveSalonInfo(newInfo).catch((e) => console.error("Error saving salon info:", e));
  };

  const handleFinalSaveAll = async (data: {
    salonInfo: SalonInfo;
    topics: GalleryTopic[];
    gallery: GalleryItem[];
    services: Service[];
  }): Promise<boolean> => {
    setSalonInfo(data.salonInfo);
    setTopics(data.topics);
    setGallery(data.gallery);
    setServices(data.services);
    return await saveAllAppData(data);
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    sessionStorage.setItem("queen_admin_logged_in", "true");
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setShowAdminPanel(false);
    sessionStorage.removeItem("queen_admin_logged_in");
  };

  const effectiveLogoUrl = resolveImageUrl(salonInfo.topSmallBannerUrl || salonInfo.logoUrl || LOGO_IMAGE_PATH);
  const effectiveHeroBanner = resolveImageUrl(salonInfo.heroBannerUrl || HERO_IMAGE_PATH);
  const effectiveBgBanner = resolveImageUrl(salonInfo.backgroundBannerUrl || TOP_BANNER_IMAGE_PATH);

  return (
    <div className="min-h-screen bg-transparent flex flex-col selection:bg-[#06808B] selection:text-white">
      {/* Top stretched luxury header background banner */}
      <div className="w-full h-44 sm:h-56 md:h-64 relative overflow-hidden bg-gradient-to-b from-black/5 to-transparent border-b border-[#06808B]/10">
        <img
          src={effectiveBgBanner}
          alt="Queen Salon Interior Banner Header"
          className="w-full h-full object-cover opacity-45 filter brightness-105 contrast-105 transition-all duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src = resolveImageUrl(TOP_BANNER_IMAGE_PATH);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F3ECE0] via-[#F3ECE0]/30 to-transparent" />
        
        {/* Banner overlay with top-right small banner and center title */}
        <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto pointer-events-none">
          {/* Top-Right Small Banner (بنر کوچک سمت راست بالا) */}
          <div className="flex items-center gap-2.5 bg-white/70 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/80 shadow-sm pointer-events-auto">
            <img
              src={effectiveLogoUrl}
              alt="نشان بالای سالن راز ملکه"
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl object-contain bg-white p-0.5 border border-[#06808B]/10 shadow-xs"
              onError={(e) => {
                (e.target as HTMLImageElement).src = resolveImageUrl(LOGO_IMAGE_PATH);
              }}
            />
            <div className="flex flex-col text-right">
              <span className="text-xs sm:text-sm font-black text-[#2C1E14] font-serif tracking-tight">
                {salonInfo.name}
              </span>
              <span className="text-[9px] text-[#06808B] font-bold tracking-wider">
                VIP BEAUTY SALON
              </span>
            </div>
          </div>

          {/* Center Royal Crest */}
          <div className="bg-white/50 backdrop-blur-md px-4 sm:px-6 py-2 rounded-full border border-white/70 shadow-sm">
            <span className="text-[11px] sm:text-xs font-black text-[#06808B] tracking-wider font-serif">
              ♛ RAAZE MALAKE BEAUTY SANCTUARY ♛
            </span>
          </div>
        </div>
      </div>

      {/* Premium Navbar with Logo reference */}
      <Navbar
        salonInfo={salonInfo}
        onAdminClick={() => setShowAdminPanel(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={handleAdminLogout}
        logoUrl={effectiveLogoUrl}
      />

      {/* Hero section */}
      <Hero salonInfo={salonInfo} heroImageUrl={effectiveHeroBanner} />

      {/* Services Menu Section */}
      <Services services={services} bookingPhone="09132008178" />

      {/* Photo Gallery Section with Category/Topic Panels */}
      <Gallery
        gallery={gallery}
        topics={topics}
        salonInfo={salonInfo}
        isAdmin={isAdminLoggedIn}
        onDeleteGalleryItem={(id) => handleUpdateGallery(gallery.filter((g) => g.id !== id))}
        onRemoveCover={(topicId) => {
          const updatedTopics = topics.map((t) => (t.id === topicId ? { ...t, coverImage: "" } : t));
          handleUpdateTopics(updatedTopics);
        }}
        onAddGalleryItem={handleAddGalleryItem}
      />

      {/* Footer */}
      <Footer
        salonInfo={salonInfo}
        onAdminClick={() => setShowAdminPanel(true)}
        logoUrl={effectiveLogoUrl}
      />

      {/* Modal Administrative Dashboard */}
      {showAdminPanel && (
        <AdminPanel
          services={services}
          gallery={gallery}
          topics={topics}
          salonInfo={salonInfo}
          onUpdateServices={handleUpdateServices}
          onUpdateGallery={handleUpdateGallery}
          onUpdateTopics={handleUpdateTopics}
          onUpdateSalonInfo={handleUpdateSalonInfo}
          onFinalSaveAll={handleFinalSaveAll}
          onClose={() => {
            setShowAdminPanel(false);
          }}
          isAdminLoggedIn={isAdminLoggedIn}
          onLoginSuccess={handleAdminLogin}
          onLogout={handleAdminLogout}
        />
      )}
    </div>
  );
}
