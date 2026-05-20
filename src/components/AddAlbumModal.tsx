import React, { useState } from "react";
import { Album } from "../types";
import { X, FolderPlus } from "lucide-react";
import { Language, translations } from "../localization";

interface AddAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAlbum: (album: Omit<Album, "id">) => void;
  language: Language;
}

export default function AddAlbumModal({
  isOpen,
  onClose,
  onAddAlbum,
  language,
}: AddAlbumModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [period, setPeriod] = useState("");

  if (!isOpen) return null;

  const t = translations[language];
  const isAr = language === "ar";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onAddAlbum({
      title,
      description,
      period: period || (isAr ? "مفتوح المدى" : "Open timeframe"),
      coverImage: `https://picsum.photos/seed/family-album-${Date.now()}/800/600`,
    });

    // Reset Form
    setTitle("");
    setDescription("");
    setPeriod("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden flex flex-col ${isAr ? "text-right" : "text-left"}`}>
        {/* Header */}
        <div className={`bg-stone-50 border-b border-stone-200 px-6 py-4 flex items-center justify-between ${isAr ? "flex-row-reverse" : "flex-row"}`}>
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold font-serif text-base text-stone-800">{t.addAlbumTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">{t.inputAlbumTitleCol}</label>
            <input
              type="text"
              required
              placeholder={isAr ? "مثال: ذكريات رمضان المبارك، أيام الروضة..." : "e.g., Ramadan Kareem Gatherings, Summer Holiday"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded focus:ring-1 focus:ring-amber-500 outline-none ${isAr ? "text-right" : "text-left"}`}
            />
          </div>

          {/* Period range */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">{t.inputAlbumPeriodCol}</label>
            <input
              type="text"
              placeholder={isAr ? "مثال: من ٢٠٢٢ إلى ٢٠٢٥، أو صيف ٢٠٢٤" : "e.g., 2001 - 2005, or Summer 2024"}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className={`w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded focus:ring-1 focus:ring-amber-500 outline-none ${isAr ? "text-right" : "text-left"}`}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">{t.inputAlbumDescCol}</label>
            <textarea
              rows={3}
              placeholder={isAr ? "اكتب هنا وصفاً دافئاً للألبوم يمثل قصته وما يعنيه لكم..." : "Write a warm description detailing what these snapshots and milestones represent..."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded focus:ring-1 focus:ring-amber-500 outline-none resize-none ${isAr ? "text-right" : "text-left"}`}
            />
          </div>

          {/* Footer Controls */}
          <div className={`pt-4 border-t border-stone-100 flex items-center gap-2 ${isAr ? "justify-start flex-row-reverse" : "justify-end"}`}>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded border border-stone-300 text-stone-600 text-xs hover:bg-stone-50 cursor-pointer"
            >
              {isAr ? "إلغاء الحفظ" : "Cancel"}
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 rounded bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow cursor-pointer"
            >
              {t.btnSaveAlbum}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
