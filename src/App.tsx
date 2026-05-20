/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Photo, Album, FamilyMember, ViewMode } from "./types";
import { DEFAULT_MEMBERS, DEFAULT_ALBUMS, DEFAULT_PHOTOS } from "./data";

// Components
import PolaroidCard from "./components/PolaroidCard";
import CollageMasonry from "./components/CollageMasonry";
import ChronologicalTimeline from "./components/ChronologicalTimeline";
import FocusedCarousel from "./components/FocusedCarousel";
import AddPhotoModal from "./components/AddPhotoModal";
import AddAlbumModal from "./components/AddAlbumModal";
import AiStoryBook from "./components/AiStoryBook";
import VideoMaker from "./components/VideoMaker";
import PhotoStudio from "./components/PhotoStudio";

import { 
  Language, 
  translations, 
  translateMemberName, 
  translateMemberRole, 
  translateAlbumTitle, 
  translateAlbumDesc, 
  translatePhotoTitle, 
  translatePhotoDesc, 
  translatePhotoLocation 
} from "./localization";

// Icons
import {
  Sparkles,
  Plus,
  Search,
  Users,
  Grid,
  TrendingUp,
  Sliders,
  Maximize2,
  Calendar,
  MapPin,
  Tag,
  Trash2,
  Heart,
  ChevronDown,
  Info,
  X,
  FileImage,
  Sparkle,
  Sun,
  Moon,
  Film,
  Languages
} from "lucide-react";

export default function App() {
  // State from LocalStorage falls back to constants
  const [photos, setPhotos] = useState<Photo[]>(() => {
    const saved = localStorage.getItem("family_photos");
    return saved ? JSON.parse(saved) : DEFAULT_PHOTOS;
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("family_album_language");
    return (saved === "ar" || saved === "en") ? saved : "ar";
  });

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("family_album_theme");
    return (saved === "dark" || saved === "light") ? saved : "light";
  });

  // Sync theme selection to document element for perfect styling compliance
  useEffect(() => {
    localStorage.setItem("family_album_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Sync language selection to localStorage
  useEffect(() => {
    localStorage.setItem("family_album_language", language);
    // Set appropriate document dir for clean RTL/LTR layout transitions
    document.documentElement.setAttribute("dir", language === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const [albums, setAlbums] = useState<Album[]>(() => {
    const saved = localStorage.getItem("family_albums");
    return saved ? JSON.parse(saved) : DEFAULT_ALBUMS;
  });

  const [members, setMembers] = useState<FamilyMember[]>(() => {
    return DEFAULT_MEMBERS; // Family tree configurations
  });

  // Filtering states
  const [activeAlbumId, setActiveAlbumId] = useState<string>("all");
  const [selectedMemberName, setSelectedMemberName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<ViewMode>("polaroid");

  // Interaction controls
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [enlargedPhoto, setEnlargedPhoto] = useState<Photo | null>(null);
  const [activeTab, setActiveTab] = useState<"photos" | "storybook">("photos");

  // AI loading indicator specifically for captions
  const [generatingCaptionId, setGeneratingCaptionId] = useState<string | null>(null);

  const t = translations[language];
  const isAr = language === "ar";

  // Sync photos and albums with LocalStorage for flawless persistent client state
  useEffect(() => {
    localStorage.setItem("family_photos", JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem("family_albums", JSON.stringify(albums));
  }, [albums]);

  // Handler to add a new photo
  const handleAddPhoto = (newPhoto: Omit<Photo, "id" | "rotation">) => {
    const photoWithId: Photo = {
      ...newPhoto,
      id: `photo_${Date.now()}`,
      rotation: Math.floor(Math.random() * 14) - 7, // Skew rotation [-7, 7]
    };
    setPhotos((prev) => [photoWithId, ...prev]);
  };

  // Handler to add a new album
  const handleAddAlbum = (newAlbum: Omit<Album, "id">) => {
    const albumWithId: Album = {
      ...newAlbum,
      id: `album_${Date.now()}`,
    };
    setAlbums((prev) => [...prev, albumWithId]);
  };

  // Delete picture
  const handleDeletePhoto = (photoId: string) => {
    if (confirm(t.confirmDelete)) {
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    }
  };

  // Trigger server-side AI captioning
  const handleGenerateCaption = async (photoId: string) => {
    const targetPhoto = photos.find((p) => p.id === photoId);
    if (!targetPhoto) return;

    setGeneratingCaptionId(photoId);
    try {
      const response = await fetch("/api/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: targetPhoto.title,
          description: targetPhoto.description,
          tags: targetPhoto.tags,
          language: language,
        }),
      });

      const data = await response.json();
      if (data.caption) {
        // Update photo details with returned AI caption
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photoId
              ? { ...p, description: data.caption }
              : p
          )
        );

        // Also update enlarged lightbox if currently opened
        if (enlargedPhoto && enlargedPhoto.id === photoId) {
          setEnlargedPhoto((prev) => prev ? { ...prev, description: data.caption } : null);
        }
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error(err);
      alert(isAr ? "عذراً، حدث خطأ تواصل مع راوية الذكاء الاصطناعي لتسجيل التعليق." : "Sorry, an error occurred communicating with the AI content narrator.");
    } finally {
      setGeneratingCaptionId(null);
    }
  };

  // Filter computation
  const filteredPhotos = photos.filter((photo) => {
    const matchesAlbum = activeAlbumId === "all" || photo.albumId === activeAlbumId;
    const matchesMember = !selectedMemberName || photo.tags.includes(selectedMemberName);
    
    // Check search in localized strings as well for maximum user experience
    const localTitle = translatePhotoTitle(photo.id, photo.title, language).toLowerCase();
    const localDesc = translatePhotoDesc(photo.id, photo.description || "", language).toLowerCase();
    const localLoc = translatePhotoLocation(photo.id, photo.location || "", language).toLowerCase();

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      photo.title.toLowerCase().includes(q) ||
      (photo.description && photo.description.toLowerCase().includes(q)) ||
      (photo.location && photo.location.toLowerCase().includes(q)) ||
      localTitle.includes(q) ||
      localDesc.includes(q) ||
      localLoc.includes(q);

    return matchesAlbum && matchesMember && matchesSearch;
  });

  const activeAlbum = albums.find((a) => a.id === activeAlbumId);

  return (
    <div className={`min-h-screen pb-24 transition-colors duration-300 selection:bg-amber-100 selection:text-amber-900 ${
      theme === "dark" ? "bg-stone-950 text-stone-100" : "bg-[#faf8f5] text-stone-800"
    }`}>
      
      {/* HEADER SECTION WITH SCRAPBOOK DESIGN MOTIFS */}
      <header className={`relative border-b pb-8 pt-8 overflow-hidden transition-colors duration-300 ${
        theme === "dark" ? "bg-stone-900/40 border-stone-800" : "bg-[#f5f2eb] border-stone-200/60"
      }`}>
        {/* Subtle background grids */}
        <div className="absolute inset-x-0 bottom-0 top-0 bg-transparent bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.06] pointer-events-none" />
        
        {/* Decorative photo clip on top corner */}
        <div className="absolute -top-12 left-10 w-24 h-24 bg-amber-800/10 rounded-full blur-2xl pointer-events-none" />

        <div className={`container mx-auto px-4 max-w-7xl relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 ${isAr ? "md:flex-row" : "md:flex-row-reverse"}`}>
          {/* Brand/Heading block */}
          <div className={`text-center space-y-2 ${isAr ? "md:text-right" : "md:text-left"}`}>
            <div className={`flex items-center justify-center gap-2.5 ${isAr ? "md:justify-start" : "md:justify-end"}`}>
              <span className="text-xs bg-amber-800 text-amber-50 px-2.5 py-1 rounded font-mono font-bold tracking-wider rounded-sm shadow-sm select-none">
                {isAr ? "ألبوم العائلة الذكي" : "FAMILY ALBUM STUDIO"}
              </span>
              <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
            </div>

            <h1 className={`text-3xl md:text-4xl font-bold font-display tracking-tight mt-2 transition-colors ${
              theme === "dark" ? "text-white" : "text-stone-900"
            }`}>
              {t.appName}
            </h1>
            <p className={`text-xs italic max-w-md font-serif ${
              theme === "dark" ? "text-stone-400" : "text-stone-500"
            }`}>
              "{t.appSlogan}"
            </p>
          </div>

          {/* Core configuration buttons */}
          <div className="flex items-center gap-3 md:gap-3.5 flex-wrap">
            {/* Language toggle controller button */}
            <button
              onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              className={`p-2.5 rounded text-xs font-semibold shadow-sm border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                theme === "dark" 
                  ? "bg-stone-850 hover:bg-stone-800 text-amber-500 border-stone-700" 
                  : "bg-white hover:bg-stone-50 text-stone-700 border-stone-200"
              }`}
              title={isAr ? "Switch to English translation" : "التحويل للغة العربية"}
            >
              <Languages className="w-4 h-4 text-amber-600" />
              <span className="font-sans text-[10px]">
                {t.btnLangToggle}
              </span>
            </button>

            {/* Theme switch controller button */}
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className={`p-2.5 rounded text-xs font-semibold shadow-sm border flex items-center justify-center gap-1 cursor-pointer transition-all ${
                theme === "dark" 
                  ? "bg-stone-850 hover:bg-stone-800 text-amber-400 border-stone-700" 
                  : "bg-white hover:bg-stone-50 text-stone-700 border-stone-200"
              }`}
              title={theme === "light" ? "تفعيل الوضع المظلم" : "تفعيل الوضع المضيء"}
            >
              {theme === "light" ? <Moon className="w-4 h-4 text-stone-605" /> : <Sun className="w-4 h-4 text-amber-450" />}
              <span className="hidden sm:inline font-sans text-[10px]">
                {theme === "light" ? t.themeDark : t.themeLight}
              </span>
            </button>

            <button
              onClick={() => setIsAlbumModalOpen(true)}
              className={`px-4 py-2.5 rounded text-xs font-semibold shadow-sm border flex items-center gap-1.5 cursor-pointer transition-all ${
                theme === "dark"
                  ? "bg-stone-800 hover:bg-stone-750 text-stone-200 border-stone-750"
                  : "bg-white hover:bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300"
              }`}
            >
              <span>{t.btnNewAlbum}</span>
              <Plus className="w-4 h-4 text-stone-500" />
            </button>

            <button
              onClick={() => setIsPhotoModalOpen(true)}
              className="px-5 py-2.5 rounded bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer transform active:scale-95 transition"
            >
              <span>{t.btnNewPhoto}</span>
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* FILTER & CONTROL PANEL BLOCK */}
      <section className="container mx-auto px-4 max-w-7xl mt-8">
        <div className={`p-5 rounded-lg border shadow-md space-y-6 transition-colors duration-300 ${
          theme === "dark" ? "bg-stone-900 border-stone-800/80 text-stone-100" : "bg-white border-stone-200/80 text-stone-800"
        }`}>
          
          {/* 1. Family tree shortcut filters (Click to filter by person) */}
          <div className="space-y-2.5">
            <div className={`flex items-center gap-2 select-none ${isAr ? "flex-row" : "flex-row-reverse"} ${theme === "dark" ? "text-stone-300" : "text-stone-600"}`}>
              <Users className="w-4 h-4 text-amber-700 shrink-0" />
              <h4 className="text-xs font-bold font-sans tracking-wide">{t.filterTitle}</h4>
            </div>

            <div className={`flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin ${isAr ? "justify-start" : ""}`}>
              <button
                onClick={() => setSelectedMemberName(null)}
                className={`px-4 py-1.5 text-xs rounded-full cursor-pointer transition shrink-0 ${
                  selectedMemberName === null
                    ? "bg-amber-700 text-white shadow-sm font-semibold"
                    : theme === "dark"
                    ? "bg-stone-800 hover:bg-stone-700 text-stone-300"
                    : "bg-stone-100 hover:bg-stone-200 text-stone-600"
                }`}
              >
                {t.allPhotos}
              </button>
              {members.map((member) => {
                const isActive = selectedMemberName === member.name;
                return (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMemberName(member.name)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs cursor-pointer transition shrink-0 border ${
                      isActive
                        ? "bg-amber-50 dark:bg-amber-950/30 border-amber-500 text-amber-900 dark:text-amber-300 font-semibold shadow-sm"
                        : theme === "dark"
                        ? "bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800"
                        : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${member.avatarColor}`} />
                    <span>{translateMemberName(member.name, language)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Album list selector and search toolbar */}
          <div className={`flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 border-t pt-5 ${
            isAr ? "lg:flex-row" : "lg:flex-row-reverse"
          } ${
            theme === "dark" ? "border-stone-800" : "border-stone-100"
          }`}>
            
            {/* Albums divisions lists */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveAlbumId("all")}
                className={`px-4.5 py-2 rounded text-xs tracking-wide cursor-pointer font-semibold transition shrink-0 ${
                  activeAlbumId === "all"
                    ? "bg-[#d4973b] text-stone-950 shadow-md"
                    : theme === "dark"
                    ? "bg-stone-800/80 hover:bg-stone-800 text-stone-300"
                    : "bg-stone-100/60 hover:bg-stone-100 text-stone-600"
                }`}
              >
                {t.allCount} ({photos.length})
              </button>
              
              {albums.map((alb) => {
                const count = photos.filter((p) => p.albumId === alb.id).length;
                return (
                  <button
                    key={alb.id}
                    onClick={() => setActiveAlbumId(alb.id)}
                    className={`px-4.5 py-2 rounded text-xs cursor-pointer transition shrink-0 font-medium ${
                      activeAlbumId === alb.id
                        ? "bg-amber-700 text-white shadow-md font-semibold"
                        : theme === "dark"
                        ? "bg-stone-850/70 border border-stone-800 hover:bg-stone-800 text-stone-300"
                        : "bg-[#f5f2eb]/60 hover:bg-[#f5f2eb] border border-stone-200/50 text-stone-700"
                    }`}
                  >
                    {translateAlbumTitle(alb.id, alb.title, language)} ({count})
                  </button>
                );
              })}
            </div>

            {/* Keyword Search tool */}
            <div className="relative w-full lg:max-w-xs shrink-0">
              <span className={`absolute inset-y-0 ${isAr ? "right-3" : "left-3"} flex items-center pointer-events-none`}>
                <Search className="w-4 h-4 text-stone-400" />
              </span>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full text-xs py-2.5 rounded focus:ring-1 focus:ring-amber-500 outline-none transition-colors ${
                  isAr ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"
                } ${
                  theme === "dark" 
                    ? "bg-stone-950 border-stone-800 text-stone-100 placeholder-stone-550" 
                    : "bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400"
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`absolute inset-y-0 ${isAr ? "left-2.5" : "right-2.5"} flex items-center text-stone-400 hover:text-stone-750`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 3. Layout modes and display overview description */}
          <div className={`border-t pt-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none ${
            isAr ? "md:flex-row" : "md:flex-row-reverse"
          } ${
            theme === "dark" ? "border-stone-800" : "border-stone-100"
          }`}>
            
            {/* Active Album Description brief info */}
            <div className={`flex-1 ${isAr ? "text-right" : "text-left"}`}>
              {activeAlbumId !== "all" && activeAlbum ? (
                <div className="space-y-1">
                  <h3 className={`text-sm font-bold font-serif flex items-center gap-1.5 ${isAr ? "flex-row" : "flex-row-reverse"} ${
                    theme === "dark" ? "text-amber-400" : "text-amber-900"
                  }`}>
                    <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{t.albumLabel} {translateAlbumTitle(activeAlbum.id, activeAlbum.title, language)}</span>
                    <span className="text-[10px] font-mono font-semibold text-stone-450 dark:text-stone-500">({activeAlbum.period})</span>
                  </h3>
                  <p className={`text-xs leading-relaxed max-w-xl italic ${
                    theme === "dark" ? "text-stone-400" : "text-stone-505"
                  }`}>
                    "{translateAlbumDesc(activeAlbum.id, activeAlbum.description, language)}"
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <h3 className={`text-sm font-bold ${theme === "dark" ? "text-stone-200" : "text-stone-700"}`}>{t.allAlbumsArchive}</h3>
                  <p className={`text-xs font-serif ${theme === "dark" ? "text-stone-500" : "text-stone-400"}`}>{t.allAlbumsSubtitle}</p>
                </div>
              )}
            </div>

            {/* Layout mode switcher buttons */}
            <div className={`flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-1 rounded border overflow-x-auto w-full md:w-auto ${
              theme === "dark" ? "border-stone-800" : "border-stone-200"
            }`}>
              {(["polaroid", "masonry", "timeline", "carousel", "video-maker", "photo-studio"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setCurrentView(mode);
                    setActiveTab("photos");
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs rounded transition shrink-0 font-medium cursor-pointer ${
                    currentView === mode && activeTab === "photos"
                      ? "bg-[#9a3412] dark:bg-amber-700 text-white shadow-sm font-semibold"
                      : "text-stone-500 hover:text-stone-800 hover:bg-stone-50/50 dark:hover:bg-stone-850"
                  }`}
                >
                  {mode === "polaroid" && <span>{t.layoutPolaroid}</span>}
                  {mode === "masonry" && <span>{t.layoutCollage}</span>}
                  {mode === "timeline" && <span>{t.layoutTimeline}</span>}
                  {mode === "carousel" && <span>{t.layoutCarousel}</span>}
                  {mode === "video-maker" && (
                    <span className="flex items-center gap-1">
                      {t.layoutVideoMaker}
                      <span className="text-[9px] px-1 bg-amber-600 dark:bg-amber-950 text-white rounded text-[7px] scale-90">
                        {isAr ? "موسيقى" : "Music"}
                      </span>
                    </span>
                  )}
                  {mode === "photo-studio" && (
                    <span className="flex items-center gap-1 animate-pulse font-bold text-amber-700 dark:text-amber-500">
                      {t.layoutPhotoStudio}
                    </span>
                  )}
                </button>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* CORE DISPLAY STAGE (Depends on current Layout state selection) */}
      <main className="container mx-auto px-4 max-w-7xl mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentView}-${activeAlbumId}-${selectedMemberName}-${searchQuery}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            {currentView === "photo-studio" ? (
              <PhotoStudio
                photos={photos}
                setPhotos={setPhotos}
                albums={albums}
                members={members}
                language={language}
                theme={theme}
              />
            ) : filteredPhotos.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800 rounded-lg shadow-sm max-w-lg mx-auto flex flex-col items-center space-y-4">
                <FileImage className="w-12 h-12 text-stone-300 dark:text-stone-700" />
                <h3 className="text-base font-bold text-stone-700 dark:text-stone-300">
                  {isAr ? "لم يتم العثور على ذكريات عائلية" : "No Family Memories Found"}
                </h3>
                <p className="text-xs text-stone-400 px-8 leading-relaxed max-w-sm">
                  {t.noPhotosFound}
                </p>
                <button
                  onClick={() => {
                    setActiveAlbumId("all");
                    setSelectedMemberName(null);
                    setSearchQuery("");
                  }}
                  className="px-4 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded text-stone-700 dark:text-stone-300 text-xs font-semibold tracking-wide border border-stone-200 dark:border-stone-700 cursor-pointer"
                >
                  {isAr ? "تصفير الفلاتر" : "Reset Filters"}
                </button>
              </div>
            ) : (
              <>
                {/* 1. MASONRY COLLAGE VIEW */}
                {currentView === "masonry" && (
                  <CollageMasonry
                    photos={filteredPhotos}
                    onDeletePhoto={handleDeletePhoto}
                    onEnlarge={setEnlargedPhoto}
                    language={language}
                  />
                )}

                {/* 2. POLAROID GRID VIEW WITH SKEW ROTATIONS */}
                {currentView === "polaroid" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {filteredPhotos.map((photo) => (
                      <PolaroidCard
                        key={photo.id}
                        photo={photo}
                        onGenerateCaption={handleGenerateCaption}
                        onDeletePhoto={handleDeletePhoto}
                        isGenerating={generatingCaptionId === photo.id}
                        onEnlarge={setEnlargedPhoto}
                        language={language}
                      />
                    ))}
                  </div>
                )}

                {/* 3. CHRONOLOGICAL TIMELINE VIEW */}
                {currentView === "timeline" && (
                  <ChronologicalTimeline
                    photos={filteredPhotos}
                    onEnlarge={setEnlargedPhoto}
                    language={language}
                  />
                )}

                {/* 4. IMMERSIVE THEATER CAROUSEL VIEW WITH AUDIO SLIDESHOW */}
                {currentView === "carousel" && (
                  <FocusedCarousel
                    photos={filteredPhotos}
                    onGenerateCaption={handleGenerateCaption}
                    isGeneratingStory={generatingCaptionId !== null}
                    language={language}
                  />
                )}

                {/* 5. INTERACTIVE FILM MAKER / MOVIE PRESENTER */}
                {currentView === "video-maker" && (
                  <VideoMaker
                    photos={filteredPhotos}
                    theme={theme}
                    language={language}
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* STORYBOOK COMPILATION CONTAINER (Cozy storytelling section) */}
      {filteredPhotos.length > 0 && (
        <section className="container mx-auto px-4 max-w-7xl mt-16">
          <AiStoryBook photos={filteredPhotos} activeAlbum={activeAlbum} language={language} />
        </section>
      )}

      {/* LIGHTBOX / ENLARGED PHOTO DETAILS DIALOG */}
      <AnimatePresence>
        {enlargedPhoto && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`bg-stone-900 border border-stone-800 text-stone-100 rounded-lg max-w-4xl w-full overflow-hidden flex flex-col md:flex-row shadow-2xl relative my-8 ${
                isAr ? "text-right" : "text-left"
              }`}
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
            >
              {/* Close pin */}
              <button
                onClick={() => setEnlargedPhoto(null)}
                className={`absolute top-4 ${isAr ? "left-4" : "right-4"} bg-black/60 backdrop-blur p-1.5 rounded-full text-white/80 hover:text-white z-40 cursor-pointer`}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Viewport block */}
              <div className="flex-1 bg-black flex items-center justify-center p-6 min-h-[300px] md:max-h-[550px]">
                <img
                  src={enlargedPhoto.src}
                  alt={translatePhotoTitle(enlargedPhoto.id, enlargedPhoto.title, language)}
                  className="max-h-full max-w-full object-contain rounded shadow pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Informative details block */}
              <div className={`w-full md:w-[350px] p-6 bg-stone-900 flex flex-col justify-between border-t md:border-t-0 ${isAr ? "md:border-r" : "md:border-l"} border-stone-800`}>
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] text-amber-500 font-mono tracking-widest block uppercase mb-1">
                      {isAr ? "تفاصيل وعمق الذكرى" : "Nostalgic Memory Details"}
                    </span>
                    <h3 className="text-xl font-bold font-serif leading-tight">
                      {translatePhotoTitle(enlargedPhoto.id, enlargedPhoto.title, language)}
                    </h3>
                  </div>

                  <p className={`text-stone-300 text-xs leading-relaxed italic border-amber-500/50 ${isAr ? "border-r-2 pr-2" : "border-l-2 pl-2"}`}>
                    "{translatePhotoDesc(enlargedPhoto.id, enlargedPhoto.description, language) || (isAr ? "لا يوجد قصة تفصيلية مرافقة لهذه الصورة العائلية في الألبوم بعد." : "No detailed narrative recorded for this photo yet.")}"
                  </p>

                  <div className="space-y-3 text-xs text-stone-400">
                    <div className={`flex items-center gap-2.5 bg-black/30 p-2 rounded ${isAr ? "flex-row-reverse text-right" : "flex-row"}`}>
                      <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{enlargedPhoto.date || enlargedPhoto.year}</span>
                    </div>

                    {enlargedPhoto.location && (
                      <div className={`flex items-center gap-2.5 bg-black/30 p-2 rounded ${isAr ? "flex-row-reverse text-right" : "flex-row"}`}>
                        <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{translatePhotoLocation(enlargedPhoto.id, enlargedPhoto.location, language)}</span>
                      </div>
                    )}

                    {enlargedPhoto.tags.length > 0 && (
                      <div className="space-y-1.5 mt-2 pt-1">
                        <span className="text-[10px] text-stone-500 block uppercase font-semibold">
                          {isAr ? "المتواجدون في الصورة:" : "Tagged Family members:"}
                        </span>
                        <div className={`flex flex-wrap gap-1 ${isAr ? "justify-start" : ""}`}>
                          {enlargedPhoto.tags.map((tag) => (
                            <span key={tag} className="bg-stone-800 text-stone-200 text-[10px] px-2 py-0.5 border border-stone-700 rounded-full">
                              {translateMemberName(tag, language)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-800 mt-6 flex flex-col gap-2">
                  <button
                    disabled={generatingCaptionId === enlargedPhoto.id}
                    onClick={() => handleGenerateCaption(enlargedPhoto.id)}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded text-xs font-semibold tracking-wide shadow flex items-center justify-center gap-1.5 hover:from-amber-700 hover:to-amber-800 cursor-pointer"
                  >
                    <Sparkle className={`w-3.5 h-3.5 ${generatingCaptionId === enlargedPhoto.id ? "animate-spin" : ""}`} />
                    {generatingCaptionId === enlargedPhoto.id 
                      ? (isAr ? "جاري التوليد..." : "AI Weaving...") 
                      : (isAr ? "صياغة قصة دافئة بالذكاء الاصطناعي (AI)" : "Draft Warm AI Story ✨")
                    }
                  </button>
                  <button
                    onClick={() => setEnlargedPhoto(null)}
                    className="w-full py-2 text-stone-400 hover:text-white rounded text-xs cursor-pointer"
                  >
                    {isAr ? "إغلاق نافذة العرض" : "Close Viewer"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEW PHOTO ADDITION DIALOG DRAWER */}
      <AddPhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        albums={albums}
        members={members}
        onAddPhoto={handleAddPhoto}
        language={language}
      />

      {/* NEW ALBUM GENERATION MODAL DIALOG */}
      <AddAlbumModal
        isOpen={isAlbumModalOpen}
        onClose={() => setIsAlbumModalOpen(false)}
        onAddAlbum={handleAddAlbum}
        language={language}
      />

    </div>
  );
}
