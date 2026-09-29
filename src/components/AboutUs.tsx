import React from "react";
import { Sparkles, Heart, Award, Shield, Users } from "lucide-react";
import { SalonInfo } from "../types";
import aboutUsImg from "../assets/images/hero.jpg";

interface AboutUsProps {
  salonInfo: SalonInfo;
}

export default function AboutUs({ salonInfo }: AboutUsProps) {
  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic blurred decorative blobs */}
      <div className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full bg-[#06808B]/5 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-[#E6C59E]/20 blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="glass-card rounded-[2.5rem] p-8 sm:p-12 lg:p-16 border border-white/60 shadow-xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left side: Premium Text and Brand Story (RTL Right side) */}
            <div className="space-y-8 text-right order-2 lg:order-1">
              
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#06808B]/10 text-[#06808B] px-5 py-2 rounded-full text-xs font-bold border border-[#06808B]/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>مانیفست زیبایی راز ملکه</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2C1E14] leading-tight font-serif">
                  داستان پشت راز زیبایی ملکه
                </h2>
                <div className="w-24 h-1 bg-gradient-to-l from-[#06808B] to-transparent" />
              </div>

              <p className="text-[#2C1E14]/80 text-sm sm:text-base leading-relaxed font-semibold">
                در سالن راز ملکه، اعتقاد داریم هر زنی با یک ملکه باشکوه درون متولد شده است؛ ملکه‌ای قدرتمند، درخشان و صاحب اصالت. رسالت اصلی ما فراتر از یک تغییر ظاهری ساده است؛ ما فضایی ملوکانه برای آرامش روح و پیوند دوباره با زیبایی طبیعی وجودتان طراحی کرده‌ایم.
              </p>

              <blockquote className="border-r-4 border-[#06808B] pr-5 py-4 bg-white/40 rounded-2xl text-right border-y border-l border-white/50 shadow-sm">
                <p className="text-lg font-extrabold text-[#06808B] italic font-serif">
                  «{salonInfo.slogan}»
                </p>
                <cite className="text-xs text-gray-500 mt-1 block font-bold">— مدیریت تیم تخصصی راز ملکه</cite>
              </blockquote>

              {/* Value Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                
                <div className="flex gap-3 text-right bg-white/20 p-4 rounded-2xl border border-white/40 shadow-sm">
                  <div className="p-3 bg-[#06808B]/10 rounded-xl text-[#06808B] h-fit border border-white/50">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#2C1E14] mb-1">تخصص طراز اول</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                      پروسه گزینش آرتیست‌ها بسیار حساس بوده و همگی دارای مدارک آکادمیک بین‌المللی هستند.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 text-right bg-white/20 p-4 rounded-2xl border border-white/40 shadow-sm">
                  <div className="p-3 bg-[#06808B]/10 rounded-xl text-[#06808B] h-fit border border-white/50">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#2C1E14] mb-1">سلامت‌محوری کامل</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                      استفاده مستقیم از معتبرترین برندهای سلامت‌محور ارگانیک بدون گازهای مضر.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 text-right bg-white/20 p-4 rounded-2xl border border-white/40 shadow-sm">
                  <div className="p-3 bg-[#06808B]/10 rounded-xl text-[#06808B] h-fit border border-white/50">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#2C1E14] mb-1">مشاوره اختصاصی</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                      قبل از شروع کار، فرم چهره‌شناسی و سلامت مو به صورت کاملا رایگان بررسی می‌شود.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 text-right bg-white/20 p-4 rounded-2xl border border-white/40 shadow-sm">
                  <div className="p-3 bg-[#06808B]/10 rounded-xl text-[#06808B] h-fit border border-white/50">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#2C1E14] mb-1">میزبانی ملوکانه</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                      پذیرایی اختصاصی، نوشیدنی‌های ارگانیک فصل و ایجاد حس آرامش واقعی در حین نوبت.
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Right side: Elegant graphic / image wrapper (RTL Left side) */}
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative w-full max-w-sm sm:max-w-md aspect-square rounded-[2.5rem] overflow-hidden border border-white/60 p-4 bg-gradient-to-tr from-[#06808B]/20 to-transparent shadow-lg">
                <img
                  src={aboutUsImg}
                  alt="مراقبت لوکس راز ملکه"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-[2rem] shadow-md hover:scale-105 transition-transform duration-700"
                />
                
                {/* Floating graphic overlay */}
                <div className="absolute -bottom-4 -left-4 bg-[#06808B] text-white p-6 rounded-[2rem] shadow-xl border border-white/20 hidden sm:block max-w-[210px] text-right">
                  <div className="text-2xl font-black font-mono mb-1">۱۰+ سال</div>
                  <div className="text-[10px] text-white/85 leading-relaxed font-bold">
                    پیشگام در ارائه خدمات لوکس و سلامت مو در اصفهان
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
