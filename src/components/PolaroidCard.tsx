import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Photo } from "../types";
import { Sparkles, MapPin, Calendar, Users, Info, RotateCw, Trash2 } from "lucide-react";
import { Language, translatePhotoTitle, translatePhotoDesc, translatePhotoLocation, translateMemberName } from "../localization";

interface PolaroidCardProps {
  key?: string;
  photo: Photo;
  onGenerateCaption: (photoId: string) => Promise<void>;
  onDeletePhoto: (photoId: string) => void;
  isGenerating: boolean;
  onEnlarge: (photo: Photo) => void;
  language: Language;
}

export default function PolaroidCard({
  photo,
  onGenerateCaption,
  onDeletePhoto,
  isGenerating,
  onEnlarge,
  language,
}: PolaroidCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Map rotation from index/id to render slightly skewed
  const skewClass = `rotate-[${photo.rotation}deg]`;

  const isAr = language === "ar";

  return (
    <div className="relative w-full max-w-[290px] mx-auto aspect-[3/4] perspective-1000 group">
      <motion.div
        className="relative w-full h-full duration-700 preserve-3d"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* FRONT OF THE POLAROID */}
        <div
          className="absolute inset-0 w-full h-full bg-white p-4 shadow-xl border border-stone-200 flex flex-col rounded-sm"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Paper Tape Mask */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-amber-100/50 backdrop-blur-[1px] border border-stone-200/40 rotate-[2deg] shadow-sm z-30 pointer-events-none before:content-[''] before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-stone-300/30 before:border-r before:border-stone-400/20 after:content-[''] after:absolute after:inset-y-0 after:right-0 after:w-1 after:bg-stone-300/30 after:border-l after:border-stone-400/20" />

          {/* Image viewport */}
          <div
            onClick={() => onEnlarge(photo)}
            className="relative flex-1 bg-stone-900 border border-stone-100 overflow-hidden cursor-zoom-in group/img"
          >
            <img
              src={photo.src}
              alt={translatePhotoTitle(photo.id, photo.title, language)}
              className="w-full h-full object-cover grayscale-[15%] group-hover/img:grayscale-0 group-hover/img:scale-105 transition-all duration-500"
              referrerPolicy="no-referrer"
            />
            
            {/* Quick Location Badge overlay */}
            {photo.location && (
              <span className={`absolute bottom-2 ${isAr ? "right-2" : "left-2"} bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-[2px] flex items-center gap-1`}>
                <MapPin className="w-2.5 h-2.5 text-amber-400" />
                {translatePhotoLocation(photo.id, photo.location, language)}
              </span>
            )}
          </div>

          {/* Caption Area (Handwritten style) */}
          <div className="pt-4 pb-2 px-1 flex flex-col justify-between select-none">
            <h3 className="font-handwritten text-xl text-stone-800 tracking-wide text-center truncate line-clamp-1">
              {translatePhotoTitle(photo.id, photo.title, language)}
            </h3>
            
            <div className={`mt-2 flex items-center justify-between border-t border-stone-100 pt-2 text-[10px] text-stone-400 ${isAr ? "flex-row" : "flex-row-reverse"}`}>
              <span>{photo.year}</span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFlipped(true)}
                  className="p-1 hover:text-amber-700 transition"
                  title={isAr ? "تفاصيل الذاكرة" : "Show memory details"}
                >
                  <Info className="w-4 h-4 text-stone-500 hover:text-amber-600 transition-colors" />
                </button>
                <button
                  onClick={() => onDeletePhoto(photo.id)}
                  className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                  title={isAr ? "حذف من المجلد" : "Remove from Album"}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BACK OF THE POLAROID */}
        <div
          className="absolute inset-0 w-full h-full bg-stone-50 p-5 shadow-xl border-2 border-stone-200/80 rounded-md flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Note book line patterns */}
          <div className="absolute inset-x-0 top-12 bottom-16 bg-lines pointer-events-none opacity-40 z-0" />

          <div className="relative z-10 flex flex-col h-full justify-between">
            {/* Back Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <span className="text-xs font-semibold text-stone-600 tracking-wider uppercase font-mono">
                {isAr ? "مذكرات عائلية" : "Memory Notes"}
              </span>
              <button
                onClick={() => setIsFlipped(false)}
                className="flex items-center gap-1 text-[10px] bg-stone-200/60 hover:bg-stone-200 px-2 py-0.5 rounded text-stone-700 transition"
              >
                <RotateCw className="w-2.5 h-2.5" />
                {isAr ? "الواجهة" : "Front"}
              </button>
            </div>

            {/* Content lines */}
            <div className={`flex-1 my-4 flex flex-col justify-start gap-3 overflow-y-auto text-xs text-stone-700 pr-1 ${isAr ? "text-right" : "text-left"}`}>
              {/* Description */}
              <div>
                <p className={`italic text-stone-600 leading-relaxed font-serif ${isAr ? "pr-1 border-r-2" : "pl-1 border-l-2"} border-amber-500/40`}>
                  "{translatePhotoDesc(photo.id, photo.description, language) || (isAr ? "لا يوجد وصف لهذه اللحظة بعد..." : "No description yet...")}"
                </p>
              </div>

              {/* Date & Location */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-stone-200/60 font-mono text-[10px] text-stone-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>{photo.date || photo.year}</span>
                </div>
                {photo.location ? (
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span className="truncate" title={translatePhotoLocation(photo.id, photo.location, language)}>
                      {translatePhotoLocation(photo.id, photo.location, language)}
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Tagged Family Members */}
              {photo.tags.length > 0 && (
                <div className="mt-2 pt-1">
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-stone-500 mb-1">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isAr ? "موجود في اللحظة:" : "Present in moment:"}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {photo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-stone-200/70 border border-stone-300/40 text-stone-800 text-[9px] px-1.5 py-0.5 rounded-full font-sans font-medium"
                      >
                        {translateMemberName(tag, language)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Assistant footer */}
            <div className="border-t border-stone-200 pt-3">
              <button
                disabled={isGenerating}
                onClick={() => onGenerateCaption(photo.id)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded text-xs font-semibold shadow-sm hover:from-amber-700 hover:to-amber-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                {isGenerating 
                  ? (isAr ? "جاري صياغة تعليق..." : "Weaving caption...") 
                  : (isAr ? "اكتب تعليق ذكي (AI)" : "Draft AI Caption ✨")
                }
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
