import React, { useState } from "react";
import { Sparkles, Phone, Lock, Menu, X, Instagram } from "lucide-react";
import { SalonInfo } from "../types";
import Logo from "./Logo";
import { resolveImageUrl } from "../utils/imagePath";

interface NavbarProps {
  salonInfo: SalonInfo;
  onAdminClick: () => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
  logoUrl?: string;
}

export default function Navbar({
  salonInfo,
  onAdminClick,
  isAdminLoggedIn,
  onLogout,
  logoUrl
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-4 z-50 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
      <div className="glass-panel rounded-3xl px-6 py-2 shadow-[0_12px_40px_rgba(44,30,20,0.06)] border border-white/50">
        <div className="flex justify-between h-20 items-center">
          
          {/* Right Side: Logo and Brand Name */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-3 group">
              <img
                src={resolveImageUrl(logoUrl || salonInfo.logoUrl || "./assets/branding/logo.jpg")}
                alt={salonInfo.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl border border-[#06808B]/10 object-contain shadow-md group-hover:scale-105 transition-transform duration-500 bg-white p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = resolveImageUrl("./assets/branding/logo.jpg");
                }}
              />
              <div className="flex flex-col text-right">
                <span className="font-extrabold text-2xl text-[#2C1E14] tracking-tight group-hover:text-[#06808B] transition-colors font-serif">
                  {salonInfo.name}
                </span>
                <span className="text-[9px] text-[#06808B] tracking-[0.15em] font-black">
                  RAAZE MALAKE • LUXURY COSMETIC
                </span>
              </div>
            </a>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8 font-bold">
            <a href="#services" className="text-[#2C1E14]/80 hover:text-[#06808B] transition-colors py-2 text-sm lg:text-base relative group">
              خدمات سالن
              <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#06808B] transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#gallery" className="text-[#2C1E14]/80 hover:text-[#06808B] transition-colors py-2 text-sm lg:text-base relative group">
              گالری تصاویر
              <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#06808B] transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#contact" className="text-[#2C1E14]/80 hover:text-[#06808B] transition-colors py-2 text-sm lg:text-base relative group">
              موقعیت و آدرس
              <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#06808B] transition-all duration-300 group-hover:w-full" />
            </a>
          </div>

          {/* Left Side: Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={`tel:${salonInfo.phone1}`}
              className="glass-btn-primary font-bold px-6 py-2.5 rounded-full shadow-sm flex items-center gap-2 transform hover:scale-[1.02] cursor-pointer"
            >
              <Phone className="w-4 h-4 animate-bounce" />
              <span>رزرو آنلاین نوبت</span>
            </a>

            {/* Admin Controls (Only shown when admin is logged in) */}
            {isAdminLoggedIn && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onAdminClick}
                  className="bg-[#06808B] hover:bg-[#056972] text-white px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>داشبورد مدیریت</span>
                </button>
                <button
                  onClick={onLogout}
                  className="border border-red-500/40 hover:bg-red-500/10 text-red-600 px-3 py-2 rounded-full text-xs font-bold transition-all cursor-pointer"
                  title="خروج از حساب مدیریت"
                >
                  خروج
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Quick booking link directly on Mobile */}
            <a
              href={`tel:${salonInfo.phone1}`}
              className="bg-[#06808B] text-white p-2.5 rounded-full shadow-md cursor-pointer animate-pulse-slow"
              title="تماس جهت رزرو"
            >
              <Phone className="w-4 h-4" />
            </a>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#2C1E14] p-2 hover:bg-white/40 rounded-full transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden glass-panel rounded-3xl mt-2 p-6 space-y-4 shadow-xl text-right border border-white/50 z-50 relative animate-fade-in-up">
          <div className="flex flex-col gap-3 font-bold">
            <a
              href="#services"
              onClick={() => setIsOpen(false)}
              className="text-[#2C1E14] hover:text-[#06808B] transition-colors py-2 border-b border-white/20"
            >
              خدمات سالن
            </a>
            <a
              href="#gallery"
              onClick={() => setIsOpen(false)}
              className="text-[#2C1E14] hover:text-[#06808B] transition-colors py-2 border-b border-white/20"
            >
              گالری تصاویر
            </a>
            <a
              href="#contact"
              onClick={() => setIsOpen(false)}
              className="text-[#2C1E14] hover:text-[#06808B] transition-colors py-2 border-b border-white/20"
            >
              موقعیت و آدرس
            </a>
          </div>

          <div className="pt-3 flex flex-col gap-2.5">
            <a
              href={`tel:${salonInfo.phone1}`}
              className="glass-btn-primary text-center font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all shadow"
            >
              <Phone className="w-4 h-4 animate-pulse-slow" />
              <span>رزرو آنلاین نوبت: {salonInfo.phone1}</span>
            </a>

            {isAdminLoggedIn && (
              <div className="flex justify-between items-center pt-4 border-t border-white/20">
                <button
                  onClick={() => {
                    onAdminClick();
                    setIsOpen(false);
                  }}
                  className="text-[#06808B] font-extrabold text-xs flex items-center gap-1"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>داشبورد مدیریت سالن</span>
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="text-red-600 font-extrabold text-xs"
                >
                  خروج
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
