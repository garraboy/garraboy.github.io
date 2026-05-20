import React, { useState, useEffect } from "react";
import { Photo } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Play, Pause, MapPin, Calendar, Users, Sparkles } from "lucide-react";
import { Language, translatePhotoTitle, translatePhotoDesc, translatePhotoLocation, translateMemberName } from "../localization";

interface FocusedCarouselProps {
  photos: Photo[];
  onGenerateCaption: (photoId: string) => Promise<void>;
  isGeneratingStory: boolean;
  language: Language;
}

export default function FocusedCarousel({
  photos,
  onGenerateCaption,
  isGeneratingStory,
  language,
}: FocusedCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const isAr = language === "ar";

  // Auto-play interval handling for presentation
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && photos.length > 0) {
      interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % photos.length);
      }, 5000); // Change photo every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, photos.length]);

  if (photos.length === 0) {
    return (
      <div className="text-center text-stone-400 py-16 font-serif">
        {isAr ? "لا توجد صور لعرضها في المعرض المركز." : "No pictures found for theater showcase."}
      </div>
    );
  }

  const currentPhoto = photos[activeIndex];

  const handleNext = () => {
    setIsPlaying(false);
    setActiveIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="max-w-6xl mx-auto bg-stone-900 text-stone-100 rounded-xl shadow-2xl overflow-hidden border border-stone-800">
      {/* Immersive Layout Header with player control */}
      <div className={`bg-stone-950 px-6 py-4 border-b border-stone-800/80 flex items-center justify-between ${isAr ? "flex-row-reverse" : "flex-row"}`}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-mono tracking-wider text-stone-400 uppercase">
            {isAr ? "مسرح الذكريات السينمائي" : "Theater Mode"}
          </span>
        </div>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition ${
            isPlaying
              ? "bg-amber-600 text-white hover:bg-amber-700"
              : "bg-stone-800 text-stone-200 hover:bg-stone-700"
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>{isAr ? "إيقاف مؤقت" : "Pause autoplay"}</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-4 text-white" />
              <span>{isAr ? "عرض تلقائي" : "Autoplay"}</span>
            </>
          )}
        </button>
      </div>

      <div className={`flex flex-col h-auto min-h-[500px] ${isAr ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
        {/* Cinema viewport Column */}
        <div className="relative flex-1 bg-stone-950 flex items-center justify-center p-6 border-b lg:border-b-0 lg:border-r border-stone-800">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhoto.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5 }}
              className="relative max-h-[460px] aspect-[4/3] w-full rounded-md overflow-hidden bg-black shadow-inner flex items-center justify-center border border-stone-800/50"
            >
              <img
                src={currentPhoto.src}
                alt={translatePhotoTitle(currentPhoto.id, currentPhoto.title, language)}
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />

              {/* Year indicator overlay */}
              <div className={`absolute top-4 ${isAr ? "right-4" : "left-4"} bg-black/75 backdrop-blur px-3 py-1 rounded text-xs font-mono font-bold text-amber-400 border border-amber-500/20`}>
                {currentPhoto.year}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav Controls */}
          <button
            onClick={isAr ? handleNext : handlePrev}
            className={`absolute ${isAr ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 border border-stone-800 text-white transition hover:scale-105`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={isAr ? handlePrev : handleNext}
            className={`absolute ${isAr ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 border border-stone-800 text-white transition hover:scale-105`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Info/History details Column */}
        <div className={`w-full lg:w-[350px] bg-stone-900 p-6 flex flex-col justify-between ${isAr ? "text-right" : "text-left"}`}>
          <div className="space-y-6">
            <div>
              <span className="text-[10px] text-amber-500 font-mono tracking-widest block uppercase mb-1">
                {isAr ? "الذكرى النشطة" : "Active memory"}
              </span>
              <h3 className="text-xl font-bold font-serif text-white hover:text-amber-400 transition-colors">
                {translatePhotoTitle(currentPhoto.id, currentPhoto.title, language)}
              </h3>
            </div>

            {/* Description note */}
            <div>
              <p className={`text-stone-300 text-xs italic leading-relaxed border-amber-500/50 ${isAr ? "border-r-2 pr-3 text-right" : "border-l-2 pl-3 text-left"}`}>
                "{translatePhotoDesc(currentPhoto.id, currentPhoto.description, language) || (isAr ? "لا توجد قصة تفصيلية مرافقة لهذه اللحظة الدافئة." : "No details recorded for this heartwarming photo yet.")}"
              </p>
            </div>

            {/* Structured details list */}
            <div className="space-y-3.5 text-xs font-serif text-stone-400">
              {currentPhoto.date && (
                <div className={`flex items-center gap-3 bg-stone-950/40 p-2.5 rounded border border-stone-800/40 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
                  <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] text-stone-500 block uppercase font-mono">{isAr ? "تاريخ اللقطة" : "Date taken"}</span>
                    <span className="text-stone-200 text-xs">{currentPhoto.date}</span>
                  </div>
                </div>
              )}

              {currentPhoto.location && (
                <div className={`flex items-center gap-3 bg-stone-950/40 p-2.5 rounded border border-stone-800/40 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] text-stone-500 block uppercase font-mono">{isAr ? "الموقع الجغرافي" : "Geographic location"}</span>
                    <span className="text-stone-200 text-xs truncate block" title={translatePhotoLocation(currentPhoto.id, currentPhoto.location, language)}>
                      {translatePhotoLocation(currentPhoto.id, currentPhoto.location, language)}
                    </span>
                  </div>
                </div>
              )}

              {currentPhoto.tags.length > 0 && (
                <div className={`flex items-start gap-3 bg-stone-950/40 p-2.5 rounded border border-stone-800/40 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
                  <Users className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] text-stone-500 block uppercase font-mono">{isAr ? "العائلة الحاضرة" : "Present in moment"}</span>
                    <div className={`flex flex-wrap gap-1 mt-1 ${isAr ? "justify-start" : ""}`}>
                      {currentPhoto.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-stone-800 text-stone-300 text-[10px] px-1.5 py-0.5 rounded border border-stone-700 font-sans"
                        >
                          {translateMemberName(tag, language)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions Bottom */}
          <div className="mt-8 pt-4 border-t border-stone-800 flex flex-col gap-2">
            <button
              disabled={isGeneratingStory}
              onClick={() => onGenerateCaption(currentPhoto.id)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold text-xs shadow-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>{isAr ? "تحسين وتوليد وصف بالذكاء الاصطناعي" : "Re-weave with AI Magic ✨"}</span>
            </button>
            <span className="text-[9px] text-center text-stone-500">
              {isAr 
                ? `صورة رقم ${activeIndex + 1} من إجمالي ${photos.length}` 
                : `Photo ${activeIndex + 1} of ${photos.length}`
              }
            </span>
          </div>
        </div>
      </div>

      {/* Thumbnail Bar Selector */}
      <div className="bg-stone-950 px-6 py-4 border-t border-stone-800 overflow-x-auto flex gap-3 scrollbar-none">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => {
              setIsPlaying(false);
              setActiveIndex(index);
            }}
            className={`relative w-16 h-12 rounded border overflow-hidden shrink-0 transition-all ${
              activeIndex === index
                ? "border-amber-500 scale-105 shadow-md ring-2 ring-amber-500/20"
                : "border-stone-800 opacity-50 hover:opacity-100"
            }`}
          >
            <img src={photo.src} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </button>
        ))}
      </div>
    </div>
  );
}
