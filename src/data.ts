import { Service, GalleryItem, GalleryTopic, AdminCredentials, SalonInfo } from "./types";

export const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  username: "admin",
  password: "Queen@2026",
  lastUpdated: new Date().toISOString()
};

export const INITIAL_SERVICES: Service[] = [
  {
    id: "1",
    title: "رنگ و لایت",
    category: "رنگ و مو",
    description: "انواع تکنیک‌های آمبره، سامبره، بالیاژ، لایت‌های خطی و دکلره‌های بدون آسیب با مرغوب‌ترین متریال جهانی.",
    image: "./assets/services/color.jpg",
    price: ""
  },
  {
    id: "2",
    title: "کوتاهی",
    category: "کوتاهی و استایل",
    description: "کوپ‌های مدرن، کلاسیک و ژورنالی مطابق با ژورنال‌های روز دنیا همراه با براشینگ و سشوار تخصصی.",
    image: "./assets/services/haircut.jpg",
    price: ""
  },
  {
    id: "3",
    title: "اصلاح و ابرو",
    category: "ابرو و صورت",
    description: "قرینه‌سازی و طراحی ابرو متناسب با جام چهره، بند، شمع گیاهی و اصلاح تخصصی صورت.",
    image: "./assets/services/eyebrow.jpg",
    price: ""
  },
  {
    id: "4",
    title: "احیا و کراتین",
    category: "احیا و کراتین",
    description: "صافی صد در صد و احیای عمیق موهای آسیب‌دیده، بوتاکس‌تراپی، پروتئین‌تراپی و کراتینه تضمینی مو.",
    image: "./assets/services/keratin.jpg",
    price: ""
  },
  {
    id: "5",
    title: "خدمات ناخن",
    category: "ناخن و پدیکور",
    description: "کاشت پودر، ژل، لمینت، کاور ملوکانه، ژلیش دست و پا به همراه طراحی‌های ظریف هنری روز دنیا.",
    image: "./assets/services/nails.jpg",
    price: ""
  },
  {
    id: "6",
    title: "فشیال پوست",
    category: "پوست و فشیال",
    description: "پاکسازی عمیق پوست، هیدرودرمی، لایه‌برداری تخصصی، جوانسازی و رفع خستگی صورت با مواد اورجینال.",
    image: "./assets/services/skin.jpg",
    price: ""
  },
  {
    id: "7",
    title: "میکاپ و شینیون",
    category: "عروس و میکاپ",
    description: "آرایش‌های ملایم، اروپایی و شیک متناسب با سلیقه شما به همراه شینیون‌های مدرن، خطی و مواج.",
    image: "./assets/services/makeup.jpg",
    price: ""
  },
  {
    id: "8",
    title: "میکاپ شینیون تخصصی عروس",
    category: "عروس و میکاپ",
    description: "پکیج مجلل و VIP عروس با گریم کانتورینگ حرفه‌ای صورت، مژه‌گذاری دانه‌ای و پایداری تضمینی ۲۴ ساعته.",
    image: "./assets/services/bridal.jpg",
    price: ""
  },
  {
    id: "9",
    title: "مژه و ابرو",
    category: "مژه و ابرو",
    description: "کاشت مژه موقت، اکستنشن تار به تار اسپایکی، والیوم و مگاوالیوم و لیفت و لمینت تخصصی با برترین متریال.",
    image: "./assets/services/lashes.jpg",
    price: ""
  },
  {
    id: "10",
    title: "پدیکور و کفسابی",
    category: "ناخن و پدیکور",
    description: "کفسابی فوق حرفه‌ای جهت رفع کامل خشکی و ترک پا، کوکتل‌تراپی، اسکراب و ماساژ ریلکسی پا.",
    image: "./assets/services/pedicure.jpg",
    price: ""
  },
  {
    id: "11",
    title: "بافت مو",
    category: "بافت و استایل",
    description: "انواع بافت‌های فانتزی شامل هلندی، آفریقایی، مکزیکی، کوئین و بافت با موهای رنگی اضافه.",
    image: "./assets/services/braids.jpg",
    price: ""
  }
];

export const INITIAL_GALLERY_TOPICS: GalleryTopic[] = [
  {
    id: "topic-bridal",
    title: "عروس و میکاپ VIP",
    category: "عروس و میکاپ",
    coverImage: "./assets/bridal/thumbnail.jpg",
    description: "پکیج‌های مجلل میکاپ، گریم کانتورینگ سینمایی، شینیون ژورنالی و آرایش VIP ویژه نو عروسان و مهمانی‌های خاص.",
    badgeText: "VIP عروس"
  },
  {
    id: "topic-haircolor",
    title: "رنگ، لایت و بالیاژ",
    category: "رنگ و مو",
    coverImage: "./assets/haircolor/thumbnail.jpg",
    description: "تکنیک‌های بالیاژ روسی، آمبره برزیلی، لایت‌های بلوند شنی و کره‌ای با اولاپلکس و بدون کوچک‌ترین آسیب به تارهای مو.",
    badgeText: "تکنیک‌های روسی"
  },
  {
    id: "topic-keratin",
    title: "احیا، کراتین و بوتاکس مو",
    category: "احیا و کراتین",
    coverImage: "./assets/keratin/thumbnail.jpg",
    description: "صافی شیشه‌ای ۱۰۰٪ و احیای عمیق ساقه موهای سوخته و دکلره شده با بهترین برندهای ارگانیک برزیلی و نانوپلاستی.",
    badgeText: "تضمین ماندگاری"
  },
  {
    id: "topic-nails",
    title: "خدمات تخصصی ناخن و پدیکور",
    category: "ناخن و پدیکور",
    coverImage: "./assets/nails/thumbnail.jpg",
    description: "کاشت ژل، لمینت استحکام‌بخش، دیزاین‌های سه‌بعدی و کروم، مانیکور روسی و اسپا پدیکور با کفسابی VIP.",
    badgeText: "دیزاین‌های ژورنالی"
  },
  {
    id: "topic-lashes",
    title: "اکستنشن مژه و لیفت ابرو",
    category: "مژه و ابرو",
    coverImage: "./assets/lashes/thumbnail.jpg",
    description: "اکستنشن تار به تار اسپایکی، والیوم و مگاوالیوم ابریشمی به همراه لیفت مژه و لمینت ابرو با متریال ارگانیک.",
    badgeText: "طبیعی و سبک"
  },
  {
    id: "topic-skin",
    title: "پاکسازی و فشیال پوست",
    category: "پوست و فشیال",
    coverImage: "./assets/skin/thumbnail.jpg",
    description: "هیدرودرمی، تخلیه جوش‌های سرسیاه، لایه‌برداری اسیدی، ماسک طلا و اکسیژن‌تراپی برای درخشندگی ابدی پوست چهره.",
    badgeText: "پوست شیشه‌ای"
  },
  {
    id: "topic-braids",
    title: "بافت و استایل مو",
    category: "بافت و استایل",
    coverImage: "./assets/braids/thumbnail.jpg",
    description: "بافت‌های خاص هلندی، مکزیکی، کوئین و بافت با موهای اضافه فانتزی مناسب تولد، سفر و مراسم‌های مدرن.",
    badgeText: "مدرن و فانتزی"
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  // عروس و میکاپ VIP
  {
    id: "item-bridal-1",
    title: "میکاپ و شینیون عروس VIP",
    category: "عروس و میکاپ",
    image: "./assets/bridal/1.jpg",
    description: "نمونه‌کار تخصصی میکاپ و شینیون عروس VIP با بهترین متریال در سالن راز ملکه"
  },
  {
    id: "item-bridal-2",
    title: "کانتورینگ و گریم عروس",
    category: "عروس و میکاپ",
    image: "./assets/bridal/2.jpg",
    description: "نمونه‌کار تخصصی کانتورینگ و گریم عروس با ماندگاری ۲۴ ساعته"
  },
  {
    id: "item-bridal-3",
    title: "استایل و رژ ژورنالی عروس",
    category: "عروس و میکاپ",
    image: "./assets/bridal/3.jpg",
    description: "استایل شیک و میکاپ اروپایی نو عروسان"
  },
  // رنگ و مو
  {
    id: "item-haircolor-1",
    title: "بالیاژ شنی و بلوند کاراملی",
    category: "رنگ و مو",
    image: "./assets/haircolor/1.jpg",
    description: "بالیاژ روسی و لایت‌های کره‌ای با اولاپلکس بدون آسیب"
  },
  {
    id: "item-haircolor-2",
    title: "سامبره دودی نسکافه‌ای",
    category: "رنگ و مو",
    image: "./assets/haircolor/2.jpg",
    description: "سامبره ژورنالی با پایه‌های تمیز و براق"
  },
  {
    id: "item-haircolor-3",
    title: "فیس‌فریم و آمبره روسی",
    category: "رنگ و مو",
    image: "./assets/haircolor/3.jpg",
    description: "لایت‌های خطی و کانتورینگ چهره با تکنیک فیس‌فریم"
  },
  // احیا و کراتین
  {
    id: "item-keratin-1",
    title: "صافی شیشه‌ای ۱۰۰٪ و نانوپلاستی",
    category: "احیا و کراتین",
    image: "./assets/keratin/1.jpg",
    description: "صافی شلاقی و احیای ابریشمی مو با برندهای ارگانیک"
  },
  {
    id: "item-keratin-2",
    title: "بوتاکس‌تراپی و احیای موهای سوخته",
    category: "احیا و کراتین",
    image: "./assets/keratin/2.jpg",
    description: "ترمیم موهای دکلره شده و ساقه آسیب‌دیده با بوتاکس سرد و گرم"
  },
  {
    id: "item-keratin-3",
    title: "پروتئین‌تراپی و آبرسانی عمیق ساقه",
    category: "احیا و کراتین",
    image: "./assets/keratin/3.jpg",
    description: "رفع وزی و موخوره و بازگشت ضخامت و نرمی موها"
  },
  // ناخن و پدیکور
  {
    id: "item-nails-1",
    title: "کاشت ژل ژورنالی و بیبی‌بومر",
    category: "ناخن و پدیکور",
    image: "./assets/nails/1.jpg",
    description: "کاشت پودر و ژل با خطوط ظریف و استحکام بالا"
  },
  {
    id: "item-nails-2",
    title: "طراحی مینیمال و فرنچ لوکس",
    category: "ناخن و پدیکور",
    image: "./assets/nails/2.jpg",
    description: "طراحی‌های هنری و دیزاین کروم و ورق طلا"
  },
  {
    id: "item-nails-3",
    title: "لمینت استحکام‌بخش و اسپا پدیکور",
    category: "ناخن و پدیکور",
    image: "./assets/nails/3.jpg",
    description: "کفسابی VIP پا، کوکتل‌تراپی و استحکام‌بخشی ناخن طبیعی"
  },
  // مژه و ابرو
  {
    id: "item-lashes-1",
    title: "مژه مگاوالیوم و اسپایکی ابریشمی",
    category: "مژه و ابرو",
    image: "./assets/lashes/1.jpg",
    description: "اکستنشن تار به تار بسیار سبک و مشکی مخملی"
  },
  {
    id: "item-lashes-2",
    title: "لیفت و لمینت تخصصی ابرو",
    category: "مژه و ابرو",
    image: "./assets/lashes/2.jpg",
    description: "فرم‌دهی و لیفت تار به تار ابرو منطبق بر خواب ابرو با مواد ارگانیک"
  },
  {
    id: "item-lashes-3",
    title: "لیفت و لمینت روسی مژه",
    category: "مژه و ابرو",
    image: "./assets/lashes/3.jpg",
    description: "فر طبیعی و تقویت مژه با بوتاکس مژه و مواد ارگانیک"
  },
  // پوست و فشیال
  {
    id: "item-skin-1",
    title: "هیدرودرمی و پاکسازی منافذ عمیق",
    category: "پوست و فشیال",
    image: "./assets/skin/1.jpg",
    description: "تخلیه کومدون، لایه‌برداری و درخشندگی فوری پوست"
  },
  {
    id: "item-skin-2",
    title: "ماسک طلا و پیلینگ آنزیمی جوان‌ساز",
    category: "پوست و فشیال",
    image: "./assets/skin/2.jpg",
    description: "جوانسازی، لیفتینگ و رفع لک‌های سطحی پوست"
  },
  {
    id: "item-skin-3",
    title: "اکسیژن‌تراپی و درخشش پوست شیشه‌ای",
    category: "پوست و فشیال",
    image: "./assets/skin/3.jpg",
    description: "اکسیژن‌رسانی و آبرسانی عمیق برای شفافیت آینه‌ای چهره"
  },
  // بافت و استایل
  {
    id: "item-braids-1",
    title: "بافت کوئین هلندی با موی فانتزی",
    category: "بافت و استایل",
    image: "./assets/braids/1.jpg",
    description: "بافت هلندی و فرانسوی تمیز و محکم مناسب جشن‌ها"
  },
  {
    id: "item-braids-2",
    title: "بافت مکزیکی و کف‌سری مجلسی",
    category: "بافت و استایل",
    image: "./assets/braids/2.jpg",
    description: "بافت‌های خاص ژورنالی با تنوع رنگ و مدل"
  },
  {
    id: "item-braids-3",
    title: "بافت تیغ‌ماهی و ریسه‌ای مدرن",
    category: "بافت و استایل",
    image: "./assets/braids/3.jpg",
    description: "دیزاین بافت با مروارید و نخ‌های لمه درخشان"
  }
];

export const SALON_INFO: SalonInfo = {
  name: "راز ملکه",
  slogan: "اینجا ملکه ی درونت رو پیدا کن💙",
  instagram: "raazemalake",
  phone1: "09397365273",
  phone2: "09046847384",
  address: "اصفهان، خیابان میرزاطاهر شرقی، نبش کوچه ۲۸",
  mapLink: "https://www.google.com/maps/search/?api=1&query=اصفهان+خیابان+میرزاطاهر+شرقی+نبش+کوچه+۲۸",
  logoUrl: "./assets/branding/logo.jpg",
  backgroundBannerUrl: "./assets/branding/top_banner.jpg",
  topSmallBannerUrl: "./assets/branding/logo.jpg",
  heroBannerUrl: "./assets/branding/hero.jpg"
};
