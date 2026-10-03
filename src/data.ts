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
    coverImage: "./uploads/topic-cover-topic-bridal.jpg",
    description: "پکیج‌های مجلل میکاپ، گریم کانتورینگ سینمایی، شینیون ژورنالی و آرایش VIP ویژه نو عروسان و مهمانی‌های خاص.",
    badgeText: "VIP عروس"
  },
  {
    id: "topic-haircolor",
    title: "رنگ، لایت و بالیاژ",
    category: "رنگ و مو",
    coverImage: "./uploads/topic--1791057684046.jpg",
    description: "تکنیک‌های بالیاژ روسی، آمبره برزیلی، لایت‌های بلوند شنی و کره‌ای با اولاپلکس و بدون کوچک‌ترین آسیب به تارهای مو.",
    badgeText: "تکنیک‌های روسی"
  },
  {
    id: "topic-keratin",
    title: "احیا، کراتین و بوتاکس مو",
    category: "احیا و کراتین",
    coverImage: "./uploads/topic--1791058781372.jpg",
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
    title: "پاکسازی و فیشال پوست",
    category: "پوست و فشیال",
    coverImage: "./uploads/topic--1791059334711.jpg",
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
  },
  {
    id: "topic-1791058801128",
    title: "شینیون و میکاپ",
    category: "گالری تصاویر",
    coverImage: "./uploads/topic-shinion-topic--1791060174484-jsg9n.jpg",
    description: "معرفی خدمات و نمونه‌کارهای لاین تخصصی شینیون و میکاپ",
    badgeText: "لاین جدید"
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: "g-1791059958669",
    title: "نمونه کار خدمات تخصصی ناخن و پدیکور",
    category: "ناخن و پدیکور",
    image: "./uploads/sample-1791059955204-0-1791060067509.jpg",
    description: "",
    createdAt: "2026-10-03T20:39:18.669Z"
  },
  {
    id: "g-1791059963261",
    title: "نمونه کار خدمات تخصصی ناخن و پدیکور",
    category: "ناخن و پدیکور",
    image: "./uploads/sample-1791059958670-1-1791060072099.jpg",
    description: "",
    createdAt: "2026-10-03T20:39:23.260Z"
  },
  {
    id: "g-1791059965784",
    title: "نمونه کار خدمات تخصصی ناخن و پدیکور",
    category: "ناخن و پدیکور",
    image: "./uploads/sample-1791059963260-2-1791060074622.jpg",
    description: "",
    createdAt: "2026-10-03T20:39:25.782Z"
  },
  {
    id: "g-1791059968077",
    title: "نمونه کار خدمات تخصصی ناخن و پدیکور",
    category: "ناخن و پدیکور",
    image: "./uploads/sample-1791059965782-3-1791060076878.jpg",
    description: "",
    createdAt: "2026-10-03T20:39:28.074Z"
  },
  {
    id: "g-1791059974027",
    title: "نمونه کار خدمات تخصصی ناخن و پدیکور",
    category: "ناخن و پدیکور",
    image: "./uploads/sample-1791059968074-4-1791060082865.jpg",
    description: "",
    createdAt: "2026-10-03T20:39:34.023Z"
  },
  {
    id: "g-1791059978806",
    title: "نمونه کار خدمات تخصصی ناخن و پدیکور",
    category: "ناخن و پدیکور",
    image: "./uploads/sample-1791059974023-5-1791060087641.jpg",
    description: "",
    createdAt: "2026-10-03T20:39:38.801Z"
  },
  {
    id: "g-1791059981878",
    title: "نمونه کار خدمات تخصصی ناخن و پدیکور",
    category: "ناخن و پدیکور",
    image: "./uploads/sample-1791059978801-6-1791060090712.jpg",
    description: "",
    createdAt: "2026-10-03T20:39:41.872Z"
  },
  {
    id: "g-1791059983768",
    title: "نمونه کار خدمات تخصصی ناخن و پدیکور",
    category: "ناخن و پدیکور",
    image: "./uploads/sample-1791059981872-7-1791060092603.jpg",
    description: "",
    createdAt: "2026-10-03T20:39:43.761Z"
  },
  {
    id: "g-1791059838973",
    title: "نمونه کار احیا، کراتین و بوتاکس مو",
    category: "احیا و کراتین",
    image: "./uploads/sample-1791059829763-0-1791059947809.jpg",
    description: "",
    createdAt: "2026-10-03T20:37:18.973Z"
  },
  {
    id: "g-1791059845036",
    title: "نمونه کار احیا، کراتین و بوتاکس مو",
    category: "احیا و کراتین",
    image: "./uploads/sample-1791059838974-1-1791059953855.jpg",
    description: "",
    createdAt: "2026-10-03T20:37:25.035Z"
  },
  {
    id: "g-1791059851259",
    title: "نمونه کار احیا، کراتین و بوتاکس مو",
    category: "احیا و کراتین",
    image: "./uploads/sample-1791059845036-2-1791059960089.jpg",
    description: "",
    createdAt: "2026-10-03T20:37:31.257Z"
  },
  {
    id: "g-1791059569547",
    title: "نمونه کار اکستنشن مژه و لیفت ابرو",
    category: "مژه و ابرو",
    image: "./uploads/sample-1791059563484-0-1791059678385.jpg",
    description: "",
    createdAt: "2026-10-03T20:32:49.547Z"
  },
  {
    id: "g-1791059580726",
    title: "نمونه کار اکستنشن مژه و لیفت ابرو",
    category: "مژه و ابرو",
    image: "./uploads/sample-1791059569547-1-1791059689564.webp",
    description: "",
    createdAt: "2026-10-03T20:33:00.725Z"
  },
  {
    id: "g-1791059591745",
    title: "نمونه کار اکستنشن مژه و لیفت ابرو",
    category: "مژه و ابرو",
    image: "./uploads/sample-1791059580725-2-1791059700569.webp",
    description: "",
    createdAt: "2026-10-03T20:33:11.743Z"
  },
  {
    id: "g-1791059600341",
    title: "نمونه کار اکستنشن مژه و لیفت ابرو",
    category: "مژه و ابرو",
    image: "./uploads/sample-1791059591743-3-1791059709174.webp",
    description: "",
    createdAt: "2026-10-03T20:33:20.339Z"
  },
  {
    id: "g-1791059605673",
    title: "نمونه کار اکستنشن مژه و لیفت ابرو",
    category: "مژه و ابرو",
    image: "./uploads/sample-1791059600339-4-1791059714467.webp",
    description: "",
    createdAt: "2026-10-03T20:33:25.669Z"
  },
  {
    id: "g-1791059613631",
    title: "نمونه کار اکستنشن مژه و لیفت ابرو",
    category: "مژه و ابرو",
    image: "./uploads/sample-1791059605669-5-1791059722460.jpg",
    description: "",
    createdAt: "2026-10-03T20:33:33.626Z"
  },
  {
    id: "g-1791059643026",
    title: "نمونه کار اکستنشن مژه و لیفت ابرو",
    category: "مژه و ابرو",
    image: "./uploads/sample-1791059613626-6-1791059750565.jpg",
    description: "",
    createdAt: "2026-10-03T20:34:03.020Z"
  },
  {
    id: "g-1791059654316",
    title: "نمونه کار اکستنشن مژه و لیفت ابرو",
    category: "مژه و ابرو",
    image: "./uploads/sample-1791059643020-7-1791059763099.jpg",
    description: "",
    createdAt: "2026-10-03T20:34:14.309Z"
  },
  {
    id: "g-1791059668195",
    title: "نمونه کار اکستنشن مژه و لیفت ابرو",
    category: "مژه و ابرو",
    image: "./uploads/sample-1791059654310-8-1791059777023.jpg",
    description: "",
    createdAt: "2026-10-03T20:34:28.187Z"
  },
  {
    id: "g-1791059680972",
    title: "نمونه کار اکستنشن مژه و لیفت ابرو",
    category: "مژه و ابرو",
    image: "./uploads/sample-1791059668187-9-1791059789757.jpg",
    description: "",
    createdAt: "2026-10-03T20:34:40.963Z"
  },
  {
    id: "g-1791059703784",
    title: "نمونه کار اکستنشن مژه و لیفت ابرو",
    category: "مژه و ابرو",
    image: "./uploads/sample-1791059680963-10-1791059812578.jpg",
    description: "",
    createdAt: "2026-10-03T20:35:03.774Z"
  },
  {
    id: "g-1791059290664",
    title: "نمونه کار پاکسازی و فیشال پوست",
    category: "پوست و فشیال",
    image: "./uploads/sample-1791059237236-0-1791059399498.jpg",
    description: "",
    createdAt: "2026-10-03T20:28:10.664Z"
  },
  {
    id: "g-1791059296714",
    title: "نمونه کار پاکسازی و فیشال پوست",
    category: "پوست و فشیال",
    image: "./uploads/sample-1791059290664-1-1791059405554.webp",
    description: "",
    createdAt: "2026-10-03T20:28:16.713Z"
  },
  {
    id: "g-1791059302818",
    title: "نمونه کار پاکسازی و فیشال پوست",
    category: "پوست و فشیال",
    image: "./uploads/sample-1791059296713-2-1791059411656.jpg",
    description: "",
    createdAt: "2026-10-03T20:28:22.816Z"
  },
  {
    id: "g-1791059318385",
    title: "نمونه کار پاکسازی و فیشال پوست",
    category: "پوست و فشیال",
    image: "./uploads/sample-1791059302816-3-1791059427218.jpg",
    description: "",
    createdAt: "2026-10-03T20:28:38.382Z"
  },
  {
    id: "g-1791059340523",
    title: "نمونه کار پاکسازی و فیشال پوست",
    category: "پوست و فشیال",
    image: "./uploads/sample-1791059318382-4-1791059449355.jpg",
    description: "",
    createdAt: "2026-10-03T20:29:00.519Z"
  },
  {
    id: "g-1791059358380",
    title: "نمونه کار پاکسازی و فیشال پوست",
    category: "پوست و فشیال",
    image: "./uploads/sample-1791059340519-5-1791059467203.jpg",
    description: "",
    createdAt: "2026-10-03T20:29:18.375Z"
  },
  {
    id: "g-1791059368890",
    title: "نمونه کار پاکسازی و فیشال پوست",
    category: "پوست و فشیال",
    image: "./uploads/sample-1791059358375-6-1791059477716.jpg",
    description: "",
    createdAt: "2026-10-03T20:29:28.884Z"
  },
  {
    id: "g-1791059384225",
    title: "نمونه کار پاکسازی و فیشال پوست",
    category: "پوست و فشیال",
    image: "./uploads/sample-1791059368884-7-1791059493009.jpg",
    description: "",
    createdAt: "2026-10-03T20:29:44.218Z"
  },
  {
    id: "g-1791058839756",
    title: "نمونه کار شینیون و میکاپ",
    category: "گالری تصاویر",
    image: "./uploads/sample-1791058833683-0-1791058948598.jpg",
    description: "",
    createdAt: "2026-10-03T20:20:39.756Z"
  },
  {
    id: "g-1791058851747",
    title: "نمونه کار شینیون و میکاپ",
    category: "گالری تصاویر",
    image: "./uploads/sample-1791058839756-1-1791058960305.jpg",
    description: "",
    createdAt: "2026-10-03T20:20:51.746Z"
  },
  {
    id: "g-1791058874267",
    title: "نمونه کار شینیون و میکاپ",
    category: "گالری تصاویر",
    image: "./uploads/sample-1791058851746-2-1791058983104.jpg",
    description: "",
    createdAt: "2026-10-03T20:21:14.265Z"
  },
  {
    id: "g-1791058886722",
    title: "نمونه کار شینیون و میکاپ",
    category: "گالری تصاویر",
    image: "./uploads/sample-1791058874265-3-1791058995559.jpg",
    description: "",
    createdAt: "2026-10-03T20:21:26.719Z"
  },
  {
    id: "g-1791058895883",
    title: "نمونه کار شینیون و میکاپ",
    category: "گالری تصاویر",
    image: "./uploads/sample-1791058886719-4-1791059004715.jpg",
    description: "",
    createdAt: "2026-10-03T20:21:35.879Z"
  },
  {
    id: "g-1791058909685",
    title: "نمونه کار شینیون و میکاپ",
    category: "گالری تصاویر",
    image: "./uploads/sample-1791058895879-5-1791059018515.jpg",
    description: "",
    createdAt: "2026-10-03T20:21:49.680Z"
  },
  {
    id: "g-1791058916836",
    title: "نمونه کار شینیون و میکاپ",
    category: "گالری تصاویر",
    image: "./uploads/sample-1791058909680-6-1791059025667.jpg",
    description: "",
    createdAt: "2026-10-03T20:21:56.830Z"
  },
  {
    id: "g-1791058926591",
    title: "نمونه کار شینیون و میکاپ",
    category: "گالری تصاویر",
    image: "./uploads/sample-1791058916831-7-1791059035405.jpg",
    description: "",
    createdAt: "2026-10-03T20:22:06.584Z"
  },
  {
    id: "g-1791058934714",
    title: "نمونه کار شینیون و میکاپ",
    category: "گالری تصاویر",
    image: "./uploads/sample-1791058926584-8-1791059043482.jpg",
    description: "",
    createdAt: "2026-10-03T20:22:14.706Z"
  },
  {
    id: "g-1791058971570",
    title: "نمونه کار شینیون و میکاپ",
    category: "گالری تصاویر",
    image: "./uploads/sample-1791058934706-9-1791059080396.jpg",
    description: "",
    createdAt: "2026-10-03T20:22:51.561Z"
  },
  {
    id: "g-1791058980220",
    title: "نمونه کار شینیون و میکاپ",
    category: "گالری تصاویر",
    image: "./uploads/sample-1791058971561-10-1791059089049.jpg",
    description: "",
    createdAt: "2026-10-03T20:23:00.210Z"
  },
  {
    id: "g-1791058991015",
    title: "نمونه کار شینیون و میکاپ",
    category: "گالری تصاویر",
    image: "./uploads/sample-1791058980210-11-1791059099845.jpg",
    description: "",
    createdAt: "2026-10-03T20:23:11.004Z"
  },
  {
    id: "g-1791058207924",
    title: "نمونه کار خدمات تخصصی ناخن و پدیکور",
    category: "ناخن و پدیکور",
    image: "./uploads/sample-1791058205952-0-1791058316759.webp",
    description: "",
    createdAt: "2026-10-03T20:10:07.924Z"
  },
  {
    id: "g-1791058209537",
    title: "نمونه کار خدمات تخصصی ناخن و پدیکور",
    category: "ناخن و پدیکور",
    image: "./uploads/sample-1791058207924-1-1791058318368.webp",
    description: "",
    createdAt: "2026-10-03T20:10:09.536Z"
  },
  {
    id: "g-1791058017836",
    title: "نمونه کار بافت و استایل مو",
    category: "بافت و استایل",
    image: "./uploads/sample-1791058015457-0-1791058126667.jpg",
    description: "",
    createdAt: "2026-10-03T20:06:57.836Z"
  },
  {
    id: "g-1791058022900",
    title: "نمونه کار بافت و استایل مو",
    category: "بافت و استایل",
    image: "./uploads/sample-1791058017836-1-1791058131726.jpg",
    description: "",
    createdAt: "2026-10-03T20:07:02.899Z"
  },
  {
    id: "g-1791058026997",
    title: "نمونه کار بافت و استایل مو",
    category: "بافت و استایل",
    image: "./uploads/sample-1791058022899-2-1791058135826.jpg",
    description: "",
    createdAt: "2026-10-03T20:07:06.995Z"
  },
  {
    id: "g-1791058035113",
    title: "نمونه کار بافت و استایل مو",
    category: "بافت و استایل",
    image: "./uploads/sample-1791058026995-3-1791058143855.jpg",
    description: "",
    createdAt: "2026-10-03T20:07:15.110Z"
  },
  {
    id: "g-1791058040880",
    title: "نمونه کار بافت و استایل مو",
    category: "بافت و استایل",
    image: "./uploads/sample-1791058035111-4-1791058149712.jpg",
    description: "",
    createdAt: "2026-10-03T20:07:20.876Z"
  },
  {
    id: "g-1791058044223",
    title: "نمونه کار بافت و استایل مو",
    category: "بافت و استایل",
    image: "./uploads/sample-1791058040877-5-1791058153053.jpg",
    description: "",
    createdAt: "2026-10-03T20:07:24.218Z"
  },
  {
    id: "g-1791058048362",
    title: "نمونه کار بافت و استایل مو",
    category: "بافت و استایل",
    image: "./uploads/sample-1791058044218-6-1791058157191.jpg",
    description: "",
    createdAt: "2026-10-03T20:07:28.356Z"
  },
  {
    id: "g-1791058051270",
    title: "نمونه کار بافت و استایل مو",
    category: "بافت و استایل",
    image: "./uploads/sample-1791058048356-7-1791058160095.jpg",
    description: "",
    createdAt: "2026-10-03T20:07:31.263Z"
  },
  {
    id: "g-1791058054559",
    title: "نمونه کار بافت و استایل مو",
    category: "بافت و استایل",
    image: "./uploads/sample-1791058051263-8-1791058163380.jpg",
    description: "",
    createdAt: "2026-10-03T20:07:34.551Z"
  },
  {
    id: "g-1791058056965",
    title: "نمونه کار بافت و استایل مو",
    category: "بافت و استایل",
    image: "./uploads/sample-1791058054551-9-1791058165789.jpg",
    description: "",
    createdAt: "2026-10-03T20:07:36.956Z"
  },
  {
    id: "g-1791057379283",
    title: "نمونه کار عروس و میکاپ VIP",
    category: "عروس و میکاپ",
    image: "./uploads/sample-1791057334412-0-1791057488118.webp",
    description: "",
    createdAt: "2026-10-03T19:56:19.283Z"
  },
  {
    id: "g-1791057397017",
    title: "نمونه کار عروس و میکاپ VIP",
    category: "عروس و میکاپ",
    image: "./uploads/sample-1791057379283-1-1791057504860.webp",
    description: "",
    createdAt: "2026-10-03T19:56:37.016Z"
  },
  {
    id: "g-1791057414921",
    title: "نمونه کار عروس و میکاپ VIP",
    category: "عروس و میکاپ",
    image: "./uploads/sample-1791057397016-2-1791057523744.webp",
    description: "",
    createdAt: "2026-10-03T19:56:54.919Z"
  },
  {
    id: "g-1791057425635",
    title: "نمونه کار عروس و میکاپ VIP",
    category: "عروس و میکاپ",
    image: "./uploads/sample-1791057414919-3-1791057534458.jpg",
    description: "",
    createdAt: "2026-10-03T19:57:05.632Z"
  },
  {
    id: "g-1791057431081",
    title: "نمونه کار عروس و میکاپ VIP",
    category: "عروس و میکاپ",
    image: "./uploads/sample-1791057425632-4-1791057539907.jpg",
    description: "",
    createdAt: "2026-10-03T19:57:11.077Z"
  },
  {
    id: "g-1791057439360",
    title: "نمونه کار عروس و میکاپ VIP",
    category: "عروس و میکاپ",
    image: "./uploads/sample-1791057431077-5-1791057548149.jpg",
    description: "",
    createdAt: "2026-10-03T19:57:19.355Z"
  },
  {
    id: "g-1791057451628",
    title: "نمونه کار عروس و میکاپ VIP",
    category: "عروس و میکاپ",
    image: "./uploads/sample-1791057439355-6-1791057560450.jpg",
    description: "",
    createdAt: "2026-10-03T19:57:31.622Z"
  },
  {
    id: "g-1791057466877",
    title: "نمونه کار عروس و میکاپ VIP",
    category: "عروس و میکاپ",
    image: "./uploads/sample-1791057451622-7-1791057575701.jpg",
    description: "",
    createdAt: "2026-10-03T19:57:46.870Z"
  },
  {
    id: "g-1791057475391",
    title: "نمونه کار عروس و میکاپ VIP",
    category: "عروس و میکاپ",
    image: "./uploads/sample-1791057466870-8-1791057584205.jpg",
    description: "",
    createdAt: "2026-10-03T19:57:55.383Z"
  },
  {
    id: "g-1791057485336",
    title: "نمونه کار عروس و میکاپ VIP",
    category: "عروس و میکاپ",
    image: "./uploads/sample-1791057475383-9-1791057594156.jpg",
    description: "",
    createdAt: "2026-10-03T19:58:05.327Z"
  },
  {
    id: "g-1791057509822",
    title: "نمونه کار عروس و میکاپ VIP",
    category: "عروس و میکاپ",
    image: "./uploads/sample-1791057485327-10-1791057618632.jpg",
    description: "",
    createdAt: "2026-10-03T19:58:29.812Z"
  },
  {
    id: "item-braids-1",
    title: "بافت کوئین هلندی با موی فانتزی",
    category: "بافت و استایل",
    image: "./assets/braids/1.jpg",
    description: "نمونه‌کار تخصصی بافت و استایل مو با بهترین متریال در سالن راز ملکه"
  },
  {
    id: "item-braids-2",
    title: "بافت مکزیکی و کف‌سری مجلسی",
    category: "بافت و استایل",
    image: "./assets/braids/2.jpg",
    description: "نمونه‌کار تخصصی بافت و استایل مو با بهترین متریال در سالن راز ملکه"
  },
  {
    id: "item-braids-3",
    title: "بافت تیغ‌ماهی و ریسه‌ای مدرن",
    category: "بافت و استایل",
    image: "./assets/braids/3.jpg",
    description: "نمونه‌کار تخصصی بافت و استایل مو با بهترین متریال در سالن راز ملکه"
  },
  {
    id: "g-1791057692658",
    title: "نمونه کار رنگ، لایت و بالیاژ (شماره 1)",
    category: "رنگ و مو",
    image: "./uploads/slot-1791057686650-1791057801463.jpg",
    description: "",
    createdAt: "2026-10-03T20:01:32.658Z"
  },
  {
    id: "g-1791057710914",
    title: "نمونه کار رنگ، لایت و بالیاژ (شماره 2)",
    category: "رنگ و مو",
    image: "./uploads/slot-1791057702298-1791057819739.jpg",
    description: "",
    createdAt: "2026-10-03T20:01:50.914Z"
  },
  {
    id: "g-1791057724792",
    title: "نمونه کار رنگ، لایت و بالیاژ (شماره 3)",
    category: "رنگ و مو",
    image: "./uploads/slot-1791057719023-1791057833627.jpg",
    description: "",
    createdAt: "2026-10-03T20:02:04.792Z"
  },
  {
    id: "g-1791057787623",
    title: "نمونه کار رنگ، لایت و بالیاژ (شماره 4)",
    category: "رنگ و مو",
    image: "./uploads/slot-1791057782547-1791057896452.jpg",
    description: "",
    createdAt: "2026-10-03T20:03:07.623Z"
  },
  {
    id: "g-1791057850196",
    title: "نمونه کار رنگ، لایت و بالیاژ (شماره 5)",
    category: "رنگ و مو",
    image: "./uploads/slot-1791057842968-1791057958964.jpg",
    description: "",
    createdAt: "2026-10-03T20:04:10.196Z"
  },
  {
    id: "g-1791057866133",
    title: "نمونه کار رنگ، لایت و بالیاژ (شماره 6)",
    category: "رنگ و مو",
    image: "./uploads/slot-1791057862696-1791057974919.jpg",
    description: "",
    createdAt: "2026-10-03T20:04:26.133Z"
  },
  {
    id: "g-1791057880281",
    title: "نمونه کار رنگ، لایت و بالیاژ (شماره 7)",
    category: "رنگ و مو",
    image: "./uploads/slot-1791057873550-1791057989057.jpg",
    description: "",
    createdAt: "2026-10-03T20:04:40.281Z"
  },
  {
    id: "g-1791057895773",
    title: "نمونه کار رنگ، لایت و بالیاژ (شماره 8)",
    category: "رنگ و مو",
    image: "./uploads/slot-1791057891307-1791058004601.jpg",
    description: "",
    createdAt: "2026-10-03T20:04:55.773Z"
  },
  {
    id: "g-1791058168552",
    title: "نمونه کار خدمات تخصصی ناخن و پدیکور (شماره 1)",
    category: "ناخن و پدیکور",
    image: "./uploads/slot-1791058163856-1791058277381.jpg",
    description: "",
    createdAt: "2026-10-03T20:09:28.552Z"
  },
  {
    id: "g-1791058175758",
    title: "نمونه کار خدمات تخصصی ناخن و پدیکور (شماره 2)",
    category: "ناخن و پدیکور",
    image: "./uploads/slot-1791058174194-1791058284593.jpg",
    description: "",
    createdAt: "2026-10-03T20:09:35.758Z"
  },
  {
    id: "g-1791058620571",
    title: "نمونه کار احیا، کراتین و بوتاکس مو (شماره 1)",
    category: "احیا و کراتین",
    image: "./uploads/slot-1791058617902-1791058729407.jpg",
    description: "",
    createdAt: "2026-10-03T20:17:00.572Z"
  },
  {
    id: "g-1791058650471",
    title: "نمونه کار احیا، کراتین و بوتاکس مو (شماره 2)",
    category: "احیا و کراتین",
    image: "./uploads/slot-1791058645889-1791058759310.jpg",
    description: "",
    createdAt: "2026-10-03T20:17:30.471Z"
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
