import React, { useState, useRef } from "react";
import { Album, FamilyMember, Photo } from "../types";
import { X, Upload, CheckSquare, Square, Camera, MapPin, Calendar } from "lucide-react";
import { Language, translations, translateMemberName, translateAlbumTitle } from "../localization";

interface AddPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  albums: Album[];
  members: FamilyMember[];
  onAddPhoto: (photo: Omit<Photo, "id" | "rotation">) => void;
  language: Language;
}

export default function AddPhotoModal({
  isOpen,
  onClose,
  albums,
  members,
  onAddPhoto,
  language,
}: AddPhotoModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [location, setLocation] = useState("");
  const [albumId, setAlbumId] = useState(albums[0]?.id || "");
  const [size, setSize] = useState<"small" | "medium" | "large">("medium");
  const [taggedMembers, setTaggedMembers] = useState<string[]>([]);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const t = translations[language];
  const isAr = language === "ar";

  // Handle image conversion to Base64
  const handleFileProcess = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImageSrc(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Toggle family tag selection
  const handleTagToggle = (memberName: string) => {
    setTaggedMembers((prev) =>
      prev.includes(memberName)
        ? prev.filter((m) => m !== memberName)
        : [...prev, memberName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageSrc) return;

    // Derive year from date if set
    let derivedYear = year;
    if (date) {
      const d = new Date(date);
      if (!isNaN(d.getFullYear())) {
        derivedYear = d.getFullYear();
      }
    }

    onAddPhoto({
      src: imageSrc,
      title: title || (isAr ? "لحظة عائلية مميزة" : "Special Family Moment"),
      description: description,
      date: date,
      year: derivedYear,
      location: location,
      tags: taggedMembers,
      albumId: albumId,
      size: size,
    });

    // Reset Form
    setTitle("");
    setDescription("");
    setDate("");
    setYear(new Date().getFullYear());
    setLocation("");
    setTaggedMembers([]);
    setImageSrc(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className={`bg-white rounded-lg shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden flex flex-col my-8 ${isAr ? "text-right" : "text-left"}`}>
        {/* Header */}
        <div className={`bg-stone-50 border-b border-stone-200 px-6 py-4 flex items-center justify-between ${isAr ? "flex-row-reverse" : "flex-row"}`}>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold font-serif text-lg text-stone-800">{t.addPhotoTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* File drag-and-drop placeholder visual block */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-all min-h-[160px] ${
              dragActive
                ? "border-amber-600 bg-amber-50/50"
                : imageSrc
                ? "border-stone-300 bg-stone-50"
                : "border-stone-300 bg-stone-50/30 hover:border-amber-500 hover:bg-stone-50/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {imageSrc ? (
              <div className="relative w-full max-h-[140px] flex items-center justify-center overflow-hidden rounded">
                <img src={imageSrc} className="max-h-[120px] object-contain rounded shadow" referrerPolicy="no-referrer" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageSrc(null);
                  }}
                  className="absolute top-1 right-2 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 shadow"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-stone-400 mb-2" />
                <p className="text-sm font-semibold text-stone-700">
                  {isAr ? "اسحب الصورة وفلتها هنا أو اضغط للتصفح" : "Drag and drop your family picture here, or click to browse"}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  {isAr ? "يدعم صيغ JPG, PNG, WEBP فقط" : "Supports JPG, PNG, WEBP files"}
                </p>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">{t.inputPhotoTitleCol}</label>
              <input
                type="text"
                required
                placeholder={isAr ? "عنوان يعبر عن ذكراك الدافئة" : "Give this nostalgic memory a beautiful title"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none ${isAr ? "text-right" : "text-left"}`}
              />
            </div>

            {/* Album designation */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">{t.inputPhotoAlbumCol}</label>
              <select
                value={albumId}
                onChange={(e) => setAlbumId(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none"
              >
                {albums.map((alb) => (
                  <option key={alb.id} value={alb.id}>
                    {translateAlbumTitle(alb.id, alb.title, language)} {alb.period ? `(${alb.period})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">{t.inputPhotoDescCol}</label>
            <textarea
              rows={2}
              placeholder={isAr ? "قص ما حدث في هذه الصورة، لنهيئ لراوي الذكاء الاصطناعي تفاصيل كافية ومؤثرة..." : "Tell the story behind this scenery, helping the AI storyteller capture exact details..."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none ${isAr ? "text-right" : "text-left"}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Precise Date */}
            <div>
              <label className={`block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1 ${isAr ? "flex-row-reverse" : ""}`}>
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <span>{isAr ? "تاريخ اللقطة" : "Captured Date"}</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded focus:ring-1 focus:outline-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className={`block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1 ${isAr ? "flex-row-reverse" : ""}`}>
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                <span>{isAr ? "المكان / المدينة" : "Location / City"}</span>
              </label>
              <input
                type="text"
                placeholder={isAr ? "مثال: الغردقة، البحر الأحمر" : "e.g., Al-Azhar Park, Cairo"}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded focus:ring-1 focus:outline-none ${isAr ? "text-right" : "text-left"}`}
              />
            </div>

            {/* Collage Size Variant */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">{isAr ? "مقياس العرض الفني" : "Collage Grid Scale"}</label>
              <div className="grid grid-cols-3 gap-1 bg-stone-50 p-1 border border-stone-200 rounded text-center">
                {(["small", "medium", "large"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`py-1.5 text-[10px] rounded font-semibold capitalize cursor-pointer ${
                      size === s ? "bg-amber-600 text-white shadow-sm" : "text-stone-600 hover:bg-stone-200/50"
                    }`}
                  >
                    {s === "small" ? (isAr ? "صغير" : "Small") : s === "medium" ? (isAr ? "متوسط" : "Medium") : (isAr ? "كبير" : "Large")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tag Family Members component list */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">{t.inputPhotoTagsCol}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-stone-50 p-3.5 rounded border border-stone-200/60 transition-all">
              {members.map((member) => {
                const isChecked = taggedMembers.includes(member.name);
                return (
                  <button
                    type="button"
                    key={member.id}
                    onClick={() => handleTagToggle(member.name)}
                    className={`flex items-center gap-2 px-3 py-2 rounded border text-xs transition cursor-pointer ${isAr ? "text-right flex-row-reverse" : "text-left flex-row"} ${
                      isChecked
                        ? "bg-amber-50 border-amber-400 text-stone-900 shadow-sm"
                        : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <span className="shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-300" />
                      )}
                    </span>
                    <span className="truncate">{translateMemberName(member.name, language)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer controls */}
          <div className={`pt-4 border-t border-stone-200 flex items-center gap-3 ${isAr ? "justify-start flex-row-reverse" : "justify-end"}`}>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
            >
              {isAr ? "إلغاء الحفظ" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={!imageSrc}
              className="py-2.5 px-6 rounded bg-amber-700 text-white hover:bg-amber-800 disabled:opacity-55 disabled:cursor-not-allowed text-xs font-semibold shadow cursor-pointer"
            >
              {t.btnSavePhoto}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
