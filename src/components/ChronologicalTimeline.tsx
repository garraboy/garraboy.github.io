import React from "react";
import { Photo } from "../types";
import { motion } from "motion/react";
import { Calendar, MapPin, ZoomIn } from "lucide-react";
import { Language, translatePhotoTitle, translatePhotoDesc, translatePhotoLocation, translateMemberName } from "../localization";

interface ChronologicalTimelineProps {
  photos: Photo[];
  onEnlarge: (photo: Photo) => void;
  language: Language;
}

export default function ChronologicalTimeline({
  photos,
  onEnlarge,
  language,
}: ChronologicalTimelineProps) {
  // Sort photos chronologically by year/date
  const sortedPhotos = [...photos].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : a.year;
    const dateB = b.date ? new Date(b.date).getTime() : b.year;
    return dateA - dateB;
  });

  const isAr = language === "ar";

  return (
    <div className="relative max-w-4xl mx-auto py-8 px-4">
      {/* Central Timeline Spine line */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-800/10 via-amber-800/20 to-amber-800/5" />

      {sortedPhotos.length === 0 ? (
        <div className="text-center text-stone-400 py-12">
          {isAr ? "لا توجد صور لعرضها على الخط الزمني بعد." : "No pictures to display on public timeline yet."}
        </div>
      ) : (
        <div className="space-y-16">
          {sortedPhotos.map((photo, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={photo.id}
                className={`relative flex flex-col md:flex-row items-center gap-8 ${
                  isEven ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Center Node dot indicator */}
                <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-stone-50 border-4 border-amber-800/30 flex items-center justify-center z-13 shadow-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-700 animate-pulse" />
                </div>

                {/* Left/Right Side Content Column */}
                <div className="w-full md:w-1/2 flex justify-center">
                  <motion.div
                    className="w-full max-w-sm bg-white p-4 rounded-lg shadow-md border border-stone-100 hover:shadow-xl transition-shadow flex flex-col justify-between"
                    initial={{ opacity: 0, x: isEven ? 30 : -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Event Year Header */}
                    <div className={`flex items-center justify-between mb-3 border-b border-stone-100 pb-2 ${isAr ? "flex-row-reverse" : ""}`}>
                      <span className="text-sm font-bold font-mono text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
                        {photo.year}
                      </span>
                      <span className="text-[10px] text-stone-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        {photo.date || (isAr ? "غير محدد" : "Not specified")}
                      </span>
                    </div>

                    {/* Image Box */}
                    <div
                      onClick={() => onEnlarge(photo)}
                      className="relative rounded-md overflow-hidden aspect-[1.5/1] bg-stone-900 border border-stone-50 group cursor-zoom-in"
                    >
                      <img
                        src={photo.src}
                        alt={translatePhotoTitle(photo.id, photo.title, language)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/90 text-stone-800 text-xs py-1 px-2.5 rounded shadow flex items-center gap-1">
                          <ZoomIn className="w-3.5 h-3.5" />
                          {isAr ? "عرض التفاصيل" : "View Details"}
                        </span>
                      </div>
                    </div>

                    {/* Title and Short Narrative */}
                    <div className={`mt-3 ${isAr ? "text-right" : "text-left"}`}>
                      <h4 className="text-stone-800 font-bold text-sm mb-1 line-clamp-1">
                        {translatePhotoTitle(photo.id, photo.title, language)}
                      </h4>
                      <p className="text-stone-500 text-xs pl-1 italic">
                        "{translatePhotoDesc(photo.id, photo.description, language) || (isAr ? "لا توجد تفاصيل لهذه اللحظة الدافئة." : "No narrative recorded for this heartwarming moment.")}"
                      </p>
                    </div>

                    {/* Footer tags and location */}
                    <div className={`mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] ${isAr ? "flex-row-reverse" : ""}`}>
                      {photo.location ? (
                        <span className="text-stone-400 flex items-center gap-1 max-w-[150px] truncate" title={translatePhotoLocation(photo.id, photo.location, language)}>
                          <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                          {translatePhotoLocation(photo.id, photo.location, language)}
                        </span>
                      ) : (
                        <span />
                      )}

                      <div className="flex flex-wrap gap-1 justify-end max-w-[180px]">
                        {photo.tags.slice(0, 2).map((t) => (
                          <span key={t} className="bg-stone-50 border border-stone-200 text-stone-600 text-[8px] px-1.5 py-0.5 rounded">
                            {translateMemberName(t, language)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Empty columns for layout offset spacing */}
                <div className="hidden md:block w-1/2" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
