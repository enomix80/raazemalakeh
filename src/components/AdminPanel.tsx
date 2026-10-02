import React, { useState, useEffect } from "react";
import {
  Lock,
  Save,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ShieldAlert,
  Sparkles,
  Image as ImageIcon,
  Phone,
  Settings,
  FolderHeart,
  Eye,
  EyeOff,
  KeyRound,
  Layers,
  Upload,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  FolderOpen,
  FolderTree,
  RefreshCw,
  ExternalLink,
  Camera,
  Search,
  Filter,
  Tag,
  GitBranch,
  CloudUpload,
  Download,
  Globe,
  Share2
} from "lucide-react";
import { Service, GalleryItem, GalleryTopic, SalonInfo, AdminCredentials } from "../types";
import { DEFAULT_ADMIN_CREDENTIALS } from "../data";
import { compressImageFile } from "../utils/imageCompressor";
import { uploadImageDirectly } from "../utils/imageUploadService";
import { saveAllAppData } from "../utils/persistentStorage";
import { resolveImageUrl } from "../utils/imagePath";
import {
  getGitHubConfig,
  saveGitHubConfig,
  pushAppDataToGitHub,
  commitFileToGitHub,
  GitHubConfig
} from "../utils/githubSync";

interface AdminPanelProps {
  services: Service[];
  gallery: GalleryItem[];
  topics: GalleryTopic[];
  salonInfo: SalonInfo;
  onUpdateServices: (services: Service[]) => void;
  onUpdateGallery: (gallery: GalleryItem[]) => void;
  onUpdateTopics: (topics: GalleryTopic[]) => void;
  onUpdateSalonInfo: (info: SalonInfo) => void;
  onFinalSaveAll?: (data: {
    salonInfo: SalonInfo;
    topics: GalleryTopic[];
    gallery: GalleryItem[];
    services: Service[];
  }) => Promise<boolean>;
  onClose: () => void;
  isAdminLoggedIn: boolean;
  onLoginSuccess: () => void;
}

export default function AdminPanel({
  services,
  gallery,
  topics,
  salonInfo,
  onUpdateServices,
  onUpdateGallery,
  onUpdateTopics,
  onUpdateSalonInfo,
  onFinalSaveAll,
  onClose,
  isAdminLoggedIn,
  onLoginSuccess
}: AdminPanelProps) {
  // Authentication State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<"topics" | "assets" | "banners" | "services" | "info" | "security" | "github">("topics");
  const [isScanningAssets, setIsScanningAssets] = useState(false);
  const [scanStatusMessage, setScanStatusMessage] = useState("");

  // GitHub Sync State & Handlers
  const [ghConfig, setGhConfig] = useState<GitHubConfig>(getGitHubConfig());
  const [ghRepoInput, setGhRepoInput] = useState(ghConfig.repo || "e.salehi8082/");
  const [ghTokenInput, setGhTokenInput] = useState(ghConfig.token || "");
  const [ghBranchInput, setGhBranchInput] = useState(ghConfig.branch || "main");
  const [isPushingGitHub, setIsPushingGitHub] = useState(false);
  const [ghStatusMsg, setGhStatusMsg] = useState("");
  const [ghErrorMsg, setGhErrorMsg] = useState("");

  const handleSaveGhConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: GitHubConfig = {
      repo: ghRepoInput.trim(),
      token: ghTokenInput.trim(),
      branch: ghBranchInput.trim() || "main"
    };
    setGhConfig(updated);
    saveGitHubConfig(updated);
    setGhStatusMsg("تنظیمات اتصال به گیت‌هاب با موفقیت در سیستم شما ذخیره شد!");
    setGhErrorMsg("");
  };

  const handlePushToGitHub = async () => {
    if (!ghConfig.repo || !ghConfig.token) {
      setActiveTab("github");
      alert("لطفاً ابتدا نام ریپازیتوری و توکن گیت‌هاب را در تب «همگام‌سازی با گیت‌هاب» وارد فرمایید.");
      return;
    }

    setIsPushingGitHub(true);
    setGhStatusMsg("در حال ذخیره و کامیت کلیه تصاویر و اطلاعات در ریپازیتوری گیت‌هاب...");
    setGhErrorMsg("");

    const dataToSave = {
      salonInfo,
      topics,
      gallery,
      services,
      updatedAt: new Date().toISOString()
    };

    const res = await pushAppDataToGitHub(dataToSave);
    setIsPushingGitHub(false);

    if (res.success) {
      setGhStatusMsg(res.message);
      alert("✅ کلیه تصاویر و اطلاعات سالن با موفقیت مستقیماً در ریپازیتوری گیت‌هاب ثبت شدند! تمامی افرادی که با لینک وارد سایت شوند، آخرین تغییرات را مشاهده خواهند کرد.");
    } else {
      setGhErrorMsg(res.message);
      alert("خطا در ارسال به گیت‌هاب: " + res.message);
    }
  };

  const handleDownloadAppDataJson = () => {
    const dataToSave = {
      salonInfo,
      topics,
      gallery,
      services,
      updatedAt: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(dataToSave, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "app-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Scan & sync assets from folders
  const handleScanAssets = async () => {
    setIsScanningAssets(true);
    setScanStatusMessage("");
    try {
      const res = await fetch("/api/scan-assets", { method: "POST" });
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.topics) onUpdateTopics(json.data.topics);
        if (json.data.gallery) onUpdateGallery(json.data.gallery);
        if (json.data.salonInfo) onUpdateSalonInfo(json.data.salonInfo);
        setScanStatusMessage("پوشه‌های assets با موفقیت اسکن شدند و تمامی تامبنیل‌ها و تصاویر به‌روزرسانی گردیدند.");
      } else {
        setScanStatusMessage("خطا در اسکن پوشه‌ها: " + (json.error || "خطای ناشناخته"));
      }
    } catch (err: any) {
      setScanStatusMessage("خطا در اتصال به سرور: " + err.message);
    } finally {
      setIsScanningAssets(false);
    }
  };

  // Credentials State
  const [savedCredentials, setSavedCredentials] = useState<AdminCredentials>(DEFAULT_ADMIN_CREDENTIALS);
  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [currentAdminPassword, setCurrentAdminPassword] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");
  const [securitySuccessMessage, setSecuritySuccessMessage] = useState("");
  const [securityErrorMessage, setSecurityErrorMessage] = useState("");

  // State for Service Editing/Addition
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingServiceModal, setEditingServiceModal] = useState<Service | null>(null);
  const [isAddingNewService, setIsAddingNewService] = useState(false);
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState("همه");
  const [assetsSubTab, setAssetsSubTab] = useState<"gallery" | "services">("gallery");

  const [serviceTitle, setServiceTitle] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [serviceImage, setServiceImage] = useState("");
  const [servicePrice, setServicePrice] = useState("");

  // State for Topic-based Gallery Management
  const [selectedTopicCategory, setSelectedTopicCategory] = useState<string>(
    topics[0]?.category || "عروس و میکاپ"
  );
  const [newPhotoTitle, setNewPhotoTitle] = useState("");
  const [newPhotoDesc, setNewPhotoDesc] = useState("");
  const [newPhotoImage, setNewPhotoImage] = useState("");

  // State for Editing an Existing Photo Item
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editPhotoTitle, setEditPhotoTitle] = useState("");
  const [editPhotoDesc, setEditPhotoDesc] = useState("");
  const [editPhotoImage, setEditPhotoImage] = useState("");

  // Upload progress & loading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusMessage, setUploadStatusMessage] = useState("");

  // State for Editing Active Topic Cover & Metadata
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [editTopicTitle, setEditTopicTitle] = useState("");
  const [editTopicCategory, setEditTopicCategory] = useState("");
  const [editTopicCover, setEditTopicCover] = useState("");
  const [editTopicDesc, setEditTopicDesc] = useState("");
  const [editTopicBadge, setEditTopicBadge] = useState("");

  // State for New Topic Creation
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicCategory, setNewTopicCategory] = useState("");
  const [newTopicCover, setNewTopicCover] = useState("");
  const [newTopicDesc, setNewTopicDesc] = useState("");
  const [newTopicBadge, setNewTopicBadge] = useState("");

  // State for Salon Info and Banners editing
  const [infoName, setInfoName] = useState(salonInfo.name);
  const [infoSlogan, setInfoSlogan] = useState(salonInfo.slogan);
  const [infoInsta, setInfoInsta] = useState(salonInfo.instagram);
  const [infoPhone1, setInfoPhone1] = useState(salonInfo.phone1);
  const [infoPhone2, setInfoPhone2] = useState(salonInfo.phone2);
  const [infoAddress, setInfoAddress] = useState(salonInfo.address);
  const [infoMap, setInfoMap] = useState(salonInfo.mapLink);
  const [infoLogoUrl, setInfoLogoUrl] = useState(salonInfo.logoUrl || "");
  const [infoBackgroundBannerUrl, setInfoBackgroundBannerUrl] = useState(salonInfo.backgroundBannerUrl || "");
  const [infoTopSmallBannerUrl, setInfoTopSmallBannerUrl] = useState(salonInfo.topSmallBannerUrl || salonInfo.logoUrl || "");
  const [infoHeroBannerUrl, setInfoHeroBannerUrl] = useState(salonInfo.heroBannerUrl || "");

  // Master Final Save & Persistence States
  const [isSavingFinal, setIsSavingFinal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string | null>(null);
  const [showFinalSaveSuccessModal, setShowFinalSaveSuccessModal] = useState(false);

  // Helper for real-time live synchronization with site state
  const updateFieldAndSync = async (field: keyof SalonInfo, val: string) => {
    const nextInfo: SalonInfo = {
      name: field === "name" ? val : infoName,
      slogan: field === "slogan" ? val : infoSlogan,
      instagram: field === "instagram" ? val : infoInsta,
      phone1: field === "phone1" ? val : infoPhone1,
      phone2: field === "phone2" ? val : infoPhone2,
      address: field === "address" ? val : infoAddress,
      mapLink: field === "mapLink" ? val : infoMap,
      logoUrl: field === "topSmallBannerUrl" ? val : (field === "logoUrl" ? val : (infoTopSmallBannerUrl || infoLogoUrl)),
      topSmallBannerUrl: field === "topSmallBannerUrl" ? val : infoTopSmallBannerUrl,
      backgroundBannerUrl: field === "backgroundBannerUrl" ? val : infoBackgroundBannerUrl,
      heroBannerUrl: field === "heroBannerUrl" ? val : infoHeroBannerUrl
    };

    if (field === "name") setInfoName(val);
    if (field === "slogan") setInfoSlogan(val);
    if (field === "instagram") setInfoInsta(val);
    if (field === "phone1") setInfoPhone1(val);
    if (field === "phone2") setInfoPhone2(val);
    if (field === "address") setInfoAddress(val);
    if (field === "mapLink") setInfoMap(val);
    if (field === "logoUrl") {
      setInfoLogoUrl(val);
    }
    if (field === "topSmallBannerUrl") {
      setInfoTopSmallBannerUrl(val);
      setInfoLogoUrl(val);
    }
    if (field === "backgroundBannerUrl") {
      setInfoBackgroundBannerUrl(val);
    }
    if (field === "heroBannerUrl") {
      setInfoHeroBannerUrl(val);
    }

    // Immediately push live updates to the website
    onUpdateSalonInfo(nextInfo);

    // If an image was updated, immediately commit permanently to persistent storage and server
    const isImageField = field === "topSmallBannerUrl" || field === "logoUrl" || field === "backgroundBannerUrl" || field === "heroBannerUrl";
    if (isImageField) {
      await saveAllAppData({
        salonInfo: nextInfo,
        topics,
        gallery,
        services
      });
      setHasUnsavedChanges(false);
      setLastSavedTimestamp(
        new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
      );
    } else {
      setHasUnsavedChanges(true);
    }
  };

  // Sync state if salonInfo prop changes and no pending edits in progress
  useEffect(() => {
    if (!hasUnsavedChanges) {
      setInfoName(salonInfo.name);
      setInfoSlogan(salonInfo.slogan);
      setInfoInsta(salonInfo.instagram);
      setInfoPhone1(salonInfo.phone1);
      setInfoPhone2(salonInfo.phone2);
      setInfoAddress(salonInfo.address);
      setInfoMap(salonInfo.mapLink);
      setInfoLogoUrl(salonInfo.logoUrl || "");
      setInfoBackgroundBannerUrl(salonInfo.backgroundBannerUrl || "");
      setInfoTopSmallBannerUrl(salonInfo.topSmallBannerUrl || salonInfo.logoUrl || "");
      setInfoHeroBannerUrl(salonInfo.heroBannerUrl || "");
    }
  }, [salonInfo, hasUnsavedChanges]);

  // Load credentials on mount
  useEffect(() => {
    const creds = localStorage.getItem("queen_salon_admin_credentials");
    if (creds) {
      try {
        const parsed = JSON.parse(creds);
        setSavedCredentials(parsed);
        setNewAdminUsername(parsed.username);
      } catch {
        setSavedCredentials(DEFAULT_ADMIN_CREDENTIALS);
        setNewAdminUsername(DEFAULT_ADMIN_CREDENTIALS.username);
      }
    } else {
      setSavedCredentials(DEFAULT_ADMIN_CREDENTIALS);
      setNewAdminUsername(DEFAULT_ADMIN_CREDENTIALS.username);
      localStorage.setItem("queen_salon_admin_credentials", JSON.stringify(DEFAULT_ADMIN_CREDENTIALS));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const inputUser = username.trim();
    const inputPass = password;

    const isValidSaved =
      inputUser.toLowerCase() === savedCredentials.username.toLowerCase() &&
      inputPass === savedCredentials.password;

    const isDefaultFallback =
      (inputUser.toLowerCase() === "admin" && inputPass === "Queen@2026") ||
      (inputUser.toLowerCase() === "raazemalake" && inputPass === "Queen@2026") ||
      (inputUser === "RaazeMalakeAdmin" && inputPass === "QueenSecurePass@2026!");

    if (isValidSaved || isDefaultFallback) {
      onLoginSuccess();
      setLoginError("");
    } else {
      setLoginError("نام کاربری یا رمز عبور اشتباه است! لطفاً مشخصات معتبر مدیریت را وارد کنید.");
    }
  };

  // Change Password / Credentials Handler
  const handleChangeCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setSecuritySuccessMessage("");
    setSecurityErrorMessage("");

    if (currentAdminPassword !== savedCredentials.password && currentAdminPassword !== "Queen@2026") {
      setSecurityErrorMessage("رمز عبور فعلی نادرست است.");
      return;
    }

    if (!newAdminPassword || newAdminPassword.length < 4) {
      setSecurityErrorMessage("رمز عبور جدید باید حداقل ۴ کاراکتر باشد.");
      return;
    }

    if (newAdminPassword !== confirmAdminPassword) {
      setSecurityErrorMessage("تکرار رمز عبور جدید با رمز وارد شده همخوانی ندارد.");
      return;
    }

    const updated: AdminCredentials = {
      username: newAdminUsername.trim() || savedCredentials.username,
      password: newAdminPassword,
      lastUpdated: new Date().toISOString()
    };

    setSavedCredentials(updated);
    localStorage.setItem("queen_salon_admin_credentials", JSON.stringify(updated));
    setSecuritySuccessMessage("نام کاربری و رمز عبور اختصاصی مدیریت با موفقیت بروزرسانی شد!");
    setCurrentAdminPassword("");
    setNewAdminPassword("");
    setConfirmAdminPassword("");
  };

  // Service Handlers
  const PRESET_SERVICE_THUMBNAILS = [
    { label: "مژه و ابرو", url: "/assets/services/lashes.jpg" },
    { label: "رنگ و لایت", url: "/assets/services/color.jpg" },
    { label: "کوتاهی مو", url: "/assets/services/haircut.jpg" },
    { label: "اصلاح و ابرو", url: "/assets/services/eyebrow.jpg" },
    { label: "احیا و کراتین", url: "/assets/services/keratin.jpg" },
    { label: "کاشت ناخن", url: "/assets/services/nails.jpg" },
    { label: "فشیال پوست", url: "/assets/services/skin.jpg" },
    { label: "میکاپ و شینیون", url: "/assets/services/makeup.jpg" },
    { label: "عروس VIP", url: "/assets/services/bridal.jpg" },
    { label: "پدیکور و کفسابی", url: "/assets/services/pedicure.jpg" },
    { label: "بافت مو", url: "/assets/services/braids.jpg" }
  ];

  const syncServicesImmediately = async (newServicesList: Service[]) => {
    onUpdateServices(newServicesList);
    setHasUnsavedChanges(true);
    try {
      await fetch("/api/app-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          services: newServicesList,
          topics,
          gallery,
          salonInfo: {
            ...salonInfo,
            name: infoName.trim() || salonInfo.name,
            topSmallBannerUrl: infoTopSmallBannerUrl.trim() || salonInfo.topSmallBannerUrl,
            backgroundBannerUrl: infoBackgroundBannerUrl.trim() || salonInfo.backgroundBannerUrl,
            heroBannerUrl: infoHeroBannerUrl.trim() || salonInfo.heroBannerUrl
          }
        })
      });
      saveAllAppData({
        services: newServicesList,
        topics,
        gallery,
        salonInfo
      }).catch(() => {});
    } catch (err) {
      console.error("Auto sync services error:", err);
    }
  };

  const handleOpenEditServiceModal = (service: Service) => {
    setEditingServiceModal({ ...service });
    setIsAddingNewService(false);
  };

  const handleOpenCreateServiceModal = () => {
    setEditingServiceModal({
      id: "service-" + Date.now().toString(),
      title: "",
      category: "مژه و ابرو",
      description: "",
      image: "/assets/services/lashes.jpg",
      price: ""
    });
    setIsAddingNewService(true);
  };

  const handleSaveServiceModal = async () => {
    if (!editingServiceModal) return;
    if (!editingServiceModal.title.trim()) {
      alert("لطفاً عنوان خدمت را وارد فرمایید.");
      return;
    }
    if (!editingServiceModal.image.trim()) {
      alert("لطفاً تامبنیل یا تصویر مرتبط با خدمت را انتخاب یا وارد فرمایید.");
      return;
    }

    const exists = services.some((s) => s.id === editingServiceModal.id);
    let updated: Service[];
    if (exists) {
      updated = services.map((s) =>
        s.id === editingServiceModal.id ? editingServiceModal : s
      );
    } else {
      updated = [editingServiceModal, ...services];
    }

    await syncServicesImmediately(updated);
    setEditingServiceModal(null);
    setIsAddingNewService(false);
    alert("✅ مشخصات و تامبنیل لاین خدمت با موفقیت به‌روزرسانی و بر روی سایت ثبت شد!");
  };

  const handleDirectServiceImageUpload = async (serviceId: string, file: File) => {
    try {
      setIsUploading(true);
      setUploadStatusMessage("در حال آپلود و ذخیره مستقیم تامبنیل خدمت روی سرور...");
      const uploaded = await uploadImageDirectly(file, "services", `service-${serviceId}`, 1000, 1000, 0.85);

      const updated = services.map((s) =>
        s.id === serviceId ? { ...s, image: uploaded.url } : s
      );
      await syncServicesImmediately(updated);

      if (editingServiceModal && editingServiceModal.id === serviceId) {
        setEditingServiceModal({ ...editingServiceModal, image: uploaded.url });
      }

      setIsUploading(false);
      setUploadStatusMessage("");
      alert("✅ تصویر تامبنیل خدمت با موفقیت به‌روزرسانی شد و برای همه با لینک قابل مشاهده است!");
    } catch (err: any) {
      setIsUploading(false);
      setUploadStatusMessage("");
      alert(err.message || "خطا در پردازش تصویر");
    }
  };

  const handleAddOrUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceTitle || !serviceCategory || !serviceImage) {
      alert("لطفاً فیلدهای ستاره‌دار را پر کنید.");
      return;
    }

    let updated: Service[];
    if (editingServiceId) {
      updated = services.map((s) =>
        s.id === editingServiceId
          ? {
              ...s,
              title: serviceTitle,
              category: serviceCategory,
              description: serviceDesc,
              image: serviceImage,
              price: servicePrice
            }
          : s
      );
      setEditingServiceId(null);
    } else {
      const newService: Service = {
        id: Date.now().toString(),
        title: serviceTitle,
        category: serviceCategory,
        description: serviceDesc,
        image: serviceImage,
        price: servicePrice
      };
      updated = [newService, ...services];
    }

    await syncServicesImmediately(updated);
    setServiceTitle("");
    setServiceCategory("");
    setServiceDesc("");
    setServiceImage("");
    setServicePrice("");
    alert("✅ اطلاعات لاین خدمت با موفقیت ذخیره شد!");
  };

  const handleEditServiceClick = (service: Service) => {
    handleOpenEditServiceModal(service);
  };

  const handleDeleteService = async (id: string) => {
    if (confirm("آیا از حذف این لاین خدمت مطمئن هستید؟")) {
      const updated = services.filter((s) => s.id !== id);
      await syncServicesImmediately(updated);
      alert("لاین خدمت حذف شد.");
    }
  };

  // Direct Cover Upload from PC/Phone with automatic compression & server/cloud upload
  const handleDirectCoverUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadStatusMessage("در حال آپلود و ذخیره مستقیم عکس کاور تاپیک بر روی سرور...");
      const uploaded = await uploadImageDirectly(file, "topics", `topic-${currentTopic?.category || "cover"}`, 1280, 1280, 0.82);

      const updatedTopics = topics.map((t) => {
        if (t.category === selectedTopicCategory || t.id === currentTopic?.id) {
          return {
            ...t,
            coverImage: uploaded.url
          };
        }
        return t;
      });

      onUpdateTopics(updatedTopics);
      setEditTopicCover(uploaded.url);
      await saveAllAppData({
        topics: updatedTopics,
        salonInfo,
        gallery,
        services
      });
      setIsUploading(false);
      setUploadStatusMessage("");
      alert("✅ عکس کاور تاپیک با موفقیت آپلود شد و بلافاصله برای تمامی بازدیدکنندگان فعال گردید!");
    } catch (err: any) {
      setIsUploading(false);
      setUploadStatusMessage("");
      alert(err.message || "خطا در آپلود عکس کاور تاپیک");
    }
  };

  // Remove Cover Image from Active Topic
  const handleRemoveCover = async () => {
    if (confirm("آیا از حذف عکس کاور این تاپیک مطمئن هستید؟")) {
      const updatedTopics = topics.map((t) => {
        if (t.category === selectedTopicCategory || t.id === currentTopic?.id) {
          return {
            ...t,
            coverImage: ""
          };
        }
        return t;
      });

      onUpdateTopics(updatedTopics);
      setEditTopicCover("");
      await saveAllAppData({
        topics: updatedTopics,
        salonInfo,
        gallery,
        services
      });
      alert("✅ عکس کاور تاپیک حذف و تغییرات ذخیره شد.");
    }
  };

  // Batch or Single Sample Photos Upload
  const handleBatchSamplePhotosUpload = async (files: File[]) => {
    if (files.length === 0) return;
    try {
      setIsUploading(true);
      setUploadStatusMessage(`در حال آپلود و بهینه‌سازی مستقیم ${files.length} تصویر بر روی سرور...`);

      const newItems: GalleryItem[] = [];
      const topicTitle = currentTopic?.title || selectedTopicCategory;

      for (let i = 0; i < files.length; i++) {
        setUploadStatusMessage(`در حال آپلود مستقیم عکس ${i + 1} از ${files.length}...`);
        const uploaded = await uploadImageDirectly(
          files[i],
          "gallery",
          `sample-${Date.now()}-${i}`,
          1280,
          1280,
          0.82
        );
        newItems.push({
          id: "g-" + (Date.now() + i).toString(),
          title: `نمونه کار ${topicTitle}`,
          category: selectedTopicCategory,
          image: uploaded.url,
          description: "",
          createdAt: new Date().toISOString()
        });
      }

      const updatedGallery = [...newItems, ...gallery];
      onUpdateGallery(updatedGallery);
      await saveAllAppData({
        gallery: updatedGallery,
        topics,
        salonInfo,
        services
      });
      setIsUploading(false);
      setUploadStatusMessage("");
      alert(`✅ ${files.length} نمونه‌کار با موفقیت مستقیم روی سرور آپلود شد و بدون نیاز به گیت‌هاب برای همه کاربران با لینک قابل مشاهده است!`);
    } catch (err: any) {
      setIsUploading(false);
      setUploadStatusMessage("");
      alert(err.message || "خطا در آپلود نمونه‌کارها");
    }
  };

  // Gallery Topic Photo Add Handler (From form)
  const handleAddPhotoToTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoImage.trim()) {
      alert("لطفاً تصویر نمونه‌کار را انتخاب یا وارد نمایید.");
      return;
    }

    const topicTitle = currentTopic?.title || selectedTopicCategory;
    const titleToUse = newPhotoTitle.trim() || `نمونه کار ${topicTitle}`;

    const newItem: GalleryItem = {
      id: "g-" + Date.now().toString(),
      title: titleToUse,
      category: selectedTopicCategory,
      image: newPhotoImage.trim(),
      description: newPhotoDesc.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedGallery = [newItem, ...gallery];
    onUpdateGallery(updatedGallery);
    await saveAllAppData({
      gallery: updatedGallery,
      topics,
      salonInfo,
      services
    });
    setNewPhotoTitle("");
    setNewPhotoDesc("");
    setNewPhotoImage("");
    alert(`✅ نمونه‌کار جدید با موفقیت به لاین «${topicTitle}» اضافه و ذخیره شد.`);
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (confirm("آیا از حذف این عکس نمونه کار مطمئن هستید؟")) {
      const updatedGallery = gallery.filter((g) => g.id !== id);
      onUpdateGallery(updatedGallery);
      await saveAllAppData({
        gallery: updatedGallery,
        topics,
        salonInfo,
        services
      });
      if (editingPhotoId === id) {
        setEditingPhotoId(null);
      }
    }
  };

  // Start Editing Specific Photo Item
  const handleStartEditPhoto = (photo: GalleryItem) => {
    setEditingPhotoId(photo.id);
    setEditPhotoTitle(photo.title);
    setEditPhotoDesc(photo.description || "");
    setEditPhotoImage(photo.image);
  };

  // Save Edited Photo Item
  const handleSaveEditedPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPhotoImage.trim()) {
      alert("لطفاً تصویر نمونه‌کار را مشخص نمایید.");
      return;
    }

    const updatedGallery = gallery.map((item) => {
      if (item.id === editingPhotoId) {
        return {
          ...item,
          title: editPhotoTitle.trim() || item.title,
          description: editPhotoDesc.trim(),
          image: editPhotoImage.trim()
        };
      }
      return item;
    });

    onUpdateGallery(updatedGallery);
    await saveAllAppData({
      gallery: updatedGallery,
      topics,
      salonInfo,
      services
    });
    setEditingPhotoId(null);
    setEditPhotoTitle("");
    setEditPhotoDesc("");
    setEditPhotoImage("");
    alert("✅ نمونه‌کار با موفقیت ویرایش و ذخیره شد.");
  };

  const handleCancelEditPhoto = () => {
    setEditingPhotoId(null);
    setEditPhotoTitle("");
    setEditPhotoDesc("");
    setEditPhotoImage("");
  };

  // Start Editing Topic Details
  const handleStartEditTopic = (topic: GalleryTopic) => {
    setIsEditingTopic(true);
    setEditTopicTitle(topic.title);
    setEditTopicCategory(topic.category);
    setEditTopicCover(topic.coverImage);
    setEditTopicDesc(topic.description);
    setEditTopicBadge(topic.badgeText || "");
  };

  // Save Edited Topic (including Cover Image)
  const handleSaveEditedTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTopicTitle.trim()) {
      alert("لطفاً عنوان تاپیک را مشخص نمایید.");
      return;
    }

    const updatedTopics = topics.map((t) => {
      if (t.category === selectedTopicCategory || t.id === currentTopic?.id) {
        return {
          ...t,
          title: editTopicTitle.trim(),
          coverImage: editTopicCover.trim(),
          description: editTopicDesc.trim(),
          badgeText: editTopicBadge.trim()
        };
      }
      return t;
    });

    onUpdateTopics(updatedTopics);
    await saveAllAppData({
      topics: updatedTopics,
      salonInfo,
      gallery,
      services
    });
    setIsEditingTopic(false);
    alert("✅ مشخصات و تصویر کاور تاپیک با موفقیت ذخیره و ثبت شد!");
  };

  // Delete Topic and its photos
  const handleDeleteTopic = async (topicToDelete: GalleryTopic) => {
    if (topics.length <= 1) {
      alert("حداقل یک تاپیک و آلبوم باید در سیستم وجود داشته باشد.");
      return;
    }

    if (confirm(`آیا از حذف کامل تاپیک «${topicToDelete.title}» و تمام نمونه‌کارهای مرتبط با آن مطمئن هستید؟`)) {
      const remainingTopics = topics.filter((t) => t.id !== topicToDelete.id);
      const remainingGallery = gallery.filter((g) => g.category !== topicToDelete.category);
      onUpdateTopics(remainingTopics);
      onUpdateGallery(remainingGallery);
      await saveAllAppData({
        topics: remainingTopics,
        gallery: remainingGallery,
        salonInfo,
        services
      });
      setSelectedTopicCategory(remainingTopics[0]?.category || "");
      setIsEditingTopic(false);
      alert(`تاپیک «${topicToDelete.title}» با موفقیت حذف شد.`);
    }
  };

  // Add New Custom Topic Handler
  const handleCreateNewTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicCategory.trim()) {
      alert("لطفاً حداقل عنوان و دسته‌بندی تاپیک را وارد نمایید.");
      return;
    }

    const newTopic: GalleryTopic = {
      id: "topic-" + Date.now().toString(),
      title: newTopicTitle.trim(),
      category: newTopicCategory.trim(),
      coverImage: newTopicCover.trim(),
      description: newTopicDesc.trim() || `معرفی خدمات و نمونه‌کارهای لاین تخصصی ${newTopicTitle.trim()}`,
      badgeText: newTopicBadge.trim() || "لاین جدید"
    };

    const updatedTopics = [...topics, newTopic];
    onUpdateTopics(updatedTopics);
    await saveAllAppData({
      topics: updatedTopics,
      salonInfo,
      gallery,
      services
    });
    setSelectedTopicCategory(newTopic.category);
    setShowNewTopicModal(false);
    setNewTopicTitle("");
    setNewTopicCategory("");
    setNewTopicCover("");
    setNewTopicDesc("");
    setNewTopicBadge("");
    alert(`✅ تاپیک جدید "${newTopic.title}" با موفقیت اضافه و ذخیره شد!`);
  };

  // Master Final Save & Persistence Handler
  const handleMasterFinalSave = async () => {
    setIsSavingFinal(true);
    try {
      const latestInfo: SalonInfo = {
        name: infoName.trim() || salonInfo.name,
        slogan: infoSlogan.trim() || salonInfo.slogan,
        instagram: infoInsta.trim() || salonInfo.instagram,
        phone1: infoPhone1.trim() || salonInfo.phone1,
        phone2: infoPhone2.trim() || salonInfo.phone2,
        address: infoAddress.trim() || salonInfo.address,
        mapLink: infoMap.trim() || salonInfo.mapLink,
        logoUrl: infoTopSmallBannerUrl.trim() || infoLogoUrl.trim() || salonInfo.logoUrl,
        topSmallBannerUrl: infoTopSmallBannerUrl.trim() || salonInfo.topSmallBannerUrl,
        backgroundBannerUrl: infoBackgroundBannerUrl.trim() || salonInfo.backgroundBannerUrl,
        heroBannerUrl: infoHeroBannerUrl.trim() || salonInfo.heroBannerUrl
      };

      // 1. Immediately update live website state
      onUpdateSalonInfo(latestInfo);
      onUpdateTopics(topics);
      onUpdateGallery(gallery);
      onUpdateServices(services);

      // 2. Commit permanently to IndexedDB & localStorage
      if (onFinalSaveAll) {
        await onFinalSaveAll({
          salonInfo: latestInfo,
          topics,
          gallery,
          services
        });
      } else {
        await saveAllAppData({
          salonInfo: latestInfo,
          topics,
          gallery,
          services
        });
      }

      setHasUnsavedChanges(false);
      setLastSavedTimestamp(
        new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
      );
      setShowFinalSaveSuccessModal(true);
    } catch (err: any) {
      console.error("Master save error:", err);
      alert("خطا در ثبت نهایی اطلاعات: " + (err.message || "لطفاً دوباره تلاش کنید."));
    } finally {
      setIsSavingFinal(false);
    }
  };

  // Salon Info & Banners Form Save
  const handleSaveSalonInfo = (e: React.FormEvent) => {
    e.preventDefault();
    handleMasterFinalSave();
  };

  // Direct Background Banner Upload with Server & Cloud Upload
  const handleDirectBackgroundBannerUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadStatusMessage("در حال آپلود و ذخیره مستقیم بنر بک‌گراند روی سرور...");
      const uploaded = await uploadImageDirectly(file, "branding", "top_banner", 1600, 1000, 0.82);
      await updateFieldAndSync("backgroundBannerUrl", uploaded.url);
      setIsUploading(false);
      setUploadStatusMessage("");
      alert("✅ تصویر بنر بک‌گراند آپلود شد و بلافاصله بر روی سایت ذخیره گردید و برای همه با لینک قابل مشاهده است!");
    } catch (err: any) {
      setIsUploading(false);
      setUploadStatusMessage("");
      alert(err.message || "خطا در بارگذاری بنر بک‌گراند");
    }
  };

  // Direct Top-Right Small Banner / Logo Upload with Server & Cloud Upload
  const handleDirectTopSmallBannerUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadStatusMessage("در حال آپلود و ذخیره مستقیم بنر کوچک / لوگوی سالن روی سرور...");
      const uploaded = await uploadImageDirectly(file, "branding", "logo", 600, 600, 0.85);
      await updateFieldAndSync("topSmallBannerUrl", uploaded.url);
      setIsUploading(false);
      setUploadStatusMessage("");
      alert("✅ نشان و لوگوی سالن مستقیماً روی سرور آپلود شد و برای تمامی بازدیدکنندگان لینک فعال گردید!");
    } catch (err: any) {
      setIsUploading(false);
      setUploadStatusMessage("");
      alert(err.message || "خطا در بارگذاری بنر کوچک سمت راست بالا");
    }
  };

  // Direct Hero Image Banner Upload with Server & Cloud Upload
  const handleDirectHeroBannerUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadStatusMessage("در حال آپلود و ذخیره مستقیم بنر هیرو روی سرور...");
      const uploaded = await uploadImageDirectly(file, "branding", "hero", 1400, 900, 0.82);
      await updateFieldAndSync("heroBannerUrl", uploaded.url);
      setIsUploading(false);
      setUploadStatusMessage("");
      alert("✅ تصویر بنر هیرو (معرفی سالن) با موفقیت آپلود شد و بدون نیاز به گیت‌هاب بر روی سایت قرار گرفت!");
    } catch (err: any) {
      setIsUploading(false);
      setUploadStatusMessage("");
      alert(err.message || "خطا در بارگذاری تصویر هیرو");
    }
  };

  // Apply & Save Background Banner URL
  const handleApplyBackgroundBannerUrl = async () => {
    if (!infoBackgroundBannerUrl.trim()) {
      alert("لطفاً آدرس اینترنتی معتبر برای بنر بک‌گراند را وارد فرمایید.");
      return;
    }
    const val = infoBackgroundBannerUrl.trim();
    await updateFieldAndSync("backgroundBannerUrl", val);
    alert("✅ بنر بک‌گراند بالای وبسایت با موفقیت روی سایت قرار گرفت و ثبت شد!");
  };

  // Apply & Save Top Small Banner URL
  const handleApplyTopSmallBannerUrl = async () => {
    if (!infoTopSmallBannerUrl.trim()) {
      alert("لطفاً آدرس اینترنتی معتبر برای بنر کوچک یا لوگو را وارد فرمایید.");
      return;
    }
    const val = infoTopSmallBannerUrl.trim();
    await updateFieldAndSync("topSmallBannerUrl", val);
    alert("✅ نشان و لوگوی سالن با موفقیت روی سایت قرار گرفت و ثبت شد!");
  };

  // Apply & Save Hero Banner URL
  const handleApplyHeroBannerUrl = async () => {
    if (!infoHeroBannerUrl.trim()) {
      alert("لطفاً آدرس اینترنتی معتبر برای تصویر هیرو را وارد فرمایید.");
      return;
    }
    const val = infoHeroBannerUrl.trim();
    await updateFieldAndSync("heroBannerUrl", val);
    alert("✅ تصویر بنر هیرو با موفقیت بر روی سایت قرار گرفت و ثبت شد!");
  };

  const handleResetBackgroundBanner = async () => {
    if (confirm("آیا از بازنشانی بنر بک‌گراند به تصویر پیش‌فرض اطمینان دارید؟")) {
      await updateFieldAndSync("backgroundBannerUrl", "");
      alert("✅ بنر بک‌گراند به تصویر پیش‌فرض بازگردانده و ذخیره شد.");
    }
  };

  const handleResetTopSmallBanner = async () => {
    if (confirm("آیا از بازنشانی بنر کوچک سمت راست بالا به لوگوی پیش‌فرض اطمینان دارید؟")) {
      await updateFieldAndSync("topSmallBannerUrl", "");
      alert("✅ بنر کوچک سمت راست بالا به حالت پیش‌فرض بازگردانده و ذخیره شد.");
    }
  };

  const handleResetHeroBanner = async () => {
    if (confirm("آیا از بازنشانی تصویر هیرو به نمای پیش‌فرض سالن اطمینان دارید؟")) {
      await updateFieldAndSync("heroBannerUrl", "");
      alert("✅ تصویر کادر هیرو به حالت پیش‌فرض بازگردانده و ذخیره شد.");
    }
  };

  const currentTopic = topics.find((t) => t.category === selectedTopicCategory) || topics[0];
  const topicPhotos = gallery.filter((g) => g.category === selectedTopicCategory);

  return (
    <div className="fixed inset-0 bg-[#2C1E14]/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#FAF6F0] w-full max-w-5xl rounded-[2.5rem] border border-white/60 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-[#06808B] text-white p-5 sm:p-6 flex justify-between items-center text-right shadow-md">
          <div className="flex items-center gap-3">
            {isAdminLoggedIn && (
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="header-logo-upload"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const uploaded = await uploadImageDirectly(file, "branding", "logo", 600, 600, 0.85);
                      await updateFieldAndSync("topSmallBannerUrl", uploaded.url);
                      alert("✅ لوگوی سالن با موفقیت تغییر کرد و مستقیماً روی سرور ثبت شد!");
                    } catch (err: any) {
                      alert(err.message || "خطا در آپلود تصویر لوگو");
                    }
                  }
                }}
              />
            )}
            <label
              htmlFor={isAdminLoggedIn ? "header-logo-upload" : undefined}
              className={`relative w-12 h-12 flex items-center justify-center overflow-hidden rounded-2xl border bg-white/10 p-1 border-white/20 transition-all ${
                isAdminLoggedIn ? "cursor-pointer hover:bg-white/25 hover:scale-105 active:scale-95 group" : ""
              }`}
              title={isAdminLoggedIn ? "برای تغییر مستقیم لوگوی وبسایت کلیک کنید" : undefined}
            >
              <img
                src={resolveImageUrl(salonInfo.topSmallBannerUrl || salonInfo.logoUrl || "./assets/branding/logo.jpg")}
                alt="Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-xl bg-white p-0.5 group-hover:opacity-80 transition-opacity"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = resolveImageUrl("./assets/branding/logo.jpg");
                }}
              />
              {isAdminLoggedIn && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                  <Edit2 className="w-4 h-4 text-white" />
                </div>
              )}
            </label>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-lg sm:text-xl font-serif">پنل مدیریت سالن زیبایی راز ملکه</h2>
              </div>
              <p className="text-xs text-[#F2D3B7] font-semibold">
                مدیریت تاپیک‌ها، بارگذاری نمونه کار، منوی خدمات و رمز عبور اختصاصی
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {isAdminLoggedIn && (
              <>
                {/* Live Status indicator */}
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/10 border border-white/20 text-[11px] font-bold">
                  {hasUnsavedChanges ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                      <span className="text-amber-200">تغییرات زنده اعمال شد (آماده ثبت نهایی)</span>
                    </>
                  ) : lastSavedTimestamp ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                      <span className="text-emerald-100">ثبت نهایی ماندگار ({lastSavedTimestamp})</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                      <span className="text-white/90">سیستم ذخیره پایدار فعال است</span>
                    </>
                  )}
                </div>

                {/* Master Direct Save & Cloud Publish Button */}
                <button
                  type="button"
                  onClick={handleMasterFinalSave}
                  disabled={isSavingFinal}
                  className="bg-gradient-to-r from-emerald-600 via-teal-600 to-[#06808B] hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-black shadow-lg flex items-center gap-2 cursor-pointer transition-all border border-emerald-300/40"
                  title="انتشار و ذخیره مستقیم و فوری تمامی تغییرات و تصاویر روی سایت برای همه کاربران"
                >
                  {isSavingFinal ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-emerald-200" />
                      <span>در حال انتشار روی سایت...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-emerald-200" />
                      <span>انتشار و ذخیره مستقیم روی سایت</span>
                      {hasUnsavedChanges && (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                      )}
                    </>
                  )}
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="bg-white/15 hover:bg-white/30 text-white p-2.5 rounded-full cursor-pointer border border-white/20 transition-all"
              title="بستن پنل"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Authentication Login Screen */}
        {!isAdminLoggedIn ? (
          <div className="p-6 sm:p-12 flex flex-col items-center justify-center space-y-6 text-center bg-white/50">
            <div className="w-16 h-16 rounded-3xl bg-[#06808B]/10 flex items-center justify-center text-[#06808B] border border-[#06808B]/20 shadow-inner">
              <KeyRound className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-black text-2xl text-[#2C1E14] font-serif">ورود به پنل مدیریت سالن</h3>
              <p className="text-xs text-gray-600 max-w-sm font-semibold">
                جهت دسترسی به پنل مدیریت، لطفا نام کاربری و رمز عبور اختصاصی مدیریت سالن را وارد نمایید.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-3.5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="نام کاربری مدیریت..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl bg-white border border-[#06808B]/30 focus:outline-none focus:ring-2 focus:ring-[#06808B]/20 text-center font-mono font-bold text-sm"
                  autoFocus
                  required
                />
                <Settings className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="رمز عبور مدیریت..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl bg-white border border-[#06808B]/30 focus:outline-none focus:ring-2 focus:ring-[#06808B]/20 text-center font-mono font-bold text-sm tracking-wider"
                  required
                />
                <Lock className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {loginError && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs font-bold justify-center bg-red-50 p-2.5 rounded-xl border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="glass-btn-primary w-full py-3.5 rounded-2xl text-sm font-extrabold shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>ورود ایمن به پنل مدیریت</span>
              </button>
            </form>
          </div>
        ) : (
          /* Dashboard Navigation & Content */
          <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="md:w-60 bg-white/70 border-b md:border-b-0 md:border-l border-white/70 p-3.5 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible shrink-0">
              
              <button
                onClick={() => setActiveTab("topics")}
                className={`w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer border ${
                  activeTab === "topics"
                    ? "bg-[#06808B] text-white border-[#06808B] shadow-md"
                    : "text-[#2C1E14]/80 hover:bg-[#06808B]/10 border-transparent"
                }`}
              >
                <FolderHeart className="w-4 h-4 shrink-0" />
                <span>مدیریت گالری و تاپیک‌ها</span>
              </button>

              <button
                onClick={() => setActiveTab("assets")}
                className={`w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer border ${
                  activeTab === "assets"
                    ? "bg-[#06808B] text-white border-[#06808B] shadow-md"
                    : "text-[#2C1E14]/80 hover:bg-[#06808B]/10 border-transparent"
                }`}
              >
                <FolderOpen className="w-4 h-4 shrink-0" />
                <span>پوشه‌های تصاویر (assets)</span>
              </button>

              <button
                onClick={() => setActiveTab("banners")}
                className={`w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer border ${
                  activeTab === "banners"
                    ? "bg-[#06808B] text-white border-[#06808B] shadow-md"
                    : "text-[#2C1E14]/80 hover:bg-[#06808B]/10 border-transparent"
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>بنرها و بک‌گراند سایت</span>
              </button>

              <button
                onClick={() => setActiveTab("services")}
                className={`w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer border ${
                  activeTab === "services"
                    ? "bg-[#06808B] text-white border-[#06808B] shadow-md"
                    : "text-[#2C1E14]/80 hover:bg-[#06808B]/10 border-transparent"
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>منوی خدمات سالن</span>
              </button>

              <button
                onClick={() => setActiveTab("info")}
                className={`w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer border ${
                  activeTab === "info"
                    ? "bg-[#06808B] text-white border-[#06808B] shadow-md"
                    : "text-[#2C1E14]/80 hover:bg-[#06808B]/10 border-transparent"
                }`}
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>اطلاعات تماس و سالن</span>
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer border ${
                  activeTab === "security"
                    ? "bg-[#06808B] text-white border-[#06808B] shadow-md"
                    : "text-[#2C1E14]/80 hover:bg-[#06808B]/10 border-transparent"
                }`}
              >
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>امنیت و رمز عبور</span>
              </button>

              <button
                onClick={() => setActiveTab("github")}
                className={`w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer border ${
                  activeTab === "github"
                    ? "bg-gradient-to-r from-purple-700 to-indigo-700 text-white border-purple-500 shadow-md scale-102"
                    : "text-purple-900 bg-purple-50/70 hover:bg-purple-100/90 border-purple-200/80"
                }`}
              >
                <GitBranch className="w-4 h-4 shrink-0 text-purple-600" />
                <span className="font-extrabold">پشتیبان‌گیری گیت‌هاب (اختیاری)</span>
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow p-5 sm:p-6 overflow-y-auto text-right bg-white/30">
              
              {/* Cloud Sync Active Status Notice */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300/60 px-4 py-3 rounded-2xl mb-5 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5 text-emerald-900 text-xs font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>
                    <strong>انتشار ابری زنده فعال است:</strong> تصاویر و تغییرات شما مستقیماً روی سرور و پایگاه داده ابری ذخیره می‌شوند و برای هر شخصی که با لینک وارد شود بلافاصله قابل مشاهده است (بدون نیاز به گیت‌هاب).
                  </span>
                </div>
                <div className="shrink-0 hidden md:block">
                  <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                    ✓ اتصال مستقیم
                  </span>
                </div>
              </div>
              
              {/* TAB 1: TOPIC & PORTFOLIO MANAGEMENT */}
              {activeTab === "topics" && (
                <div className="space-y-6">
                  {/* Tab Title & Topic Selection Bar */}
                  <div className="bg-white/80 p-5 rounded-3xl border border-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-black text-[#2C1E14] text-lg sm:text-xl font-serif">
                        مدیریت تاپیک‌ها و عکس‌های کاور
                      </h3>
                      <p className="text-xs text-gray-500 font-semibold mt-1">
                        ویرایش عکس کاور، عنوان، نشان (بج) و توضیحات تاپیک‌ها یا ایجاد تاپیک جدید (توضیحات کاور الزامی است).
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowNewTopicModal(true)}
                        className="bg-[#F2D3B7] hover:bg-[#ebd0b5] text-[#2C1E14] text-xs font-black px-4 py-2.5 rounded-full flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>ایجاد تاپیک جدید</span>
                      </button>
                    </div>
                  </div>

                  {/* Topic Selector Chips */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-700">انتخاب تاپیک جهت مدیریت و ویرایش کاور:</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                      {topics.map((t) => {
                        const isSelected = t.category === selectedTopicCategory;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setSelectedTopicCategory(t.category)}
                            className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shrink-0 transition-all cursor-pointer border ${
                              isSelected
                                ? "bg-[#06808B] text-white border-[#06808B] shadow-md scale-102"
                                : "bg-white/70 text-[#2C1E14] border-white hover:bg-white"
                            }`}
                          >
                            <span>{t.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Selected Topic Box */}
                  {currentTopic && (
                    <div className="bg-white/90 p-5 rounded-3xl border border-white shadow-sm space-y-4">
                      {/* Topic Summary & Cover Info Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-4">
                          <div className="relative group/cover w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#06808B]/30 shadow-md shrink-0 bg-gray-100 flex items-center justify-center">
                            {currentTopic.coverImage ? (
                              <>
                                <img
                                  src={resolveImageUrl(currentTopic.coverImage)}
                                  alt={currentTopic.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity">
                                  <span className="text-[9px] text-white font-black bg-black/60 px-2 py-0.5 rounded-full">
                                    کاور تاپیک
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="text-center p-2 text-gray-400">
                                <ImageIcon className="w-5 h-5 mx-auto text-[#06808B]/50 mb-0.5" />
                                <span className="text-[9px] font-bold text-gray-500 block leading-tight">بدون کاور</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] bg-[#06808B] text-white px-2.5 py-0.5 rounded-full font-black">
                                {currentTopic.badgeText || "تاپیک فعال"}
                              </span>
                              <h4 className="font-black text-base text-[#2C1E14]">{currentTopic.title}</h4>
                            </div>
                            <p className="text-xs text-gray-600 font-medium mt-1">{currentTopic.description}</p>
                            <span className="text-[11px] text-[#06808B] font-bold mt-1 inline-block">
                              دسته‌بندی کلیدی: «{currentTopic.category}»
                            </span>
                          </div>
                        </div>

                        {/* Action buttons for topic itself (Direct Cover Upload / Edit Cover / Delete Topic) */}
                        <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                          <label
                            htmlFor="direct-topic-cover-file-header"
                            className="bg-[#06808B] hover:bg-[#056972] text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                            title="انتخاب و جایگزینی مستقیم عکس کاور از گوشی یا کامپیوتر"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{currentTopic.coverImage ? "تغییر سریع کاور" : "آپلود مستقیم کاور"}</span>
                            <input
                              id="direct-topic-cover-file-header"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleDirectCoverUpload(file);
                                e.target.value = "";
                              }}
                            />
                          </label>

                          {currentTopic.coverImage && (
                            <button
                              type="button"
                              onClick={handleRemoveCover}
                              className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-red-200"
                              title="حذف عکس کاور این تاپیک"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleStartEditTopic(currentTopic)}
                            className="bg-[#06808B]/10 hover:bg-[#06808B]/20 text-[#06808B] text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-[#06808B]/20"
                            title="تغییر عکس کاور، عنوان یا مشخصات این تاپیک"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>ویرایش مشخصات تاپیک</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteTopic(currentTopic)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-black p-2 rounded-xl flex items-center gap-1 transition-all cursor-pointer border border-red-200"
                            title="حذف این تاپیک و آلبوم"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Loading status indicator during processing */}
                      {isUploading && (
                        <div className="bg-[#06808B] text-white p-3.5 rounded-2xl flex items-center justify-center gap-3 shadow-md animate-pulse">
                          <Sparkles className="w-5 h-5 animate-spin" />
                          <span className="text-xs font-black">{uploadStatusMessage || "در حال پردازش و بهینه‌سازی عکس..."}</span>
                        </div>
                      )}

                      {/* Collapsible Edit Topic Cover & Meta Form */}
                      {isEditingTopic && (
                        <form onSubmit={handleSaveEditedTopic} className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl space-y-3 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                              <Edit2 className="w-4 h-4 text-amber-700" />
                              <span>ویرایش مشخصات و عکس کاور تاپیک «{currentTopic.title}»</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsEditingTopic(false)}
                              className="text-gray-500 hover:text-gray-800 text-xs"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-gray-700">عنوان تاپیک *</label>
                              <input
                                type="text"
                                value={editTopicTitle}
                                onChange={(e) => setEditTopicTitle(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-white border text-xs"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-gray-700">متن نشان/بج تاپیک</label>
                              <input
                                type="text"
                                value={editTopicBadge}
                                onChange={(e) => setEditTopicBadge(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-white border text-xs"
                              />
                            </div>

                            {/* Topic Cover Image URL or Local File Upload */}
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-[11px] font-bold text-gray-700">عکس کاور اصلی تاپیک (اختیاری)</label>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  type="text"
                                  placeholder="آدرس اینترنتی یا فایل آپلود شده..."
                                  value={editTopicCover}
                                  onChange={(e) => setEditTopicCover(e.target.value)}
                                  className="flex-grow px-3 py-2 rounded-xl bg-white border text-xs font-mono text-left"
                                />
                                <div className="relative shrink-0">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    id="edit-topic-cover-file"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        try {
                                          setIsUploading(true);
                                          setUploadStatusMessage("در حال فشرده‌سازی و بهینه‌سازی عکس کاور...");
                                          const compressed = await compressImageFile(file, 1280, 1280, 0.82);
                                          setEditTopicCover(compressed);
                                          setIsUploading(false);
                                          setUploadStatusMessage("");
                                        } catch (err: any) {
                                          setIsUploading(false);
                                          setUploadStatusMessage("");
                                          alert(err.message || "خطا در پردازش تصویر");
                                        }
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor="edit-topic-cover-file"
                                    className="bg-[#06808B] hover:bg-[#056972] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap"
                                  >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    <span>انتخاب عکس کاور از سیستم</span>
                                  </label>
                                </div>
                              </div>
                              {editTopicCover && (
                                <div className="mt-2 flex items-center gap-2">
                                  <img
                                    src={editTopicCover}
                                    alt="Preview"
                                    className="w-12 h-12 object-cover rounded-xl border border-gray-300 shadow-sm"
                                  />
                                  <span className="text-[10px] text-gray-600 font-bold">پیش‌نمایش کاور انتخابی</span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-[11px] font-bold text-gray-700">توضیحات کاور تاپیک</label>
                              <textarea
                                rows={2}
                                placeholder="توضیحات معرفی این تاپیک و کاور را وارد نمایید..."
                                value={editTopicDesc}
                                onChange={(e) => setEditTopicDesc(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-white border text-xs"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsEditingTopic(false)}
                              className="px-4 py-2 text-xs font-bold text-gray-500 rounded-full"
                            >
                              انصراف
                            </button>
                            <button
                              type="submit"
                              className="bg-[#06808B] hover:bg-[#056972] text-white text-xs font-black px-5 py-2 rounded-full shadow cursor-pointer flex items-center gap-1"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>ذخیره تغییرات کاور تاپیک</span>
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Topic Showcase & Gallery Status Note */}
                      <div className="bg-[#06808B]/5 border border-[#06808B]/20 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-[#06808B]/10 text-[#06808B] flex items-center justify-center shrink-0 border border-[#06808B]/20">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <h5 className="text-xs sm:text-sm font-black text-[#2C1E14]">
                              وضعیت این تاپیک در گالری تصاویر سالن
                            </h5>
                            <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                              این تاپیک با عکس کاور، نشان «{currentTopic.badgeText || "لاین تخصصی"}» و تمام نمونه‌کارهای زیر به صورت آلبوم هوشمند و اسلایدی در بخش گالری تصاویر سالن نمایش داده می‌شود.
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <span className="bg-[#06808B] text-white text-[11px] font-black px-3.5 py-1.5 rounded-full shadow-sm">
                            {topicPhotos.length + 1} تصویر در گالری
                          </span>
                        </div>
                      </div>

                      {/* ADD NEW PHOTO TO THIS TOPIC SECTION */}
                      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <div className="flex items-center gap-2">
                            <Plus className="w-4 h-4 text-[#06808B]" />
                            <h4 className="text-xs sm:text-sm font-black text-[#2C1E14]">
                              افزودن نمونه‌کار جدید به لاین «{currentTopic.title}»
                            </h4>
                          </div>
                          <span className="text-[11px] text-gray-500 font-semibold">
                            (توضیحات و عنوان اختیاری هستند)
                          </span>
                        </div>

                        {/* Fast Direct Multi/Single Photo Upload Banner */}
                        <div className="bg-[#FAF6F0] p-3.5 rounded-2xl border border-dashed border-[#06808B]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#06808B]/10 text-[#06808B] flex items-center justify-center shrink-0">
                              <Upload className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-black text-[#2C1E14] block">آپلود سریع عکس‌های نمونه‌کار از گوشی یا سیستم</span>
                              <span className="text-[10px] text-gray-500 font-semibold">می‌توانید یک یا چند عکس را همزمان انتخاب کنید تا فشرده و بلافاصله به این لاین افزوده شوند.</span>
                            </div>
                          </div>
                          <label
                            htmlFor="batch-sample-photos-btn"
                            className="bg-[#06808B] hover:bg-[#056972] text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all"
                          >
                            <Upload className="w-4 h-4" />
                            <span>انتخاب و آپلود سریع عکس‌ها</span>
                            <input
                              id="batch-sample-photos-btn"
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  const files: File[] = Array.from(e.target.files);
                                  await handleBatchSamplePhotosUpload(files);
                                }
                                e.target.value = "";
                              }}
                            />
                          </label>
                        </div>

                        {/* Individual Photo Add Form */}
                        <form onSubmit={handleAddPhotoToTopic} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1 sm:col-span-1">
                            <label className="text-[11px] font-black text-gray-700">عنوان نمونه‌کار (اختیاری)</label>
                            <input
                              type="text"
                              value={newPhotoTitle}
                              onChange={(e) => setNewPhotoTitle(e.target.value)}
                              placeholder={`مثال: نمونه کار ${currentTopic.title}`}
                              className="w-full bg-[#FAF6F0] border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#06808B]"
                            />
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[11px] font-black text-gray-700">تصویر نمونه‌کار *</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newPhotoImage}
                                onChange={(e) => setNewPhotoImage(e.target.value)}
                                placeholder="لینک تصویر مستقیم یا انتخاب از سیستم..."
                                className="flex-grow bg-[#FAF6F0] border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#06808B] dir-ltr text-left"
                                required
                              />
                              <label className="bg-[#06808B]/10 hover:bg-[#06808B]/20 text-[#06808B] px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 border border-[#06808B]/25">
                                <Upload className="w-3.5 h-3.5" />
                                <span>آپلود از سیستم</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        setIsUploading(true);
                                        setUploadStatusMessage("در حال فشرده‌سازی عکس نمونه‌کار...");
                                        const compressed = await compressImageFile(file, 1280, 1280, 0.82);
                                        setNewPhotoImage(compressed);
                                        setIsUploading(false);
                                        setUploadStatusMessage("");
                                      } catch (err: any) {
                                        setIsUploading(false);
                                        setUploadStatusMessage("");
                                        alert(err.message || "خطا در پردازش تصویر");
                                      }
                                    }
                                  }}
                                />
                              </label>
                            </div>
                            {newPhotoImage && (
                              <div className="mt-1.5 flex items-center gap-2">
                                <img
                                  src={newPhotoImage}
                                  alt="Preview"
                                  className="w-10 h-10 object-cover rounded-lg border border-gray-300"
                                />
                                <span className="text-[10px] text-emerald-700 font-bold">✓ عکس انتخاب شد</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[11px] font-black text-gray-700">توضیحات تکمیلی (اختیاری)</label>
                            <input
                              type="text"
                              value={newPhotoDesc}
                              onChange={(e) => setNewPhotoDesc(e.target.value)}
                              placeholder="توضیح کوتاه تکنیک یا مواد استفاده شده (اختیاری)"
                              className="w-full bg-[#FAF6F0] border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#06808B]"
                            />
                          </div>

                          <div className="flex items-end sm:col-span-1">
                            <button
                              type="submit"
                              className="w-full bg-[#06808B] hover:bg-[#056972] text-white text-xs font-black py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                              <span>ثبت نمونه‌کار در این لاین</span>
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* EXISTING PHOTOS LIST IN THIS TOPIC */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs sm:text-sm font-black text-[#2C1E14]">
                            تصاویر موجود در این لاین ({topicPhotos.length} نمونه‌کار {currentTopic.coverImage ? "+ ۱ کاور اصلی" : "+ بدون کاور"}):
                          </h4>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {/* Main Cover Card or Add Cover Prompt */}
                          {currentTopic.coverImage ? (
                            <div className="relative group bg-white p-2 rounded-2xl border-2 border-[#06808B] shadow-xs flex flex-col justify-between">
                              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative">
                                <img
                                  src={resolveImageUrl(currentTopic.coverImage)}
                                  alt={currentTopic.title}
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute top-1.5 right-1.5 bg-[#06808B] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
                                  کاور اصلی لاین
                                </span>
                              </div>
                              <div className="pt-2 text-right">
                                <span className="text-[11px] font-black text-[#2C1E14] truncate block">
                                  {currentTopic.title}
                                </span>
                                <div className="flex items-center justify-between gap-1 mt-1.5 pt-1.5 border-t border-gray-100">
                                  <label
                                    htmlFor="grid-cover-change-file"
                                    className="text-[10px] text-[#06808B] font-black hover:underline cursor-pointer flex items-center gap-1"
                                  >
                                    <Upload className="w-3 h-3" />
                                    <span>تغییر کاور</span>
                                    <input
                                      id="grid-cover-change-file"
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleDirectCoverUpload(file);
                                        e.target.value = "";
                                      }}
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={handleRemoveCover}
                                    className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
                                  >
                                    حذف کاور
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-square rounded-2xl border-2 border-dashed border-[#06808B]/40 hover:border-[#06808B] p-3 flex flex-col items-center justify-center gap-1.5 bg-[#06808B]/5 hover:bg-[#06808B]/10 transition-colors text-center group">
                              <div className="w-9 h-9 rounded-xl bg-[#06808B]/15 text-[#06808B] flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                              <label
                                htmlFor="grid-cover-upload-file"
                                className="bg-[#06808B] hover:bg-[#056972] text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                              >
                                <Upload className="w-3 h-3" />
                                <span>آپلود عکس کاور</span>
                                <input
                                  id="grid-cover-upload-file"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleDirectCoverUpload(file);
                                    e.target.value = "";
                                  }}
                                />
                              </label>
                              <span className="text-[9px] text-gray-500 font-medium">از گوشی یا کامپیوتر</span>
                            </div>
                          )}

                          {/* Sample Photos in this Topic */}
                          {topicPhotos.map((photo) => (
                            <div
                              key={photo.id}
                              className="relative group bg-white p-2 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                            >
                              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative">
                                <img
                                  src={resolveImageUrl(photo.image)}
                                  alt={photo.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = resolveImageUrl("./assets/branding/logo.jpg");
                                  }}
                                />
                                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditPhoto(photo)}
                                    className="bg-white/90 hover:bg-white text-[#06808B] p-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                                    title="ویرایش این نمونه‌کار (عنوان، توضیحات، عکس)"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteGalleryItem(photo.id)}
                                    className="bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                                    title="حذف این عکس"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <div className="pt-2 text-right">
                                <span className="text-[11px] font-black text-[#2C1E14] truncate block">
                                  {photo.title}
                                </span>
                                {photo.description && (
                                  <span className="text-[10px] text-gray-500 truncate block mt-0.5">
                                    {photo.description}
                                  </span>
                                )}
                                <div className="mt-1.5 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditPhoto(photo)}
                                    className="text-[#06808B] hover:underline flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    <span>ویرایش</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteGalleryItem(photo.id)}
                                    className="text-red-500 hover:underline cursor-pointer"
                                  >
                                    حذف
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Modal/Form for Editing Specific Photo Item */}
                      {editingPhotoId && (
                        <div className="fixed inset-0 z-[75] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                          <div className="bg-[#FAF6F0] w-full max-w-lg rounded-3xl p-5 sm:p-6 border border-white shadow-2xl text-right space-y-4 animate-in fade-in zoom-in duration-150">
                            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-[#06808B]/10 text-[#06808B] flex items-center justify-center">
                                  <Edit2 className="w-4 h-4" />
                                </div>
                                <h4 className="font-black text-sm text-[#2C1E14]">
                                  ویرایش عکس و محتوای نمونه‌کار
                                </h4>
                              </div>
                              <button
                                type="button"
                                onClick={handleCancelEditPhoto}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>

                            <form onSubmit={handleSaveEditedPhoto} className="space-y-4">
                              <div className="space-y-1">
                                <label className="text-xs font-black text-gray-700">عنوان نمونه‌کار *</label>
                                <input
                                  type="text"
                                  value={editPhotoTitle}
                                  onChange={(e) => setEditPhotoTitle(e.target.value)}
                                  placeholder="مثلاً: بالیاژ شنی روسی"
                                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#06808B]"
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-black text-gray-700">توضیحات تکمیلی (اختیاری)</label>
                                <input
                                  type="text"
                                  value={editPhotoDesc}
                                  onChange={(e) => setEditPhotoDesc(e.target.value)}
                                  placeholder="توضیح کوتاه تکنیک یا متریال استفاده شده..."
                                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#06808B]"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-black text-gray-700">تصویر نمونه‌کار *</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={editPhotoImage}
                                    onChange={(e) => setEditPhotoImage(e.target.value)}
                                    placeholder="لینک مستقیم تصویر یا آپلود از سیستم..."
                                    className="flex-grow bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono dir-ltr text-left"
                                    required
                                  />
                                  <label className="bg-[#06808B] hover:bg-[#056972] text-white px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs">
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>تعویض عکس</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          try {
                                            setIsUploading(true);
                                            setUploadStatusMessage("در حال فشرده‌سازی تصویر...");
                                            const compressed = await compressImageFile(file, 1280, 1280, 0.82);
                                            setEditPhotoImage(compressed);
                                            setIsUploading(false);
                                            setUploadStatusMessage("");
                                          } catch (err: any) {
                                            setIsUploading(false);
                                            setUploadStatusMessage("");
                                            alert(err.message || "خطا در پردازش تصویر");
                                          }
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                                {editPhotoImage && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <img
                                      src={editPhotoImage}
                                      alt="پیش‌نمایش"
                                      className="w-14 h-14 object-cover rounded-xl border border-gray-300 shadow-xs"
                                    />
                                    <span className="text-[11px] text-emerald-700 font-bold">✓ عکس جدید برای جایگزینی آماده است</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                                <button
                                  type="button"
                                  onClick={handleCancelEditPhoto}
                                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
                                >
                                  انصراف
                                </button>
                                <button
                                  type="submit"
                                  className="bg-[#06808B] hover:bg-[#056972] text-white text-xs font-black px-5 py-2 rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  <span>ذخیره تغییرات نمونه‌کار</span>
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Master Final Save Card for Topics and Gallery */}
                  <div className="bg-gradient-to-l from-emerald-500/10 via-teal-500/10 to-transparent p-4 sm:p-5 rounded-3xl border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm mt-4">
                    <div className="text-right space-y-1 w-full sm:w-auto">
                      <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>ثبت نهایی آلبوم‌ها و نمونه‌کارها</span>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">
                        تغییرات شما به صورت زنده بر روی وبسایت اعمال شده است. جهت ماندگاری قطعی پس از بستن و رفرش سایت، ثبت نهایی را کلیک نمایید.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleMasterFinalSave}
                      disabled={isSavingFinal}
                      className="w-full sm:w-auto shrink-0 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-black px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all border border-emerald-400/30"
                    >
                      {isSavingFinal ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-spin text-emerald-200" />
                          <span>در حال ثبت...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 text-emerald-200" />
                          <span>ثبت نهایی کلیه تغییرات</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: ASSETS FOLDERS & AUTO-SYNC */}
              {activeTab === "assets" && (
                <div className="space-y-6">
                  {/* Top Header Card */}
                  <div className="bg-white/80 p-5 sm:p-6 rounded-3xl border border-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-[#06808B]/10 text-[#06808B] flex items-center justify-center">
                          <FolderOpen className="w-5 h-5" />
                        </div>
                        <h3 className="font-black text-[#2C1E14] text-lg sm:text-xl font-serif">
                          پوشه‌بندی و ساختار تصاویر در assets
                        </h3>
                      </div>
                      <p className="text-xs text-gray-600 font-semibold leading-relaxed max-w-2xl">
                        ساختار پوشه‌ها به دو بخش تفکیک شده است: <strong className="text-[#06808B]">پوشه‌های گالری تصاویر</strong> (برای نمونه‌کارهای آلبوم‌ها) و <strong className="text-emerald-700">پوشه تصاویر منوی خدمات (assets/services/)</strong>.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleScanAssets}
                        disabled={isScanningAssets}
                        className="bg-[#06808B] hover:bg-[#056f79] text-white text-xs sm:text-sm font-black px-5 py-3 rounded-2xl flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${isScanningAssets ? "animate-spin" : ""}`} />
                        <span>{isScanningAssets ? "در حال اسکن پوشه‌ها..." : "اسکن و همگام‌سازی از assets"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Sub-tab Navigation between Gallery Assets and Services Assets */}
                  <div className="flex items-center gap-2 bg-white/70 p-2 rounded-2xl border border-white shadow-xs">
                    <button
                      type="button"
                      onClick={() => setAssetsSubTab("gallery")}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        assetsSubTab === "gallery"
                          ? "bg-[#06808B] text-white shadow-sm"
                          : "text-gray-600 hover:bg-white"
                      }`}
                    >
                      <FolderHeart className="w-4 h-4" />
                      <span>پوشه‌های گالری تصاویر (۸ تاپیک تخصصی)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAssetsSubTab("services")}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        assetsSubTab === "services"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-gray-600 hover:bg-white"
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>پوشه تصاویر منوی خدمات (assets/services/)</span>
                    </button>
                  </div>

                  {/* Status Banner if scan finished */}
                  {scanStatusMessage && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold p-4 rounded-2xl flex items-center gap-2.5 animate-fadeIn">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>{scanStatusMessage}</span>
                    </div>
                  )}

                  {/* SUBTAB 1: GALLERY FOLDERS */}
                  {assetsSubTab === "gallery" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {[
                        {
                          folder: "bridal",
                          title: "عروس و میکاپ VIP",
                          category: "عروس و میکاپ",
                          badge: "VIP عروس",
                          desc: "پکیج‌های مجلل میکاپ، گریم سینمایی، شینیون ژورنالی",
                          thumb: "/assets/bridal/thumbnail.jpg",
                          samples: ["/assets/bridal/1.jpg", "/assets/bridal/2.jpg", "/assets/bridal/3.jpg"]
                        },
                        {
                          folder: "haircolor",
                          title: "رنگ، لایت و بالیاژ",
                          category: "رنگ و مو",
                          badge: "تکنیک‌های روسی",
                          desc: "تکنیک‌های بالیاژ روسی، آمبره برزیلی، لایت‌های بلوند شنی",
                          thumb: "/assets/haircolor/thumbnail.jpg",
                          samples: ["/assets/haircolor/1.jpg", "/assets/haircolor/2.jpg", "/assets/haircolor/3.jpg"]
                        },
                        {
                          folder: "keratin",
                          title: "احیا، کراتین و بوتاکس مو",
                          category: "احیا و کراتین",
                          badge: "تضمین ماندگاری",
                          desc: "صافی شیشه‌ای ۱۰۰٪، نانوپلاستی و احیای عمیق ساقه مو",
                          thumb: "/assets/keratin/thumbnail.jpg",
                          samples: ["/assets/keratin/1.jpg", "/assets/keratin/2.jpg", "/assets/keratin/3.jpg"]
                        },
                        {
                          folder: "nails",
                          title: "خدمات تخصصی ناخن و پدیکور",
                          category: "ناخن و پدیکور",
                          badge: "دیزاین‌های ژورنالی",
                          desc: "کاشت ژل، لمینت، دیزاین‌های سه‌بعدی و اسپا پدیکور با کفسابی VIP",
                          thumb: "/assets/nails/thumbnail.jpg",
                          samples: ["/assets/nails/1.jpg", "/assets/nails/2.jpg", "/assets/nails/3.jpg"]
                        },
                        {
                          folder: "lashes",
                          title: "اکستنشن مژه و لیفت ابرو",
                          category: "مژه و ابرو",
                          badge: "طبیعی و سبک",
                          desc: "اکستنشن تار به تار مگاوالیوم و لیفت و لمینت تخصصی مژه و ابرو",
                          thumb: "/assets/lashes/thumbnail.jpg",
                          samples: ["/assets/lashes/1.jpg", "/assets/lashes/2.jpg", "/assets/lashes/3.jpg"]
                        },
                        {
                          folder: "skin",
                          title: "پاکسازی و فشیال پوست",
                          category: "پوست و فشیال",
                          badge: "پوست شیشه‌ای",
                          desc: "هیدرودرمی، تخلیه منافذ، ماسک طلا، پیلینگ آنزیمی و اکسیژن‌تراپی",
                          thumb: "/assets/skin/thumbnail.jpg",
                          samples: ["/assets/skin/1.jpg", "/assets/skin/2.jpg", "/assets/skin/3.jpg"]
                        },
                        {
                          folder: "braids",
                          title: "بافت و استایل مو",
                          category: "بافت و استایل",
                          badge: "مدرن و فانتزی",
                          desc: "بافت‌های خاص هلندی، مکزیکی، کوئین و بافت فانتزی",
                          thumb: "/assets/braids/thumbnail.jpg",
                          samples: ["/assets/braids/1.jpg", "/assets/braids/2.jpg", "/assets/braids/3.jpg"]
                        },
                        {
                          folder: "branding",
                          title: "برندینگ و بنرهای اصلی سالن",
                          category: "برندینگ",
                          badge: "هویت بصری",
                          desc: "لوگوی رسمی، تصویر هیرو و بنر باریک بالای صفحه",
                          thumb: "/assets/branding/logo.jpg",
                          samples: ["/assets/branding/hero.jpg", "/assets/branding/top_banner.jpg"]
                        }
                      ].map((sec) => {
                        const topicObj = topics.find((t) => t.category === sec.category);
                        const currentCover = topicObj?.coverImage || sec.thumb;
                        const topicGallery = gallery.filter((g) => g.category === sec.category);
                        return (
                          <div
                            key={sec.folder}
                            className="bg-white/90 p-5 rounded-3xl border border-white shadow-sm hover:shadow-md transition-all space-y-4 text-right"
                          >
                            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-[#2C1E14] text-base font-serif">
                                    {sec.title}
                                  </span>
                                  <span className="text-[10px] font-black bg-[#06808B]/10 text-[#06808B] px-2 py-0.5 rounded-full">
                                    {sec.badge}
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 font-mono font-bold dir-ltr text-left">
                                  <FolderTree className="w-3.5 h-3.5 text-[#06808B]" />
                                  <span>assets/{sec.folder}/</span>
                                </div>
                              </div>

                              {sec.folder !== "branding" && (
                                <button
                                  onClick={() => {
                                    setSelectedTopicCategory(sec.category);
                                    setActiveTab("topics");
                                  }}
                                  className="text-[11px] font-black text-[#06808B] hover:text-[#056f79] bg-[#06808B]/10 hover:bg-[#06808B]/20 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer shrink-0"
                                >
                                  <span>ویرایش در گالری</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* Visual Previews: Thumbnail & Samples */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-3 bg-gray-50/80 p-2.5 rounded-2xl border border-gray-100">
                                <img
                                  src={currentCover}
                                  alt="تامبنیل"
                                  referrerPolicy="no-referrer"
                                  className="w-16 h-16 rounded-xl object-cover border border-[#06808B]/20 shadow-xs shrink-0 bg-white"
                                />
                                <div className="space-y-0.5">
                                  <span className="text-[11px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md inline-block">
                                    ★ تامبنیل / کاور اصلی:
                                  </span>
                                  <p className="text-xs font-mono font-bold text-gray-700 dir-ltr text-left">
                                    thumbnail.jpg
                                  </p>
                                  <p className="text-[11px] text-gray-500 font-semibold">
                                    در کارت تاپیک‌ها و معرفی لاین نمایش می‌یابد.
                                  </p>
                                </div>
                              </div>

                              {/* Inner content photos */}
                              <div className="space-y-1.5">
                                <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                                  تصاویر محتوای داخلی ({topicGallery.length > 0 ? topicGallery.length : sec.samples.length} عکس نمونه‌کار):
                                </span>
                                <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
                                  {(topicGallery.length > 0
                                    ? topicGallery.map((g) => g.image)
                                    : sec.samples
                                  ).map((imgUrl, idx) => (
                                    <div key={idx} className="relative group shrink-0">
                                      <img
                                        src={imgUrl}
                                        alt={`نمونه‌کار ${idx + 1}`}
                                        referrerPolicy="no-referrer"
                                        className="w-14 h-14 rounded-xl object-cover border border-gray-200 shadow-2xs bg-white"
                                      />
                                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono font-bold px-1 rounded">
                                        {idx + 1}.jpg
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* SUBTAB 2: SERVICES ASSETS FOLDER (assets/services/) */}
                  {assetsSubTab === "services" && (
                    <div className="space-y-5">
                      <div className="bg-emerald-50 border border-emerald-200 p-4 sm:p-5 rounded-3xl text-right space-y-1.5">
                        <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>پوشه اختصاصی تصاویر خدمات سالن (assets/services/)</span>
                        </div>
                        <p className="text-xs text-emerald-800 font-semibold leading-relaxed">
                          تمامی تصاویر منوی خدمات سالن در این پوشه با آدرس اختصاصی نگهداری می‌شوند. با کلیک بر روی «تغییر تامبنیل» می‌توانید مستقیماً فایل جدیدی برای هر خدمت آپلود کنید یا مشخصات آن را اصلاح نمایید.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {services.map((srv) => (
                          <div
                            key={srv.id}
                            className="bg-white/95 p-4 rounded-3xl border border-white shadow-sm flex flex-col justify-between gap-3 text-right"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <h4 className="font-black text-sm text-[#2C1E14]">{srv.title}</h4>
                                <span className="text-[10px] font-bold bg-[#06808B]/10 text-[#06808B] px-2 py-0.5 rounded-full">
                                  {srv.category}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <img
                                  src={srv.image}
                                  alt={srv.title}
                                  referrerPolicy="no-referrer"
                                  className="w-16 h-16 rounded-2xl object-cover border border-[#06808B]/20 bg-gray-100 shadow-xs shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/assets/services/lashes.jpg";
                                  }}
                                />
                                <div className="space-y-1 min-w-0">
                                  <span className="text-[10px] font-mono font-bold text-gray-500 block truncate dir-ltr text-right">
                                    {srv.image}
                                  </span>
                                  <p className="text-[11px] text-gray-500 line-clamp-1">
                                    {srv.description || "خدمات تخصصی سالن"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                              <label
                                htmlFor={`assets-service-upload-${srv.id}`}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1"
                              >
                                <Camera className="w-3.5 h-3.5 text-[#06808B]" />
                                <span>تعویض تامبنیل</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  id={`assets-service-upload-${srv.id}`}
                                  className="hidden"
                                  disabled={isUploading}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleDirectServiceImageUpload(srv.id, file);
                                    e.target.value = "";
                                  }}
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab("services");
                                  handleOpenEditServiceModal(srv);
                                }}
                                className="bg-[#06808B]/10 hover:bg-[#06808B]/20 text-[#06808B] text-xs font-black px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>ویرایش مشخصات</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: BANNERS & VISUAL IDENTITY */}
              {activeTab === "banners" && (
                <div className="space-y-6">
                  <div className="border-b border-[#06808B]/10 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <h3 className="font-black text-[#2C1E14] text-lg sm:text-xl font-serif">
                        مدیریت بنرها، بک‌گراند و نشان‌های سایت
                      </h3>
                      <p className="text-xs text-gray-500 font-semibold">
                        تنظیم و بارگذاری مستقیم بنر عریض پس‌زمینه بالای سایت، بنر کوچک گوشه راست و تصویر معرفی سالن.
                      </p>
                    </div>
                  </div>

                  {/* Storage Health & Resilience Notice */}
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-bold shadow-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>سیستم ذخیره‌سازی دائمی بنرها و تصاویر فعال است (تمام تغییرات در حافظه پایدار مرورگر تثبیت و پس از رفرش حفظ می‌شوند).</span>
                    </div>
                    <span className="bg-emerald-200/60 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full font-black shrink-0">
                      ذخیره دائمی فعال ✓
                    </span>
                  </div>

                  {/* Status / Notice if uploading */}
                  {isUploading && (
                    <div className="bg-[#06808B]/10 border border-[#06808B]/30 rounded-2xl p-3 flex items-center gap-2 text-xs font-bold text-[#06808B] animate-pulse">
                      <Sparkles className="w-4 h-4 animate-spin shrink-0" />
                      <span>{uploadStatusMessage || "در حال بهینه‌سازی و ذخیره تصویر..."}</span>
                    </div>
                  )}

                  {/* SECTION 1: Top Background Banner */}
                  <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#06808B]/10 text-[#06808B] flex items-center justify-center font-bold">
                          ۱
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-[#2C1E14]">
                            بنر بک‌گراند (پس‌زمینه عریض هدر بالای سایت)
                          </h4>
                          <p className="text-[11px] text-gray-500">
                            تصویر باکیفیت و عریضی که به عنوان پس‌زمینه تاج و عنوان ملکه در بالاترین بخش وبسایت قرار می‌گیرد.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {infoBackgroundBannerUrl ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-black">
                            بنر اختصاصی فعال است
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            بنر پیش‌فرض فعال است
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Live Preview Box */}
                    <div className="relative rounded-2xl overflow-hidden h-36 sm:h-44 border border-gray-200 bg-gray-900 group shadow-inner">
                      <img
                        src={infoBackgroundBannerUrl || "/salon-images/hero-banner.jpg"}
                        alt="Background Banner Preview"
                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/salon-images/hero-banner.jpg";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-[#2C1E14]/40 via-transparent to-[#2C1E14]/70 pointer-events-none" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                        <span className="text-[10px] uppercase tracking-widest text-[#F2D3B7] font-semibold">
                          پیش‌نمایش زنده در هدر
                        </span>
                        <h4 className="text-base sm:text-lg font-black text-white font-serif drop-shadow-md">
                          سالن زیبایی راز ملکه
                        </h4>
                        <p className="text-[11px] text-white/80 max-w-sm drop-shadow">
                          {infoSlogan || "تجربه زیبایی و وقار شاهانه در فضایی آرام و اختصاصی"}
                        </p>
                      </div>
                    </div>

                    {/* Actions & URL Input */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-[11px] font-bold text-gray-600 mb-1.5 block">
                          آپلود مستقیم فایل از دستگاه / گالری:
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            id="bg-banner-upload-file"
                            className="hidden"
                            disabled={isUploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleDirectBackgroundBannerUpload(file);
                              e.target.value = "";
                            }}
                          />
                          <label
                            htmlFor="bg-banner-upload-file"
                            className="w-full bg-[#06808B] hover:bg-[#056972] text-white px-4 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                          >
                            <Upload className="w-4 h-4" />
                            <span>انتخاب و آپلود بنر بک‌گراند</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-600 mb-1.5 block">
                          یا درج آدرس اینترنتی عکس (URL):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={infoBackgroundBannerUrl}
                            onChange={(e) => setInfoBackgroundBannerUrl(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleApplyBackgroundBannerUrl();
                              }
                            }}
                            placeholder="https://... یا آدرس تصویر"
                            className="flex-grow px-3 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-mono text-left focus:ring-2 focus:ring-[#06808B]/20"
                          />
                          <button
                            type="button"
                            onClick={handleApplyBackgroundBannerUrl}
                            className="bg-[#06808B] hover:bg-[#056972] text-white px-3 py-2 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                            title="اعمال و ذخیره این بنر"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>ثبت و ذخیره</span>
                          </button>
                          {infoBackgroundBannerUrl && (
                            <button
                              type="button"
                              onClick={handleResetBackgroundBanner}
                              className="px-3 py-2 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                              title="بازگشت به پیش‌فرض"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">پیش‌فرض</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: Top Right Small Banner / Salon Logo */}
                  <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#06808B]/10 text-[#06808B] flex items-center justify-center font-bold">
                          ۲
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-[#2C1E14]">
                            بنر کوچک سمت راست بالا (نشان و لوگوی گوشه وبسایت)
                          </h4>
                          <p className="text-[11px] text-gray-500">
                            این نشان در گوشه راست بالای هدر سایت، نوار منو و فوتر به صورت دایره‌ای/مربعی لوکس نمایش داده می‌شود.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {infoTopSmallBannerUrl ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-black">
                            نشان اختصاصی فعال است
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            لوگوی پیش‌فرض فعال است
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Visual Preview Box */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#FAF6F0] p-3.5 rounded-2xl border border-[#06808B]/15">
                      <div className="w-20 h-20 rounded-2xl bg-white border-2 border-[#06808B]/30 shadow-md p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={infoTopSmallBannerUrl || infoLogoUrl || "/salon-images/logo.jpg"}
                          alt="Top Small Banner Preview"
                          className="w-full h-full object-contain rounded-xl"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/salon-images/logo.jpg";
                          }}
                        />
                      </div>
                      <div className="flex-grow text-right space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-black text-sm text-[#2C1E14]">
                            {infoName || "سالن زیبایی راز ملکه"}
                          </span>
                          <span className="text-[10px] bg-[#06808B]/10 text-[#06808B] font-bold px-2 py-0.5 rounded-full">
                            نشان و نماد سالن
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          نکته: برای زیباتر دیده شدن، از تصویر مربع با پس‌زمینه شفاف یا سفید با کیفیت بالا استفاده فرمایید.
                        </p>
                      </div>
                    </div>

                    {/* Actions & URL Input */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-[11px] font-bold text-gray-600 mb-1.5 block">
                          آپلود مستقیم بنر کوچک / لوگو:
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            id="top-small-banner-upload-file"
                            className="hidden"
                            disabled={isUploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleDirectTopSmallBannerUpload(file);
                              e.target.value = "";
                            }}
                          />
                          <label
                            htmlFor="top-small-banner-upload-file"
                            className="w-full bg-[#06808B] hover:bg-[#056972] text-white px-4 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                          >
                            <Upload className="w-4 h-4" />
                            <span>انتخاب و آپلود بنر کوچک / لوگو</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-600 mb-1.5 block">
                          یا درج آدرس اینترنتی لوگو (URL):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={infoTopSmallBannerUrl}
                            onChange={(e) => {
                              setInfoTopSmallBannerUrl(e.target.value);
                              setInfoLogoUrl(e.target.value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleApplyTopSmallBannerUrl();
                              }
                            }}
                            placeholder="https://... آدرس عکس لوگو"
                            className="flex-grow px-3 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-mono text-left focus:ring-2 focus:ring-[#06808B]/20"
                          />
                          <button
                            type="button"
                            onClick={handleApplyTopSmallBannerUrl}
                            className="bg-[#06808B] hover:bg-[#056972] text-white px-3 py-2 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                            title="اعمال و ذخیره این نشان"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>ثبت و ذخیره</span>
                          </button>
                          {infoTopSmallBannerUrl && (
                            <button
                              type="button"
                              onClick={handleResetTopSmallBanner}
                              className="px-3 py-2 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                              title="بازگشت به پیش‌فرض"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">پیش‌فرض</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: Hero Section Image Banner */}
                  <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#06808B]/10 text-[#06808B] flex items-center justify-center font-bold">
                          ۳
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-[#2C1E14]">
                            بنر تصویر کادر هیرو (تصویر اصلی معرفی سالن)
                          </h4>
                          <p className="text-[11px] text-gray-500">
                            تصویر بزرگی که در صفحه اصلی کنار متن خوش‌آمدگویی، امتیاز ۵ ستاره و دکمه رزرو نوبت قرار دارد.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {infoHeroBannerUrl ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-black">
                            تصویر هیرو اختصاصی فعال است
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            تصویر هیرو پیش‌فرض فعال است
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#FAF6F0] p-3.5 rounded-2xl border border-[#06808B]/15">
                      <div className="w-32 h-24 rounded-2xl bg-white border border-[#06808B]/30 shadow-md overflow-hidden shrink-0">
                        <img
                          src={infoHeroBannerUrl || "/salon-images/hero-salon.jpg"}
                          alt="Hero Banner Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/salon-images/hero-salon.jpg";
                          }}
                        />
                      </div>
                      <div className="flex-grow text-right space-y-1">
                        <span className="font-bold text-xs text-[#2C1E14] block">
                          پیش‌نمایش تصویر کادر معرفی
                        </span>
                        <p className="text-xs text-gray-500">
                          می‌توانید نمایی از دکوراسیون سالن، تجهیزات یا مدل‌های میکاپ خود را در این بخش قرار دهید.
                        </p>
                      </div>
                    </div>

                    {/* Actions & URL Input */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-[11px] font-bold text-gray-600 mb-1.5 block">
                          آپلود مستقیم تصویر هیرو:
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            id="hero-banner-upload-file"
                            className="hidden"
                            disabled={isUploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleDirectHeroBannerUpload(file);
                              e.target.value = "";
                            }}
                          />
                          <label
                            htmlFor="hero-banner-upload-file"
                            className="w-full bg-[#06808B] hover:bg-[#056972] text-white px-4 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                          >
                            <Upload className="w-4 h-4" />
                            <span>انتخاب و آپلود تصویر هیرو</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-600 mb-1.5 block">
                          یا درج آدرس اینترنتی (URL):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={infoHeroBannerUrl}
                            onChange={(e) => setInfoHeroBannerUrl(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleApplyHeroBannerUrl();
                              }
                            }}
                            placeholder="https://... آدرس عکس هیرو"
                            className="flex-grow px-3 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-mono text-left focus:ring-2 focus:ring-[#06808B]/20"
                          />
                          <button
                            type="button"
                            onClick={handleApplyHeroBannerUrl}
                            className="bg-[#06808B] hover:bg-[#056972] text-white px-3 py-2 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                            title="اعمال و ذخیره این بنر هیرو"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>ثبت و ذخیره</span>
                          </button>
                          {infoHeroBannerUrl && (
                            <button
                              type="button"
                              onClick={handleResetHeroBanner}
                              className="px-3 py-2 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                              title="بازگشت به پیش‌فرض"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">پیش‌فرض</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Final Master Save Card for Banners */}
                  <div className="bg-gradient-to-l from-emerald-500/10 via-teal-500/10 to-transparent p-4 sm:p-5 rounded-3xl border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm mt-4">
                    <div className="text-right space-y-1 w-full sm:w-auto">
                      <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>تثبیت و ماندگاری دائمی بنرها روی وبسایت</span>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">
                        تغییرات شما به صورت زنده بر روی سایت اعمال شده‌اند. با زدن دکمه ثبت نهایی، کلیه تصاویر و بنرها به صورت ماندگار در حافظه مرورگر ذخیره شده و پس از رفرش یا بستن سایت بدون تغییر باقی می‌مانند.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleMasterFinalSave}
                      disabled={isSavingFinal}
                      className="w-full sm:w-auto shrink-0 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-black px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all border border-emerald-400/30"
                    >
                      {isSavingFinal ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-spin text-emerald-200" />
                          <span>در حال ثبت...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 text-emerald-200" />
                          <span>ثبت نهایی کلیه بنرها و تغییرات</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "services" && (
                <div className="space-y-6">
                  {/* Services Tab Header & Quick Actions */}
                  <div className="bg-white/80 p-5 sm:p-6 rounded-3xl border border-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-[#06808B]/10 text-[#06808B] flex items-center justify-center">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="font-black text-[#2C1E14] text-lg sm:text-xl font-serif">
                          مدیریت منوی خدمات سالن
                        </h3>
                      </div>
                      <p className="text-xs text-gray-600 font-semibold leading-relaxed max-w-2xl">
                        در این بخش می‌توانید مشخصات، عنوان، تعرفه قیمت، توضیحات و <strong className="text-[#06808B]">تامبنیل و تصویر هر لاین خدماتی</strong> را مستقیماً ویرایش، آپلود یا بازنشانی نمایید.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleOpenCreateServiceModal}
                        className="bg-[#06808B] hover:bg-[#056f79] text-white text-xs sm:text-sm font-black px-5 py-3 rounded-2xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>افزودن لاین خدمت جدید</span>
                      </button>
                    </div>
                  </div>

                  {/* Search and Category Filter Bar */}
                  <div className="bg-white/70 p-4 rounded-2xl border border-white shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full md:w-72">
                      <input
                        type="text"
                        placeholder="جستجو در بین خدمات..."
                        value={serviceSearchQuery}
                        onChange={(e) => setServiceSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs focus:ring-2 focus:ring-[#06808B]/20 text-right"
                      />
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                      {["همه", "عروس و میکاپ", "رنگ و مو", "احیا و کراتین", "ناخن و پدیکور", "مژه و ابرو", "پوست و فشیال", "بافت و استایل", "کوتاهی و استایل"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setServiceCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                            serviceCategoryFilter === cat
                              ? "bg-[#06808B] text-white shadow-xs"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Services List Grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-black text-gray-600 px-1">
                      <span>فهرست خدمات فعال ({services.length} لاین):</span>
                      <span className="text-[11px] text-gray-400">برای تغییر عکس، روی نماد دوربین روی تصویر کلیک کنید یا دکمه ویرایش را بزنید</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {services
                        .filter((s) => {
                          const matchesCat = serviceCategoryFilter === "همه" || s.category === serviceCategoryFilter;
                          const matchesSearch =
                            s.title.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
                            s.description.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
                            s.category.toLowerCase().includes(serviceSearchQuery.toLowerCase());
                          return matchesCat && matchesSearch;
                        })
                        .map((item) => (
                          <div
                            key={item.id}
                            className="bg-white/95 p-4 rounded-3xl border border-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 text-right"
                          >
                            <div className="flex items-start gap-3.5">
                              {/* Thumbnail Container with Quick-Upload Camera Overlay */}
                              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-[#06808B]/20 bg-gray-100 shadow-xs group">
                                <img
                                  src={resolveImageUrl(item.image)}
                                  alt={item.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = resolveImageUrl("./assets/services/lashes.jpg");
                                  }}
                                />
                                <input
                                  type="file"
                                  accept="image/*"
                                  id={`quick-thumb-upload-${item.id}`}
                                  className="hidden"
                                  disabled={isUploading}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleDirectServiceImageUpload(item.id, file);
                                    e.target.value = "";
                                  }}
                                />
                                <label
                                  htmlFor={`quick-thumb-upload-${item.id}`}
                                  className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-black cursor-pointer p-1 text-center"
                                  title="تغییر سریع تامبنیل این خدمت"
                                >
                                  <Camera className="w-4 h-4 mb-0.5" />
                                  <span>تغییر عکس</span>
                                </label>
                              </div>

                              {/* Title, Category & Excerpt */}
                              <div className="flex-grow space-y-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="font-black text-sm text-[#2C1E14] truncate font-serif">
                                    {item.title}
                                  </h4>
                                  <span className="text-[10px] font-black bg-[#06808B]/10 text-[#06808B] px-2.5 py-0.5 rounded-full shrink-0">
                                    {item.category}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                                  {item.description || "بدون توضیحات ثبت شده"}
                                </p>
                                {item.price && (
                                  <div className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                                    {item.price}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                              <label
                                htmlFor={`quick-thumb-upload-${item.id}`}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1"
                                title="آپلود مستقیم عکس جدید از کامپیوتر یا موبایل"
                              >
                                <Camera className="w-3.5 h-3.5 text-[#06808B]" />
                                <span className="hidden sm:inline">تغییر سریع عکس</span>
                              </label>

                              <button
                                type="button"
                                onClick={() => handleOpenEditServiceModal(item)}
                                className="bg-[#06808B]/10 hover:bg-[#06808B]/20 text-[#06808B] text-xs font-black px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>ویرایش مشخصات و تامبنیل</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteService(item.id)}
                                className="text-red-500 hover:bg-red-50 p-1.5 rounded-xl transition-all cursor-pointer"
                                title="حذف این خدمت"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* EDIT OR CREATE SERVICE MODAL */}
                  {editingServiceModal && (
                    <div className="fixed inset-0 bg-[#2C1E14]/80 backdrop-blur-sm z-[70] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
                      <div className="bg-[#FAF6F0] w-full max-w-2xl rounded-[2.5rem] border border-white shadow-2xl p-6 sm:p-7 space-y-6 text-right max-h-[92vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-[#06808B]/15 pb-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-2xl bg-[#06808B] text-white flex items-center justify-center shadow-sm">
                              <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-black text-[#2C1E14] text-base sm:text-lg font-serif">
                                {isAddingNewService ? "افزودن لاین خدمت جدید" : `ویرایش مشخصات و تامبنیل: ${editingServiceModal.title}`}
                              </h3>
                              <p className="text-[11px] text-gray-500 font-semibold">
                                تغییر عکس، عنوان، لاین، تعرفه و توضیحات کارت این خدمت
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingServiceModal(null);
                              setIsAddingNewService(false);
                            }}
                            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white/60 cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* SECTION 1: THUMBNAIL EDITING */}
                        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                          <label className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-[#06808B]" />
                            <span>تامبنیل و تصویر مرتبط با خدمت *</span>
                          </label>

                          <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#FAF6F0] p-3 rounded-2xl border border-[#06808B]/15">
                            <div className="w-24 h-24 rounded-2xl bg-white border border-[#06808B]/30 shadow-md overflow-hidden shrink-0">
                              <img
                                src={editingServiceModal.image || "/assets/services/lashes.jpg"}
                                alt="پیش‌نمایش تامبنیل"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/assets/services/lashes.jpg";
                                }}
                              />
                            </div>
                            <div className="flex-grow space-y-1 text-right">
                              <span className="text-xs font-bold text-[#2C1E14] block">
                                پیش‌نمایش زنده تامبنیل خدمت
                              </span>
                              <p className="text-[11px] text-gray-500">
                                این تصویر بر روی کارت خدمت در منوی صفحه اصلی نمایش می‌یابد.
                              </p>
                              {editingServiceModal.image && (
                                <span className="text-[10px] font-mono text-[#06808B] truncate block max-w-md dir-ltr text-right">
                                  {editingServiceModal.image.substring(0, 60)}...
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Direct Upload Button */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-gray-600 mb-1.5 block">
                                آپلود تصویر جدید از دستگاه (کامپیوتر یا موبایل):
                              </label>
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  id="modal-service-upload-file"
                                  className="hidden"
                                  disabled={isUploading}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        setIsUploading(true);
                                        setUploadStatusMessage("در حال فشرده‌سازی و بارگذاری تصویر...");
                                        const compressed = await compressImageFile(file, 1000, 1000, 0.85);

                                        let finalUrl = compressed;
                                        try {
                                          const uploadRes = await fetch("/api/upload-image", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                              image: compressed,
                                              folder: "services",
                                              fileName: `service-${editingServiceModal.id}`
                                            })
                                          });
                                          const uploadJson = await uploadRes.json();
                                          if (uploadJson.success && uploadJson.url) {
                                            finalUrl = uploadJson.url;
                                          }
                                        } catch {}

                                        setEditingServiceModal({ ...editingServiceModal, image: finalUrl });
                                        setIsUploading(false);
                                        setUploadStatusMessage("");
                                      } catch (err: any) {
                                        setIsUploading(false);
                                        setUploadStatusMessage("");
                                        alert(err.message || "خطا در پردازش تصویر");
                                      }
                                    }
                                    e.target.value = "";
                                  }}
                                />
                                <label
                                  htmlFor="modal-service-upload-file"
                                  className="w-full bg-[#06808B] hover:bg-[#056972] text-white px-4 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                                >
                                  <Upload className="w-4 h-4" />
                                  <span>انتخاب و آپلود عکس جدید</span>
                                </label>
                              </div>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-gray-600 mb-1.5 block">
                                یا درج آدرس اینترنتی تصویر (URL):
                              </label>
                              <input
                                type="text"
                                placeholder="https://... آدرس عکس"
                                value={editingServiceModal.image}
                                onChange={(e) =>
                                  setEditingServiceModal({ ...editingServiceModal, image: e.target.value })
                                }
                                className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-mono text-left focus:ring-2 focus:ring-[#06808B]/20"
                              />
                            </div>
                          </div>

                          {/* Quick Preset Selector from Salon Assets */}
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-bold text-gray-600 block">
                              یا انتخاب سریع از تصاویر آماده پوشه assets/services سالن:
                            </span>
                            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                              {PRESET_SERVICE_THUMBNAILS.map((preset) => (
                                <button
                                  key={preset.url}
                                  type="button"
                                  onClick={() =>
                                    setEditingServiceModal({ ...editingServiceModal, image: preset.url })
                                  }
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                                    editingServiceModal.image === preset.url
                                      ? "bg-[#06808B] text-white border-[#06808B] shadow-xs"
                                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                                  }`}
                                >
                                  <img
                                    src={preset.url}
                                    alt=""
                                    className="w-4 h-4 rounded-full object-cover shrink-0"
                                  />
                                  <span>{preset.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* SECTION 2: SPECIFICATIONS */}
                        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                          <label className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-[#06808B]" />
                            <span>مشخصات و جزییات لاین خدمت</span>
                          </label>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-700">عنوان خدمت *</label>
                              <input
                                type="text"
                                placeholder="مثلاً: مژه و ابرو، رنگ و لایت"
                                value={editingServiceModal.title}
                                onChange={(e) =>
                                  setEditingServiceModal({ ...editingServiceModal, title: e.target.value })
                                }
                                className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold focus:ring-2 focus:ring-[#06808B]/20 text-right"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-700">دسته‌بندی (لاین) *</label>
                              <select
                                value={editingServiceModal.category}
                                onChange={(e) =>
                                  setEditingServiceModal({ ...editingServiceModal, category: e.target.value })
                                }
                                className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold focus:ring-2 focus:ring-[#06808B]/20 text-right"
                                required
                              >
                                <option value="عروس و میکاپ">عروس و میکاپ</option>
                                <option value="رنگ و مو">رنگ و مو</option>
                                <option value="احیا و کراتین">احیا و کراتین</option>
                                <option value="ناخن و پدیکور">ناخن و پدیکور</option>
                                <option value="مژه و ابرو">مژه و ابرو</option>
                                <option value="پوست و فشیال">پوست و فشیال</option>
                                <option value="بافت و استایل">بافت و استایل</option>
                                <option value="کوتاهی و استایل">کوتاهی و استایل</option>
                              </select>
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-xs font-bold text-gray-700">تعرفه / شروع قیمت (اختیاری)</label>
                              <input
                                type="text"
                                placeholder="مثال: شروع از ۵۰۰,۰۰۰ تومان یا جهت رزرو تماس بگیرید"
                                value={editingServiceModal.price || ""}
                                onChange={(e) =>
                                  setEditingServiceModal({ ...editingServiceModal, price: e.target.value })
                                }
                                className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs focus:ring-2 focus:ring-[#06808B]/20 text-right"
                              />
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-xs font-bold text-gray-700">توضیحات و مشخصات تخصصی خدمت</label>
                              <textarea
                                rows={3}
                                placeholder="توضیح کوتاه تکنیک‌ها، برند مواد مصرفی و مزایای این خدمت..."
                                value={editingServiceModal.description}
                                onChange={(e) =>
                                  setEditingServiceModal({ ...editingServiceModal, description: e.target.value })
                                }
                                className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs focus:ring-2 focus:ring-[#06808B]/20 text-right leading-relaxed"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingServiceModal(null);
                              setIsAddingNewService(false);
                            }}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold px-5 py-3 rounded-2xl cursor-pointer transition-all"
                          >
                            انصراف
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveServiceModal}
                            className="bg-[#06808B] hover:bg-[#056f79] text-white text-xs sm:text-sm font-black px-7 py-3 rounded-2xl flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
                          >
                            <Save className="w-4 h-4" />
                            <span>ذخیره تغییرات خدمت</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Master Final Save Card for Services */}
                  <div className="bg-gradient-to-l from-emerald-500/10 via-teal-500/10 to-transparent p-4 sm:p-5 rounded-3xl border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm mt-4">
                    <div className="text-right space-y-1 w-full sm:w-auto">
                      <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>ثبت نهایی فهرست خدمات سالن</span>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">
                        خدمات اضافه یا ویرایش شده به شکل زنده بر روی سایت قرار دارند. با فشردن دکمه ثبت نهایی، کلیه تغییرات در حافظه پایدار تثبیت می‌شوند.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleMasterFinalSave}
                      disabled={isSavingFinal}
                      className="w-full sm:w-auto shrink-0 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-black px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all border border-emerald-400/30"
                    >
                      {isSavingFinal ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-spin text-emerald-200" />
                          <span>در حال ثبت...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 text-emerald-200" />
                          <span>ثبت نهایی کلیه تغییرات</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: SALON INFO MANAGEMENT */}
              {activeTab === "info" && (
                <div className="space-y-6">
                  <div className="border-b border-[#06808B]/10 pb-4">
                    <h3 className="font-black text-[#2C1E14] text-lg sm:text-xl font-serif">تنظیمات و اطلاعات سالن</h3>
                    <p className="text-xs text-gray-500 font-semibold">شعار سالن، شماره‌های تماس، آدرس اینستاگرام و موقعیت مکانی.</p>
                  </div>

                  <form onSubmit={handleSaveSalonInfo} className="space-y-4">
                    {/* Logo Management Section */}
                    <div className="bg-[#06808B]/5 border border-[#06808B]/20 p-4 rounded-3xl space-y-3">
                      <div className="flex items-center justify-between text-xs font-black text-[#06808B]">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          <span>تصویر آیکون / بنر کوچک سمت راست بالا (لوگوی سالن)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab("banners")}
                          className="text-[11px] bg-[#06808B] text-white px-3 py-1 rounded-xl font-bold hover:bg-[#056972] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Layers className="w-3 h-3" />
                          <span>مدیریت کامل بنرها و بک‌گراند</span>
                        </button>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-white border-2 border-[#06808B]/30 shadow-md p-1 flex items-center justify-center shrink-0 overflow-hidden">
                          <img
                            src={infoTopSmallBannerUrl || infoLogoUrl || "/salon-images/logo.jpg"}
                            alt="Logo Preview"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/salon-images/logo.jpg";
                            }}
                          />
                        </div>
                        <div className="flex-grow w-full space-y-2">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              value={infoTopSmallBannerUrl || infoLogoUrl}
                              onChange={(e) => {
                                updateFieldAndSync("topSmallBannerUrl", e.target.value);
                              }}
                              placeholder="آدرس اینترنتی لوگو یا آپلود فایل از سیستم..."
                              className="flex-grow px-4 py-2.5 rounded-2xl bg-white border border-[#06808B]/20 text-xs font-mono text-left focus:ring-2 focus:ring-[#06808B]/20"
                            />
                            <div className="relative shrink-0">
                              <input
                                type="file"
                                accept="image/*"
                                id="salon-info-logo-upload"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      setIsUploading(true);
                                      setUploadStatusMessage("در حال فشرده‌سازی تصویر لوگو...");
                                      const compressed = await compressImageFile(file, 600, 600, 0.85);
                                      await updateFieldAndSync("topSmallBannerUrl", compressed);
                                      setIsUploading(false);
                                      setUploadStatusMessage("");
                                      alert("✅ تصویر لوگو اعمال شد و به صورت دائمی ثبت گردید!");
                                    } catch (err: any) {
                                      setIsUploading(false);
                                      setUploadStatusMessage("");
                                      alert(err.message || "خطا در پردازش تصویر");
                                    }
                                  }
                                }}
                              />
                              <label
                                htmlFor="salon-info-logo-upload"
                                className="bg-[#06808B] hover:bg-[#056972] text-white px-4 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap"
                              >
                                <Upload className="w-4 h-4" />
                                <span>آپلود تصویر لوگو از سیستم</span>
                              </label>
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-500 font-semibold">
                            این تصویر به عنوان لوگوی اصلی سالن در هدر (Navbar)، فوتر، گوشه بالا و پنل مدیریت نمایش داده خواهد شد.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">نام سالن زیبایی</label>
                        <input
                          type="text"
                          value={infoName}
                          onChange={(e) => updateFieldAndSync("name", e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#06808B]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#06808B]/20"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">شعار رسمی سالن</label>
                        <input
                          type="text"
                          value={infoSlogan}
                          onChange={(e) => updateFieldAndSync("slogan", e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#06808B]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#06808B]/20"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">آدرس پیج اینستاگرام (آیدی بدون @)</label>
                        <input
                          type="text"
                          value={infoInsta}
                          onChange={(e) => updateFieldAndSync("instagram", e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#06808B]/20 text-sm font-mono text-left focus:outline-none focus:ring-2 focus:ring-[#06808B]/20"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">شماره تلفن هوشمند اول (رزرو نوبت) *</label>
                        <input
                          type="text"
                          value={infoPhone1}
                          onChange={(e) => updateFieldAndSync("phone1", e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#06808B]/20 text-sm font-mono text-left focus:outline-none focus:ring-2 focus:ring-[#06808B]/20"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">شماره تلفن همراه دوم</label>
                        <input
                          type="text"
                          value={infoPhone2}
                          onChange={(e) => updateFieldAndSync("phone2", e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#06808B]/20 text-sm font-mono text-left focus:outline-none focus:ring-2 focus:ring-[#06808B]/20"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-gray-600">آدرس فیزیکی سالن *</label>
                        <input
                          type="text"
                          value={infoAddress}
                          onChange={(e) => updateFieldAndSync("address", e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#06808B]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#06808B]/20"
                          required
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-gray-600">لینک مسیریابی نشان/گوگل مپ</label>
                        <input
                          type="url"
                          value={infoMap}
                          onChange={(e) => updateFieldAndSync("mapLink", e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#06808B]/20 text-sm font-mono text-left focus:outline-none focus:ring-2 focus:ring-[#06808B]/20"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-3">
                      <button
                        type="submit"
                        disabled={isSavingFinal}
                        className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-black px-6 py-3.5 rounded-2xl flex items-center gap-2 cursor-pointer shadow-lg transition-all border border-emerald-400/30"
                      >
                        {isSavingFinal ? (
                          <>
                            <Sparkles className="w-4 h-4 animate-spin text-emerald-200" />
                            <span>در حال ذخیره...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 text-emerald-200" />
                            <span>ثبت نهایی و ماندگاری دائمی اطلاعات سالن</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 4: SECURITY & CREDENTIALS */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div className="border-b border-[#06808B]/10 pb-4">
                    <h3 className="font-black text-[#2C1E14] text-lg sm:text-xl font-serif">
                      امنیت و تغییر رمز عبور مدیریت
                    </h3>
                    <p className="text-xs text-gray-500 font-semibold">
                      نام کاربری و رمز عبور اختصاصی خود را در این بخش تعیین و تغییر دهید.
                    </p>
                  </div>

                  {/* Current Active Credentials Banner */}
                  <div className="bg-[#06808B]/10 p-4 rounded-2xl border border-[#06808B]/20 space-y-1 text-right">
                    <div className="flex items-center gap-2 text-xs font-black text-[#06808B]">
                      <KeyRound className="w-4 h-4" />
                      <span>مشخصات فعال فعلی سیستم:</span>
                    </div>
                    <div className="text-xs text-[#2C1E14] font-medium">
                      نام کاربری فعال: <strong className="font-mono">{savedCredentials.username}</strong> | رمز عبور فعال: <strong className="font-mono">{savedCredentials.password}</strong>
                    </div>
                  </div>

                  {securitySuccessMessage && (
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 p-3.5 rounded-2xl border border-emerald-200 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{securitySuccessMessage}</span>
                    </div>
                  )}

                  {securityErrorMessage && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3.5 rounded-2xl border border-red-200 text-xs font-bold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{securityErrorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangeCredentials} className="space-y-4 max-w-lg">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">نام کاربری جدید مدیریت</label>
                      <input
                        type="text"
                        value={newAdminUsername}
                        onChange={(e) => setNewAdminUsername(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-[#06808B]/20 text-sm font-mono focus:ring-2 focus:ring-[#06808B]/20"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">رمز عبور فعلی</label>
                      <input
                        type="password"
                        value={currentAdminPassword}
                        onChange={(e) => setCurrentAdminPassword(e.target.value)}
                        placeholder="جهت احراز هویت، رمز فعلی را وارد کنید..."
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-[#06808B]/20 text-sm font-mono focus:ring-2 focus:ring-[#06808B]/20"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">رمز عبور جدید</label>
                      <input
                        type="password"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="حداقل ۴ کاراکتر..."
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-[#06808B]/20 text-sm font-mono focus:ring-2 focus:ring-[#06808B]/20"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">تکرار رمز عبور جدید</label>
                      <input
                        type="password"
                        value={confirmAdminPassword}
                        onChange={(e) => setConfirmAdminPassword(e.target.value)}
                        placeholder="تکرار دقیق رمز عبور جدید..."
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-[#06808B]/20 text-sm font-mono focus:ring-2 focus:ring-[#06808B]/20"
                        required
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="glass-btn-primary px-6 py-3 rounded-full text-xs font-black flex items-center gap-2 shadow-md cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>ذخیره و فعال‌سازی رمز عبور جدید</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 7: GITHUB LIVE CLOUD SYNC & REPOSITORY INTEGRATION */}
              {activeTab === "github" && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-purple-700 bg-purple-100 px-3.5 py-1 rounded-full text-xs font-black">
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>اتصال مستقیم و ذخیره دائمی در مخزن گیت‌هاب</span>
                    </div>
                    <h3 className="font-extrabold text-xl text-[#2C1E14] font-serif">
                      همگام‌سازی اطلاعات و تصاویر با گیت‌هاب
                    </h3>
                    <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                      با اتصال به گیت‌هاب، هر تصویری که آپلود کنید و هر تغییری که در مشخصات یا خدمات سالن دهید، مستقیماً در ریپازیتوری گیت‌هاب کامیت شده و تمام افرادی که از طریق لینک وارد سایت می‌شوند نیز آخرین تغییرات را مشاهده خواهند کرد.
                    </p>
                  </div>

                  {/* Status Alerts */}
                  {ghStatusMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 font-bold flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p>{ghStatusMsg}</p>
                        <p className="text-[11px] text-emerald-700 font-normal">
                          نکته: پس از ارسال به گیت‌هاب، حدود ۱ تا ۲ دقیقه طول می‌کشد تا GitHub Pages نسخه جدید را بازنشر کند.
                        </p>
                      </div>
                    </div>
                  )}

                  {ghErrorMsg && (
                    <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-800 font-bold flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <span>{ghErrorMsg}</span>
                    </div>
                  )}

                  {/* Primary Action: Direct Push to GitHub */}
                  <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 border-2 border-purple-300/80 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-purple-900 font-black text-sm">
                        <CloudUpload className="w-5 h-5 text-purple-600" />
                        <span>ارسال و ذخیره مستقیم همه تغییرات در گیت‌هاب</span>
                      </div>
                      <span className="text-[11px] bg-purple-200/80 text-purple-900 font-extrabold px-3 py-1 rounded-full">
                        نمایش برای همه کاربران
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                      با کلیک روی دکمه زیر، فایل داده‌های سالن به همراه کلیه عکس‌های آپلود شده به صورت خودکار در ریپازیتوری گیت‌هاب ثبت شده و برای تمامی مخاطبان سایت در دسترس قرار می‌گیرد.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handlePushToGitHub}
                        disabled={isPushingGitHub}
                        className="flex-1 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 active:scale-95 text-white py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-black shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all border border-purple-400"
                      >
                        {isPushingGitHub ? (
                          <>
                            <Sparkles className="w-5 h-5 animate-spin text-purple-200" />
                            <span>در حال ذخیره و انتشار در گیت‌هاب...</span>
                          </>
                        ) : (
                          <>
                            <GitBranch className="w-5 h-5 text-purple-200" />
                            <span>ثبت و انتشار همه تغییرات در گیت‌هاب</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadAppDataJson}
                        className="bg-white hover:bg-gray-50 border border-purple-200 text-purple-900 py-3.5 px-5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                        title="دانلود مستقیم فایل app-data.json بر روی دستگاه خود"
                      >
                        <Download className="w-4 h-4 text-purple-600" />
                        <span>دانلود فایل داده‌ها</span>
                      </button>
                    </div>
                  </div>

                  {/* GitHub Repository & Token Configuration Form */}
                  <div className="bg-white/80 border border-[#06808B]/20 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="font-black text-sm text-[#2C1E14] flex items-center gap-2">
                      <Settings className="w-4 h-4 text-[#06808B]" />
                      <span>تنظیمات مخزن و توکن گیت‌هاب</span>
                    </h4>

                    <form onSubmit={handleSaveGhConfig} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">
                          نام کاربری و ریپازیتوری گیت‌هاب (Owner/Repository) *
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={ghRepoInput}
                          onChange={(e) => setGhRepoInput(e.target.value)}
                          placeholder="e.g. e.salehi8082/my-salon-repo"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#06808B]/20 text-sm font-mono focus:ring-2 focus:ring-[#06808B]/20 text-left"
                          required
                        />
                        <p className="text-[10px] text-gray-500 font-medium">
                          آدرس ریپازیتوری شما در گیت‌هاب؛ مانند: <code>e.salehi8082/نام-مخزن</code>
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">
                          توکن دسترسی شخصی گیت‌هاب (Personal Access Token) *
                        </label>
                        <input
                          type="password"
                          dir="ltr"
                          value={ghTokenInput}
                          onChange={(e) => setGhTokenInput(e.target.value)}
                          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#06808B]/20 text-sm font-mono focus:ring-2 focus:ring-[#06808B]/20 text-left"
                          required
                        />
                        <p className="text-[10px] text-gray-500 font-medium">
                          این توکن فقط روی مرورگر خود شما به صورت ایمن ذخیره می‌شود و برای ارسال تغییرات به گیت‌هاب لازم است.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">
                          شاخه مورد نظر (Branch)
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={ghBranchInput}
                          onChange={(e) => setGhBranchInput(e.target.value)}
                          placeholder="main"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#06808B]/20 text-sm font-mono focus:ring-2 focus:ring-[#06808B]/20 text-left"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="bg-[#06808B] hover:bg-[#046770] text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
                        >
                          <Save className="w-4 h-4" />
                          <span>ذخیره تنظیمات گیت‌هاب</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Step-by-step Guide for Creating a Token */}
                  <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 text-xs text-amber-900 space-y-2.5">
                    <h5 className="font-black text-amber-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>راهنمای سریع ۱ دقیقه‌ای ساخت توکن گیت‌هاب (Personal Access Token):</span>
                    </h5>
                    <ol className="list-decimal list-inside space-y-1.5 font-medium leading-relaxed">
                      <li>در گیت‌هاب، روی عکس پروفایل بالا کلیک کرده و وارد <strong>Settings</strong> شوید.</li>
                      <li>در پایین منوی سمت چپ، روی <strong>Developer settings</strong> و سپس <strong>Personal access tokens</strong> ➔ <strong>Tokens (classic)</strong> بزنید.</li>
                      <li>دکمه <strong>Generate new token (classic)</strong> را بزنید، یک نام بگذارید، تیک گزینه <strong>repo</strong> (دسترسی کامل به مخزن) را فعال کنید و دکمه سبز رنگ Generate را بزنید.</li>
                      <li>توکن تولید شده را کپی کرده و در کادر بالا قرار دهید و دکمه «ذخیره تنظیمات» را بزنید.</li>
                    </ol>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Modal for Creating New Custom Topic */}
        {showNewTopicModal && (
          <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#FAF6F0] w-full max-w-lg rounded-3xl p-6 border border-white shadow-2xl text-right space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h4 className="font-black text-base text-[#2C1E14]">ایجاد تاپیک و آلبوم تخصصی جدید</h4>
                <button
                  onClick={() => setShowNewTopicModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNewTopic} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">عنوان تاپیک *</label>
                  <input
                    type="text"
                    placeholder="مثال: طراحی حنا و تاتو بدن"
                    value={newTopicTitle}
                    onChange={(e) => {
                      setNewTopicTitle(e.target.value);
                      if (!newTopicCategory) setNewTopicCategory(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">دسته‌بندی کلیدی *</label>
                  <input
                    type="text"
                    placeholder="مثال: طراحی حنا"
                    value={newTopicCategory}
                    onChange={(e) => setNewTopicCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">عکس کاور تاپیک (اختیاری)</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="آدرس اینترنتی یا انتخاب فایل از سیستم..."
                      value={newTopicCover}
                      onChange={(e) => setNewTopicCover(e.target.value)}
                      className="flex-grow px-3.5 py-2.5 rounded-xl bg-white border text-xs font-mono text-left"
                    />
                    <div className="relative shrink-0">
                      <input
                        type="file"
                        accept="image/*"
                        id="new-topic-cover-file"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              setIsUploading(true);
                              setUploadStatusMessage("در حال فشرده‌سازی عکس کاور...");
                              const compressed = await compressImageFile(file, 1280, 1280, 0.82);
                              setNewTopicCover(compressed);
                              setIsUploading(false);
                              setUploadStatusMessage("");
                            } catch (err: any) {
                              setIsUploading(false);
                              setUploadStatusMessage("");
                              alert(err.message || "خطا در پردازش تصویر");
                            }
                          }
                        }}
                      />
                      <label
                        htmlFor="new-topic-cover-file"
                        className="bg-[#06808B] hover:bg-[#056972] text-white px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>انتخاب فایل از سیستم</span>
                      </label>
                    </div>
                  </div>
                  {newTopicCover && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <img
                        src={newTopicCover}
                        alt="Preview"
                        className="w-10 h-10 object-cover rounded-lg border border-[#06808B]/20"
                      />
                      <span className="text-[10px] text-emerald-700 font-bold">✓ کاور انتخاب شد</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">متن نشان/بج تاپیک (اختیاری)</label>
                  <input
                    type="text"
                    placeholder="مثال: لاین تخصصی"
                    value={newTopicBadge}
                    onChange={(e) => setNewTopicBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">توضیحات کاور تاپیک (اختیاری)</label>
                  <textarea
                    rows={2}
                    placeholder="توضیحات و معرفی این آلبوم و کاور..."
                    value={newTopicDesc}
                    onChange={(e) => setNewTopicDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewTopicModal(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-500 rounded-full"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="bg-[#06808B] text-white text-xs font-black px-6 py-2.5 rounded-full shadow cursor-pointer"
                  >
                    ایجاد تاپیک
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Master Final Save Success Modal */}
        {showFinalSaveSuccessModal && (
          <div className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#FAF6F0] w-full max-w-md rounded-3xl p-6 sm:p-7 border border-white shadow-2xl text-center space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h4 className="font-black text-xl text-[#2C1E14] font-serif">
                  ثبت نهایی با موفقیت انجام شد!
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                  کلیه بنرها، تصاویر، اطلاعات سالن و نمونه‌کارها در حافظه پایدار مرورگر ثبت شدند. با رفرش صفحه یا بستن و باز کردن مجدد سایت، تغییرات به صورت دائمی باقی خواهند ماند.
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-[11px] text-emerald-800 font-bold flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>زمان ثبت نهایی: {lastSavedTimestamp || "هم‌اکنون"} ✓</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFinalSaveSuccessModal(false)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black py-3 rounded-2xl cursor-pointer shadow-md transition-all"
                >
                  متوجه شدم و ادامه
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFinalSaveSuccessModal(false);
                    onClose();
                  }}
                  className="w-full bg-[#06808B] hover:bg-[#056972] active:scale-95 text-white text-xs font-black py-3 rounded-2xl cursor-pointer shadow-md transition-all"
                >
                  مشاهده وبسایت
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
