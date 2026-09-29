export interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  price?: string; // Optional price to make it fully functional and professional
}

export interface GalleryTopic {
  id: string;
  title: string;
  category: string; // Key category string to group gallery items
  coverImage: string;
  description: string;
  badgeText?: string;
}

export interface GalleryItem {
  id: string;
  image: string;
  category: string; // Matches topic category or title
  title: string;
  description?: string;
  createdAt?: string;
}

export interface AdminCredentials {
  username: string;
  password: string;
  lastUpdated?: string;
}

export interface SalonInfo {
  name: string;
  slogan: string;
  instagram: string;
  phone1: string;
  phone2: string;
  address: string;
  mapLink: string;
  logoUrl?: string;
  backgroundBannerUrl?: string; // بنر عریض پس‌زمینه هدر و بالای وبسایت
  topSmallBannerUrl?: string;   // بنر کوچک سمت راست بالا (نشان و لوگوی بالای صفحه)
  heroBannerUrl?: string;       // بنر تصویر سالن در باکس معرفی (Hero)
}
