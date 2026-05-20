import React from "react";
import { Photo } from "../types";
import { motion } from "motion/react";
import { MapPin, Calendar, Camera, Trash2, ZoomIn } from "lucide-react";
import { Language, translatePhotoTitle, translatePhotoDesc, translatePhotoLocation, translateMemberName } from "../localization";

interface CollageMasonryProps {
  photos: Photo[];
  onDeletePhoto: (photoId: string) => void;
  onEnlarge: (photo: Photo) => void;
  language: Language;
}

export default function CollageMasonry({
  photos,
  onDeletePhoto,
  onEnlarge,
  language,
}: CollageMasonryProps) {
  // Helper to determine tailwind classes based on size definitions
  const getSizeClasses = (size: "small" | "medium" | "large") => {
    switch (size) {
      case "small":
        return "col-span-1 row-span-1 md:h-64";
      case "large":
        return "col-span-1 md:col-span-2 row-span-2 md:h-[480px]";
      case "medium":
      default:
        return "col-span-1 md:col-span-1 row-span-2 md:h-96";
    }
  };

  const isAr = language === "ar";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
      {photos.map((photo, index) => {
        const sizeClass = getSizeClasses(photo.size);

        return (
          <motion.div
            key={photo.id}
            layoutId={`photo-collage-${photo.id}`}
            className={`${sizeClass} relative bg-stone-50 border border-stone-200 p-4 shadow-lg flex flex-col justify-between overflow-hidden group hover:shadow-2xl transition-shadow duration-500 rounded`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {/* Scrapbook Photo Corners */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-stone-400 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-stone-400 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-stone-400 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-stone-400 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* Inner frame wrapper */}
            <div className="relative flex-1 bg-stone-900 border border-stone-300 rounded overflow-hidden z-10">
              <img
                src={photo.src}
                alt={translatePhotoTitle(photo.id, photo.title, language)}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay with details on hover */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20 ${isAr ? "text-right" : "text-left"}`}>
                <p className="text-white font-semibold flex items-center gap-1.5 text-sm mb-1 font-serif">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  {translatePhotoTitle(photo.id, photo.title, language)}
                </p>
                <p className="text-stone-300 text-xs line-clamp-2 italic mb-3">
                  "{translatePhotoDesc(photo.id, photo.description, language) || (isAr ? "لا يوجد وصف لهذه الذكرى العائلية..." : "No description for this memory yet...")}"
                </p>

                <div className={`flex justify-between items-center bg-black/40 p-2 rounded backdrop-blur-sm ${isAr ? "flex-row" : "flex-row-reverse"}`}>
                  {photo.location ? (
                    <span className="text-[10px] text-amber-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {translatePhotoLocation(photo.id, photo.location, language)}
                    </span>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEnlarge(photo);
                    }}
                    className="p-1.5 bg-amber-600 hover:bg-amber-500 rounded text-white transition"
                    title={isAr ? "تكبير الصورة" : "Enlarge Image"}
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom details strip (scannable of default state) */}
            <div className={`mt-3 flex items-center justify-between text-xs text-stone-600 font-medium z-10 ${isAr ? "flex-row" : "flex-row-reverse"}`}>
              <div className="flex items-center gap-2">
                <span className="font-mono bg-stone-200/60 text-stone-800 text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                  <Calendar className="w-3 h-3 text-stone-500" />
                  {photo.year}
                </span>

                {/* Tags bubble list summary */}
                <div className="hidden lg:flex gap-1">
                  {photo.tags.slice(0, 2).map((t) => (
                    <span key={t} className="text-[9px] bg-stone-100 text-stone-500 px-1 border border-stone-200 rounded">
                      {translateMemberName(t, language)}
                    </span>
                  ))}
                  {photo.tags.length > 2 && (
                    <span className="text-[9px] bg-stone-100 text-stone-400 px-1 rounded">
                      +{photo.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => onDeletePhoto(photo.id)}
                className="text-stone-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
