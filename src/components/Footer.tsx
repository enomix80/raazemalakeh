import React from "react";
import { Sparkles, Phone, Instagram, MapPin, Compass, ShieldCheck } from "lucide-react";
import { SalonInfo } from "../types";
import Logo from "./Logo";

interface FooterProps {
  salonInfo: SalonInfo;
  onAdminClick: () => void;
  logoUrl?: string;
}

export default function Footer({ salonInfo, onAdminClick, logoUrl }: FooterProps) {
  // Navigation Routing URLs
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    "اصفهان، خیابان میرزاطاهر شرقی، نبش کوچه ۲۸"
  )}`;
  const neshanUrl = `https://neshan.org/maps/search/${encodeURIComponent(
    "اصفهان، خیابان میرزاطاهر شرقی، نبش کوچه ۲۸"
  )}`;

  return (
    <footer id="contact" className="glass-card border-t border-white/75 shadow-2xl pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-[#2C1E14]">
      {/* Dynamic blurred decorative blobs for the footer */}
      <div className="absolute top-10 right-1/4 w-80 h-80 rounded-full bg-[#06808B]/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/3 w-64 h-64 rounded-full bg-[#E6C59E]/30 blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 text-right border-b border-[#06808B]/10 pb-16">
          {/* Column 1: Brand Info (Cols 1-5) */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <img
                src={logoUrl || "/salon-images/logo.jpg"}
                alt={salonInfo.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl border border-[#06808B]/10 object-contain shadow-md bg-white p-1"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl text-[#2C1E14] tracking-tight font-serif">{salonInfo.name}</span>
                <span className="text-[10px] text-[#06808B] tracking-wider font-black">RAAZE MALAKE • LUXURY SALON</span>
              </div>
            </div>
            
            <p className="text-[#2C1E14]/80 text-sm leading-relaxed max-w-sm font-semibold">
              سالن زیبایی راز ملکه، پناهگاهی دنج برای بازآفرینی حس طراوت، شادابی و تجمل غایی است. ما با بهره‌گیری از متخصصین خلاق، زیبایی طبیعی شما را به اوج شکوه می‌رسانیم.
            </p>

            <div className="flex items-center gap-3 bg-white/40 border border-white/60 p-4 rounded-2xl max-w-sm shadow-sm">
              <ShieldCheck className="w-5 h-5 text-[#06808B] shrink-0" />
              <span className="text-xs text-[#2C1E14]/80 leading-relaxed font-bold">
                استفاده از کیت‌های یکبار مصرف تخصصی و رعایت کامل شیوه‌نامه‌های بهداشتی در تمامی لاین‌ها.
              </span>
            </div>
          </div>

          {/* Column 2: Access & Links (Cols 6-8) */}
          <div className="md:col-span-3 space-y-6">
            <h3 className="font-extrabold text-[#06808B] text-lg">بخش‌های وبسایت</h3>
            <ul className="space-y-3.5 text-sm font-bold text-[#2C1E14]/80">
              <li>
                <a href="#services" className="hover:text-[#06808B] transition-colors">
                  منوی خدمات راز ملکه
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-[#06808B] transition-colors">
                  گالری کارهای واقعی
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#06808B] transition-colors">
                  اطلاعات تماس و آدرس
                </a>
              </li>
              <li>
                <button
                  onClick={onAdminClick}
                  className="text-[#2C1E14]/60 hover:text-[#06808B] transition-colors text-right text-xs cursor-pointer font-extrabold hover:underline"
                >
                  ورود همکاران سالن (پنل مدیریت)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info & Map Routing (Cols 9-12) */}
          <div className="md:col-span-4 space-y-6">
            <h3 className="font-extrabold text-[#06808B] text-lg">ارتباط و موقعیت مکانی</h3>
            
            <div className="space-y-4 text-sm font-bold text-[#2C1E14]/80">
              {/* Address */}
              <div className="flex gap-2.5 items-start">
                <MapPin className="w-5 h-5 text-[#06808B] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-black text-[#2C1E14]">آدرس فیزیکی سالن:</span>
                  <span className="text-[#2C1E14]/85 text-xs sm:text-sm mt-1 block leading-relaxed">{salonInfo.address}</span>
                </div>
              </div>

              {/* Phones (direct tel links for dialer access) */}
              <div className="flex gap-2.5 items-start">
                <Phone className="w-5 h-5 text-[#06808B] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-black text-[#2C1E14]">شماره‌های تماس سالن:</span>
                  <div className="flex gap-3 mt-1.5 font-mono text-xs sm:text-sm font-bold">
                    <a
                      href={`tel:${salonInfo.phone1}`}
                      className="text-[#2C1E14] hover:text-[#06808B] transition-colors border-b border-gray-500/20 pb-0.5"
                    >
                      {salonInfo.phone1}
                    </a>
                    <span className="text-gray-400">|</span>
                    <a
                      href={`tel:${salonInfo.phone2}`}
                      className="text-[#2C1E14] hover:text-[#06808B] transition-colors border-b border-gray-500/20 pb-0.5"
                    >
                      {salonInfo.phone2}
                    </a>
                  </div>
                </div>
              </div>

              {/* Instagram link */}
              <div className="flex gap-2.5 items-start">
                <Instagram className="w-5 h-5 text-[#06808B] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-black text-[#2C1E14]">صفحه رسمی اینستاگرام:</span>
                  <a
                    href={`https://instagram.com/${salonInfo.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2C1E14]/90 hover:text-[#06808B] transition-colors font-mono text-sm inline-block mt-1 hover:underline"
                  >
                    @{salonInfo.instagram}
                  </a>
                </div>
              </div>
            </div>

            {/* Google Maps & Neshan Routing - Interactive Minimap Bento Card */}
            <div className="pt-4 space-y-3">
              <span className="block text-xs font-black text-[#2C1E14]/70">مسیریابی هوشمند ملوکانه روی نقشه:</span>
              
              <div className="relative aspect-[4/3] w-full max-w-sm rounded-3xl overflow-hidden border border-[#06808B]/20 bg-white/45 shadow-lg group/map">
                {/* Simulated map grid overlay */}
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[linear-gradient(to_right,#06808B_1.5px,transparent_1.5px),linear-gradient(to_bottom,#06808B_1.5px,transparent_1.5px)] bg-[size:28px_28px]" />
                
                {/* Custom organic vectors simulating streets */}
                <svg className="absolute inset-0 w-full h-full text-[#06808B]/10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M-20,40 Q110,130 240,30 T510,90" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                  <path d="M120,-30 Q190,140 110,320" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                  <path d="M-40,190 L420,140" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>

                {/* Pulse radar location marker of the salon */}
                <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <span className="relative flex h-10 w-10">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06808B] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-10 w-10 bg-[#06808B]/10 border-2 border-[#06808B] flex items-center justify-center shadow-md bg-white">
                      <MapPin className="w-5 h-5 text-[#06808B]" />
                    </span>
                  </span>
                  <span className="mt-2 px-3 py-1 rounded-full bg-[#06808B] text-white text-[10px] font-black whitespace-nowrap shadow-md border border-white/20">
                    راز ملکه
                  </span>
                </div>

                {/* Translucent overlay dock with Map links */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-white/70 shadow-md flex flex-col gap-2">
                  <div className="text-[10px] font-extrabold text-[#2C1E14]/80 text-center">
                    یکی از گزینه‌های زیر را جهت شروع جهت‌یابی لمس کنید:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#06808B] hover:bg-[#046770] text-white font-extrabold text-[11px] py-2.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-all text-center shadow-sm cursor-pointer hover:scale-[1.03] active:scale-95"
                    >
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>گوگل مپ</span>
                    </a>
                    <a
                      href={neshanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/90 hover:bg-white text-[#06808B] border border-[#06808B]/20 font-extrabold text-[11px] py-2.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-all text-center cursor-pointer hover:scale-[1.03] active:scale-95 shadow-sm"
                    >
                      <Compass className="w-4 h-4 shrink-0 text-[#06808B]" />
                      <span>نشان</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Base Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 text-xs text-[#2C1E14]/70 gap-4 text-center font-bold">
          <div>
            تمامی حقوق این وبسایت محفوظ و متعلق به <strong className="text-[#06808B]">سالن زیبایی راز ملکه اصفهان</strong> می‌باشد. © ۲۰۲۶
          </div>
          <div className="flex items-center gap-3 font-extrabold text-[10px] text-[#2C1E14]/50">
            <span>طراحی شده با الهام از اصالت و شکوه ملکه ایرانی</span>
            <button
              onClick={onAdminClick}
              className="hover:text-[#06808B] text-[#2C1E14]/35 hover:scale-110 transition-all p-1 rounded-full cursor-pointer"
              title="دسترسی مدیریت"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
