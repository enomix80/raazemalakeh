import React from "react";
import { Sparkles, ArrowDown, ShieldCheck, Heart, Star, PhoneCall } from "lucide-react";
import { SalonInfo } from "../types";
import { resolveImageUrl } from "../utils/imagePath";

interface HeroProps {
  salonInfo: SalonInfo;
  heroImageUrl: string;
}

export default function Hero({ salonInfo, heroImageUrl }: HeroProps) {
  const displayHeroImage = resolveImageUrl(salonInfo.heroBannerUrl || heroImageUrl);
  return (
    <section className="relative min-h-[90vh] flex items-center py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Dynamic blurred floating aesthetic elements for deep glassmorphism depth */}
      <div className="absolute top-1/4 right-10 w-72 h-72 rounded-full bg-[#06808B]/5 blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/4 left-10 w-96 h-96 rounded-full bg-[#E6C59E]/20 blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      
      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Main luxury Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Slogan & Intro (Cols 1-7 on desktop) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8 text-right glass-card p-8 sm:p-12 rounded-[2.5rem] relative overflow-hidden group">
            
            <div className="space-y-6">
              {/* Top Badge */}
              <div className="inline-flex items-center gap-2 bg-[#06808B]/10 text-[#06808B] px-5 py-2 rounded-full text-xs sm:text-sm font-bold self-start ml-auto border border-[#06808B]/20 shadow-sm">
                <Sparkles className="w-4 h-4 text-[#06808B]" />
                <span>شکوه و زیبایی شاهانه در سالن راز ملکه</span>
              </div>

              {/* Slogan and Heading */}
              <div className="space-y-5">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#2C1E14] leading-[1.2] sm:leading-[1.15]">
                  {salonInfo.slogan}
                </h1>
                <p className="text-[#2C1E14]/75 text-base sm:text-lg leading-relaxed max-w-xl ml-auto font-medium">
                  در سالن زیبایی <strong className="text-[#06808B] font-extrabold">راز ملکه</strong>، با تکیه بر تخصص برترین آرتیست‌های اصفهان و استفاده از مواد درجه یک بین‌المللی، خدماتی در شأن یک ملکه واقعی را تجربه خواهید کرد. راز زیبایی پنهان خود را با ما آشکار کنید.
                </p>
              </div>
            </div>

            {/* Call to Actions & Trust indicators */}
            <div className="space-y-8 pt-4">
              <div className="flex flex-wrap gap-4">
                <a
                  href={`tel:${salonInfo.phone1}`}
                  className="glass-btn-primary font-extrabold px-8 py-4 rounded-full shadow-md flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 text-base group cursor-pointer"
                >
                  <PhoneCall className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>همین الان نوبتت رو رزرو کن</span>
                </a>
                <a
                  href="#services"
                  className="glass-btn-secondary font-bold px-7 py-4 rounded-full flex items-center justify-center gap-2"
                >
                  <span>مشاهده خدمات تخصصی</span>
                  <ArrowDown className="w-4 h-4 animate-bounce" />
                </a>
              </div>


            </div>
          </div>

          {/* Right Bento Column: Grid of Images and Highlights (Cols 8-12 on desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            
            {/* Upper Box: The Generated Luxury Salon Interior */}
            <div className="relative group overflow-hidden rounded-[2rem] border border-white/50 shadow-md bg-[#2C1E14] h-64 sm:h-72 lg:h-80 flex-1">
              <img
                src={displayHeroImage}
                alt="نمای لوکس سالن راز ملکه"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = resolveImageUrl("./assets/branding/hero.jpg");
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-right">
                <div className="flex items-center gap-1 text-amber-400 mb-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <h3 className="text-white font-extrabold text-lg">آرامش، تجمل و کیفیت بین‌المللی</h3>
                <p className="text-gray-300 text-xs mt-1">تجهیزات و متریال لوکس روز دنیا در محیطی دنج و شاهانه</p>
              </div>
            </div>

            {/* Lower Box: Fast Booking Helper & Location Badge */}
            <div className="glass-card p-8 rounded-[2rem] flex flex-col justify-between space-y-4 text-right">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-[#06808B]/10 rounded-xl text-[#06808B] border border-white/50 shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] sm:text-xs bg-[#06808B] text-white font-black px-4.5 py-1.5 rounded-full shadow-sm">
                  تضمین کیفیت خدمات
                </span>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-extrabold text-[#2C1E14] text-base">آدرس سالن راز ملکه:</h4>
                <p className="text-[#2C1E14]/80 text-sm leading-relaxed font-semibold">
                  اصفهان، خیابان میرزاطاهر شرقی، نبش کوچه ۲۸
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/40">
                <span className="text-xs text-gray-500 font-bold">مشاوره رایگان:</span>
                <a
                  href={`tel:${salonInfo.phone1}`}
                  className="text-[#06808B] hover:text-[#046770] font-black text-sm flex items-center gap-1.5 transition-colors"
                >
                  <span className="font-mono">۰۹۳۹۷۳۶۵۲۷۳</span>
                  <PhoneCall className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
