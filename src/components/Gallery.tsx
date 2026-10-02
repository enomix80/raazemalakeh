import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Sparkles,
  Crown,
  Palette,
  ShieldCheck,
  Flower2,
  Eye,
  Droplets,
  Scissors,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Layers,
  Image as ImageIcon,
  ImagePlus,
  Phone,
  Trash2
} from "lucide-react";
import { GalleryTopic, GalleryItem, SalonInfo } from "../types";
import { resolveImageUrl } from "../utils/imagePath";

interface GalleryProps {
  topics: GalleryTopic[];
  salonInfo: SalonInfo;
  gallery?: GalleryItem[];
  isAdmin?: boolean;
  onDeleteGalleryItem?: (id: string) => void;
  onRemoveCover?: (topicId: string) => void;
  onAddGalleryItem?: (item: GalleryItem) => void;
}

interface DisplayImage {
  id: string;
  image: string;
  title: string;
  description?: string;
  isCover: boolean;
}

// Icon helper per topic category
const getTopicIcon = (category: string) => {
  switch (category) {
    case "عروس و میکاپ":
      return Crown;
    case "رنگ و مو":
      return Palette;
    case "احیا و کراتین":
      return ShieldCheck;
    case "ناخن و پدیکور":
      return Flower2;
    case "مژه و ابرو":
      return Eye;
    case "پوست و فشیال":
      return Droplets;
    case "بافت و استایل":
      return Scissors;
    default:
      return Sparkles;
  }
};

export default function Gallery({
  topics,
  salonInfo,
  gallery = [],
  isAdmin = false,
  onDeleteGalleryItem,
  onRemoveCover
}: GalleryProps) {
  // Selected active topic ID (defaults to first topic)
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    topics[0]?.id || ""
  );

  // Current active image index in the selected topic (0 is cover, 1..N are samples)
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Fullscreen modal state
  const [isFullscreenOpen, setIsFullscreenOpen] = useState<boolean>(false);

  // Reference for thumbnails container
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Whenever topics change, ensure selectedTopicId is valid
  useEffect(() => {
    if (!topics.find((t) => t.id === selectedTopicId) && topics.length > 0) {
      setSelectedTopicId(topics[0].id);
      setCurrentImageIndex(0);
    }
  }, [topics, selectedTopicId]);

  // Active topic object
  const activeTopic = useMemo(() => {
    return topics.find((t) => t.id === selectedTopicId) || topics[0];
  }, [topics, selectedTopicId]);

  // Reset image index whenever topic changes
  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setCurrentImageIndex(0);
  };

  // Compile all images for this topic: cover image (if present) + samples from gallery
  const topicImages: DisplayImage[] = useMemo(() => {
    if (!activeTopic) return [];

    const samples = gallery.filter(
      (item) => item.category === activeTopic.category && item.image && item.image.trim() !== ""
    );

    const list: DisplayImage[] = [];

    if (activeTopic.coverImage && activeTopic.coverImage.trim() !== "") {
      list.push({
        id: `cover-${activeTopic.id}`,
        image: resolveImageUrl(activeTopic.coverImage),
        title: activeTopic.title,
        description: activeTopic.description,
        isCover: true
      });
    }

    samples.forEach((s) => {
      list.push({
        id: s.id,
        image: resolveImageUrl(s.image),
        title: s.title,
        description: s.description || activeTopic.description,
        isCover: false
      });
    });

    return list;
  }, [activeTopic, gallery]);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailsRef.current) {
      const activeEl = thumbnailsRef.current.children[currentImageIndex] as HTMLElement | undefined;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [currentImageIndex]);

  const scrollThumbnails = (direction: "left" | "right") => {
    if (thumbnailsRef.current) {
      const amount = direction === "left" ? -240 : 240;
      thumbnailsRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  // Current active image object
  const currentImage: DisplayImage | undefined = topicImages[currentImageIndex] || topicImages[0];

  // Navigation handlers
  const handleNext = () => {
    if (topicImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % topicImages.length);
  };

  const handlePrev = () => {
    if (topicImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev - 1 + topicImages.length) % topicImages.length);
  };

  // Keyboard navigation for carousel and lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handleNext();
      } else if (e.key === "ArrowRight") {
        handlePrev();
      } else if (e.key === "Escape") {
        setIsFullscreenOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [topicImages.length]);

  if (!activeTopic) return null;

  return (
    <section id="gallery" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background ambient glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#06808B]/8 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-[#F2D3B7]/25 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Gallery Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 text-[#06808B] text-xs sm:text-sm font-extrabold tracking-wider bg-[#06808B]/10 px-5 py-2 rounded-full border border-[#06808B]/25 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#06808B]" />
            <span>گالری تصاویر و آلبوم نمونه‌کارها</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#2C1E14] font-serif tracking-tight">
            گالری تصاویر <span className="text-gradient">راز ملکه</span>
          </h2>
          <p className="text-[#2C1E14]/75 text-sm sm:text-base leading-relaxed font-semibold">
            لاین تخصصی مورد نظر را از منوی زیر انتخاب کنید تا کاور اصلی و نمونه‌کارهای اختصاصی آن نمایش داده شود.
          </p>
        </div>

        {/* TOPIC ICONS MENU (منوی آیکون‌دار تاپیک‌ها) */}
        <div className="relative">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none justify-start lg:justify-center">
            {topics.map((t) => {
              const isSelected = t.id === activeTopic.id;
              const IconComponent = getTopicIcon(t.category);
              const hasCover = Boolean(t.coverImage && t.coverImage.trim() !== "");
              const samplesCount = gallery.filter(
                (g) => g.category === t.category && g.image && g.image.trim() !== ""
              ).length;
              const totalCount = (hasCover ? 1 : 0) + samplesCount;

              return (
                <button
                  key={t.id}
                  onClick={() => handleSelectTopic(t.id)}
                  className={`group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl transition-all duration-300 shrink-0 cursor-pointer border ${
                    isSelected
                      ? "bg-[#06808B] text-white border-[#06808B] shadow-[0_8px_20px_rgba(6,128,139,0.3)] scale-102"
                      : "bg-white/60 hover:bg-white text-[#2C1E14] border-white/80 hover:border-[#06808B]/30 shadow-xs hover:shadow-md"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-[#06808B]/10 text-[#06808B]"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>

                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-black block leading-tight">
                      {t.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold block mt-0.5 ${
                        isSelected ? "text-white/80" : "text-gray-500"
                      }`}
                    >
                      {totalCount === 0 ? "بدون تصویر" : `${totalCount} تصویر`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN STAGE: ACTIVE TOPIC COVER & VIEWER (کاور بزرگ و گالری اصلی) */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white/80 overflow-hidden shadow-xl">
            
            {/* Top Bar on Stage: Topic Badge & Photo Counter */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#06808B]/10 bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="bg-[#06808B] text-white text-xs font-black px-3.5 py-1 rounded-full shadow-xs">
                  {activeTopic.badgeText || "لاین تخصصی"}
                </span>
                <span className="text-xs sm:text-sm font-black text-[#2C1E14]">
                  {activeTopic.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-2xs">
                  {topicImages.length > 0
                    ? `تصویر ${currentImageIndex + 1} از ${topicImages.length}`
                    : "بدون تصویر"}
                </span>
                {topicImages.length > 0 && (
                  <button
                    onClick={() => setIsFullscreenOpen(true)}
                    className="p-1.5 rounded-xl bg-white hover:bg-gray-100 text-[#06808B] border border-gray-200 transition-colors shadow-2xs cursor-pointer"
                    title="نمایش تمام صفحه"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Main Image Display Container or Empty State Placeholder */}
            {topicImages.length === 0 ? (
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-[#FAF8F5] to-white/70">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#06808B]/10 text-[#06808B] flex items-center justify-center mb-4 border border-[#06808B]/20 shadow-xs">
                  <ImagePlus className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div className="inline-block bg-[#06808B] text-white text-[11px] font-black px-3.5 py-1 rounded-full mb-2.5 shadow-2xs">
                  {activeTopic.badgeText || "لاین تخصصی"}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#2C1E14] font-serif mb-2">
                  {activeTopic.title}
                </h3>
                {activeTopic.description && (
                  <p className="text-gray-600 text-xs sm:text-sm font-medium max-w-lg leading-relaxed mb-4">
                    {activeTopic.description}
                  </p>
                )}
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#06808B] bg-white px-4 py-2 rounded-xl border border-[#06808B]/20 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-[#06808B]" />
                  <span>هنوز عکسی برای این لاین ثبت نشده؛ می‌توانید از پنل مدیریت عکس کاور و نمونه‌کارها را اضافه کنید.</span>
                </div>
              </div>
            ) : (
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-black/5 group">
                {currentImage && (
                  <img
                    key={currentImage.id}
                    src={currentImage.image}
                    alt={currentImage.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-all duration-500 cursor-pointer"
                    onClick={() => setIsFullscreenOpen(true)}
                  />
                )}

                {/* Admin Quick Delete Overlay on Main Viewer */}
                {isAdmin && currentImage && (
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (currentImage.isCover) {
                          onRemoveCover?.(activeTopic.id);
                        } else {
                          onDeleteGalleryItem?.(currentImage.id);
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-3.5 py-2 rounded-xl backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-red-400"
                      title={currentImage.isCover ? "حذف عکس کاور این لاین" : "حذف این نمونه‌کار از گالری"}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{currentImage.isCover ? "حذف عکس کاور" : "حذف این نمونه‌کار"}</span>
                    </button>
                  </div>
                )}

                {/* Gradient Vignette at Bottom - Only for cover image */}
                {currentImage?.isCover && (
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2C1E14]/90 via-[#2C1E14]/20 to-transparent pointer-events-none" />
                )}

                {/* Navigation Arrows (دکمه‌های جلو و عقب) */}
                {topicImages.length > 1 && (
                  <>
                    {/* Right Button (Previous in RTL) */}
                    <button
                      onClick={handlePrev}
                      aria-label="تصویر قبلی"
                      className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/80 hover:bg-white text-[#2C1E14] backdrop-blur-md border border-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer z-10"
                      title="تصویر قبلی"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Left Button (Next in RTL) */}
                    <button
                      onClick={handleNext}
                      aria-label="تصویر بعدی"
                      className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/80 hover:bg-white text-[#2C1E14] backdrop-blur-md border border-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer z-10"
                      title="تصویر بعدی"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Bottom Caption Overlay - ONLY shown for cover image */}
                {currentImage?.isCover && (
                  <div className="absolute bottom-4 right-4 left-4 text-right pointer-events-none">
                    <div className="inline-block bg-[#06808B] backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-black mb-1.5 shadow-xs">
                      {activeTopic.badgeText || "★ کاور اصلی لاین"}
                    </div>
                    <h3 className="text-lg sm:text-2xl font-black text-white font-serif tracking-tight drop-shadow-md">
                      {activeTopic.title}
                    </h3>
                    {activeTopic.description && (
                      <p className="text-white/95 text-xs sm:text-sm font-semibold leading-relaxed line-clamp-2 sm:line-clamp-3 mt-1 drop-shadow-sm max-w-2xl">
                        {activeTopic.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* THUMBNAILS ROW UNDERNEATH (نمونه‌ها با اسکرول هوشمند تا ۲۰ تصویر) */}
            <div className="p-4 sm:p-6 bg-white/40 border-t border-[#06808B]/10">
              <div className="flex items-center justify-between mb-3 text-xs font-black text-gray-700">
                <span className="flex items-center gap-1.5 text-[#06808B]">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>آلبوم تصاویر این لاین:</span>
                  <span className="text-[10px] bg-[#06808B]/10 text-[#06808B] px-2 py-0.5 rounded-full font-bold">
                    {topicImages.length} تصویر
                  </span>
                </span>
                <span className="text-[11px] text-gray-500 font-bold">
                  {topicImages.length > 0 ? `${currentImageIndex + 1} از ${topicImages.length}` : "بدون نمونه‌کار"}
                </span>
              </div>

              {/* Horizontal Thumbnails List with Scroll Navigation */}
              {topicImages.length > 0 ? (
                <div className="relative group/thumbs">
                  {/* Left / Right Scroll Buttons for Long Lists (up to 20 images) */}
                  {topicImages.length > 5 && (
                    <>
                      <button
                        type="button"
                        onClick={() => scrollThumbnails("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#2C1E14] shadow-md border border-gray-200 flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 opacity-0 group-hover/thumbs:opacity-100"
                        title="مشاهده تصاویر قبلی"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollThumbnails("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#2C1E14] shadow-md border border-gray-200 flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 opacity-0 group-hover/thumbs:opacity-100"
                        title="مشاهده تصاویر بعدی"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  <div
                    ref={thumbnailsRef}
                    className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scroll-smooth px-1"
                  >
                    {topicImages.map((img, idx) => {
                      const isActive = idx === currentImageIndex;
                      return (
                        <button
                          key={img.id}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`group/thumb relative w-18 h-18 sm:w-22 sm:h-22 rounded-2xl overflow-hidden shrink-0 transition-all duration-300 cursor-pointer border ${
                            isActive
                              ? "ring-3 ring-[#06808B] border-2 border-white scale-105 shadow-md"
                              : "border-white/80 opacity-75 hover:opacity-100 hover:scale-102"
                          }`}
                          title={`${img.title} (تصویر ${idx + 1} از ${topicImages.length})`}
                        >
                          <img
                            src={img.image}
                            alt={img.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          {img.isCover ? (
                            <span className="absolute top-1 right-1 bg-[#06808B] text-white text-[9px] font-black px-1.5 py-0.2 rounded-md shadow-2xs">
                              کاور
                            </span>
                          ) : (
                            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] font-mono font-bold px-1 rounded">
                              {idx}
                            </span>
                          )}
                          {isActive && (
                            <div className="absolute inset-0 bg-[#06808B]/15 pointer-events-none" />
                          )}
                          {isAdmin && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                if (img.isCover) {
                                  onRemoveCover?.(activeTopic.id);
                                } else {
                                  onDeleteGalleryItem?.(img.id);
                                }
                              }}
                              className="absolute top-1 left-1 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-lg opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow-md hover:scale-110 cursor-pointer z-10"
                              title={img.isCover ? "حذف عکس کاور" : "حذف این نمونه‌کار"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-xs font-medium text-gray-500 flex items-center justify-center gap-2">
                  <span>هیچ نمونه‌کاری ثبت نشده است. از پنل مدیریت می‌توانید تا ۲۰ عکس دلخواه برای این لاین بارگذاری نمایید.</span>
                </div>
              )}
            </div>

            {/* Direct Reservation Call Action Bar */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#06808B]/5 via-white/80 to-[#06808B]/5 border-t border-[#06808B]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#06808B]/10 text-[#06808B] flex items-center justify-center shrink-0 border border-[#06808B]/20 shadow-xs">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#2C1E14]">
                    رزرو نوبت تخصصی {activeTopic.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-semibold">
                    جهت هماهنگی وقت و مشاوره با متخصصین سالن راز ملکه تماس بگیرید.
                  </p>
                </div>
              </div>

              <a
                href={`tel:${salonInfo.phone1 || "09397365273"}`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-l from-[#06808B] to-[#046770] hover:from-[#07909c] hover:to-[#056f79] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 active:scale-98 cursor-pointer shrink-0"
                title={`تماس تلفنی جهت رزرو نوبت ${activeTopic.title}`}
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>تماس برای رزرو نوبت: {salonInfo.phone1 || "09397365273"}</span>
              </a>
            </div>

          </div>
        </div>

        {/* FULLSCREEN LIGHTBOX MODAL */}
        {isFullscreenOpen && currentImage && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 animate-fade-in-up">
            {/* Top Bar in Fullscreen */}
            <div className="w-full max-w-6xl flex items-center justify-between text-white z-10">
              <div className="flex items-center gap-2">
                <span className="bg-[#06808B] text-white text-xs font-black px-3.5 py-1 rounded-full">
                  {activeTopic.title}
                </span>
                <span className="text-xs text-white/70 font-bold">
                  {currentImageIndex + 1} از {topicImages.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentImage.isCover) {
                        onRemoveCover?.(activeTopic.id);
                      } else {
                        onDeleteGalleryItem?.(currentImage.id);
                      }
                      setIsFullscreenOpen(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer border border-red-500"
                    title={currentImage.isCover ? "حذف عکس کاور این لاین" : "حذف این نمونه‌کار"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{currentImage.isCover ? "حذف کاور" : "حذف این عکس"}</span>
                  </button>
                )}

                <button
                  onClick={() => setIsFullscreenOpen(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="بستن (Esc)"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Main Fullscreen Image Area */}
            <div className="relative flex-grow flex items-center justify-center w-full max-w-5xl my-4">
              <img
                src={currentImage.image}
                alt={currentImage.title}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
              />

              {/* Fullscreen Navigation Arrows */}
              {topicImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                    title="تصویر قبلی"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  <button
                    onClick={handleNext}
                    className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                    title="تصویر بعدی"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Caption & Mini Thumbnails in Lightbox - ONLY show text for cover image */}
            <div className="w-full max-w-4xl text-center space-y-3 z-10">
              {currentImage.isCover && (
                <div>
                  <h4 className="text-lg font-black text-white font-serif">
                    {activeTopic.title}
                  </h4>
                  {activeTopic.description && (
                    <p className="text-white/75 text-xs font-medium max-w-xl mx-auto mt-0.5">
                      {activeTopic.description}
                    </p>
                  )}
                </div>
              )}

              {/* Lightbox Thumbnails (Smooth Scroll for up to 20 images) */}
              <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 max-w-full px-2 scrollbar-none">
                {topicImages.map((img, idx) => (
                  <button
                    key={`fs-${img.id}`}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 transition-all cursor-pointer border ${
                      idx === currentImageIndex
                        ? "border-[#06808B] ring-2 ring-[#06808B] scale-110 shadow-lg"
                        : "border-white/30 opacity-60 hover:opacity-100"
                    }`}
                    title={`${img.title} (${idx + 1} از ${topicImages.length})`}
                  >
                    <img
                      src={img.image}
                      alt={img.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[8px] font-mono px-1 rounded">
                      {idx + 1}
                    </span>
                  </button>
                ))}
              </div>

              {/* Lightbox Call Reservation Button */}
              <div className="mt-3 flex justify-center">
                <a
                  href={`tel:${salonInfo.phone1 || "09397365273"}`}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-l from-[#06808B] to-[#046770] hover:from-[#07909c] hover:to-[#056f79] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer"
                  title="تماس جهت رزرو نوبت"
                >
                  <Phone className="w-4 h-4" />
                  <span>تماس برای رزرو نوبت: {salonInfo.phone1 || "09397365273"}</span>
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
