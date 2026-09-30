import React, { useState } from "react";
import { Sparkles, Phone, Search } from "lucide-react";
import { Service } from "../types";
import { resolveImageUrl } from "../utils/imagePath";

interface ServicesProps {
  services: Service[];
  bookingPhone?: string;
}

export default function Services({
  services,
  bookingPhone = "09132008178"
}: ServicesProps) {
  const [selectedCategory, setSelectedCategory] = useState("همه");
  const [searchQuery, setSearchQuery] = useState("");

  const targetPhone = bookingPhone || "09132008178";

  // Extract unique categories
  const categories = ["همه", ...Array.from(new Set(services.map((s) => s.category)))];

  // Filter based on search and selected category
  const filteredServices = services.filter((service) => {
    const matchesCategory = selectedCategory === "همه" || service.category === selectedCategory;
    const matchesSearch =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Decorative ambient background spots */}
      <div className="absolute top-1/3 left-5 w-60 h-60 rounded-full bg-[#06808B]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-5 w-80 h-80 rounded-full bg-[#E6C59E]/15 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-[#06808B] text-sm font-extrabold tracking-wider bg-[#06808B]/10 px-5 py-2 rounded-full border border-[#06808B]/25 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#06808B]" />
            <span>پکیج‌های خدماتی ویژه ملکه</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#2C1E14] font-serif tracking-tight">
            منوی خدمات تخصصی <span className="text-gradient">راز ملکه</span>
          </h2>
          <p className="text-[#2C1E14]/75 text-sm sm:text-base leading-relaxed font-semibold">
            تمامی خدمات ما با استفاده از متریال مرغوب، بهداشتی و ماندگار ارائه می‌گردد. جهت رزرو هر لاین می‌توانید مستقیماً تماس بگیرید.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="glass-card p-6 rounded-3xl mb-12 flex flex-col lg:flex-row gap-6 items-center justify-between border border-white/50 shadow-md">
          
          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none scroll-smooth">
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer border ${
                    selectedCategory === cat
                      ? "bg-[#06808B] text-white border-[#06808B] shadow-md scale-102"
                      : "bg-white/40 text-[#2C1E14]/80 border-white/60 hover:bg-[#06808B]/10 hover:text-[#06808B] hover:border-[#06808B]/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <input
              type="text"
              placeholder="جستجو در بین لاین‌های خدمات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-5 py-3 rounded-full bg-white/50 border border-[#06808B]/20 text-[#2C1E14] placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#06808B]/20 focus:border-[#06808B] text-right"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                id={`service-card-${service.id}`}
                className="group glass-card rounded-[2.2rem] overflow-hidden border border-white/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1.5 bg-white/60 backdrop-blur-md"
              >
                {/* Service Image Container */}
                <div className="relative h-60 overflow-hidden rounded-t-[2.2rem]">
                  <img
                    src={resolveImageUrl(service.image)}
                    alt={service.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = resolveImageUrl("./assets/services/lashes.jpg");
                    }}
                  />
                  {/* Category Tag on Image */}
                  <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-[#06808B] text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-sm border border-white/50">
                    {service.category}
                  </span>
                </div>

                {/* Service Details & Dedicated Reservation Option */}
                <div className="p-7 flex flex-col flex-grow text-right justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-extrabold text-xl text-[#2C1E14] group-hover:text-[#06808B] transition-colors font-serif">
                        {service.title}
                      </h3>
                      {service.price && (
                        <span className="text-[11px] font-black text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl shrink-0">
                          {service.price}
                        </span>
                      )}
                    </div>
                    <p className="text-[#2C1E14]/80 text-xs sm:text-sm leading-relaxed font-semibold">
                      {service.description}
                    </p>
                  </div>

                  {/* DEDICATED RESERVATION GLASS BOX UNDER EACH SERVICE - CALL ONLY */}
                  <div className="mt-5 p-3.5 sm:p-4 rounded-2xl bg-white/45 backdrop-blur-md border border-white/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_4px_16px_rgba(44,30,20,0.03)] space-y-3">
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className="flex items-center gap-1.5 text-[#06808B]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>هماهنگی و رزرو نوبت:</span>
                      </span>
                      <span className="font-mono text-xs font-black text-[#2C1E14] bg-white/80 backdrop-blur-sm px-2.5 py-0.5 rounded-lg border border-white/90 shadow-xs dir-ltr">
                        {targetPhone}
                      </span>
                    </div>

                    {/* Single Glassy Call Button for Reservation */}
                    <a
                      href={`tel:${targetPhone}`}
                      className="group/btn w-full relative overflow-hidden bg-gradient-to-l from-[#06808B] via-[#06808B] to-[#046770] hover:from-[#07909c] hover:to-[#056f79] text-white py-3 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 border border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_4px_14px_rgba(6,128,139,0.25)] hover:shadow-[0_6px_22px_rgba(6,128,139,0.38)] transition-all duration-300 backdrop-blur-md active:scale-98 cursor-pointer text-center"
                      title={`تماس تلفنی برای رزرو نوبت ${service.title}`}
                    >
                      <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                      <Phone className="w-4 h-4 shrink-0 transition-transform group-hover/btn:rotate-12" />
                      <span className="relative z-10">تماس تلفنی برای رزرو نوبت</span>
                    </a>
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/30 backdrop-blur-md rounded-3xl border-2 border-dashed border-[#06808B]/20">
            <p className="text-gray-500 font-bold">هیچ لاین خدماتی با مشخصات مورد نظر پیدا نشد.</p>
          </div>
        )}
      </div>
    </section>
  );
}
