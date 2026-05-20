import React, { useState, useEffect } from "react";
import { Photo, Album } from "../types";
import { Sparkles, BookOpen, Quote, Copy, Check, RefreshCw, Languages, Printer } from "lucide-react";
import { translations, translateAlbumTitle, Language } from "../localization";

interface AiStoryBookProps {
  photos: Photo[];
  activeAlbum: Album | undefined;
  language: Language;
}

export default function AiStoryBook({ photos, activeAlbum, language }: AiStoryBookProps) {
  const [story, setStory] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lang, setLang] = useState<Language>(language);
  const [copied, setCopied] = useState(false);

  // Sync state initially or when changed
  useEffect(() => {
    setLang(language);
  }, [language]);

  const generateStory = async () => {
    if (photos.length === 0) return;
    setIsGenerating(true);
    try {
      const response = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photos,
          albumTitle: activeAlbum ? translateAlbumTitle(activeAlbum.id, activeAlbum.title, lang) : (lang === "ar" ? "جميع الصور" : "All Photos"),
          language: lang,
        }),
      });
      const data = await response.json();
      if (data.story) {
        setStory(data.story);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error(err);
      setStory(
        lang === "ar"
          ? "عذراً، حدث خطأ أثناء الاتصال براوي الذكاء الاصطناعي. يرجى تكرار المحاولة."
          : "Sorry, an error occurred while connecting to the AI narrator. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(story);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto my-12 bg-stone-50 border-2 border-double border-stone-300 p-8 md:p-12 rounded-xl shadow-2xl relative bg-paper shadow-orange-100/30">
      {/* Decorative book binder rings on top */}
      <div className="absolute -top-4 inset-x-12 flex justify-between px-8 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-4 h-10 rounded-full bg-stone-400/40 border border-stone-500/20 shadow-inner z-20" />
        ))}
      </div>

      <div className="absolute -top-3.5 inset-x-12 flex justify-between px-8 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-stone-100/80 z-20" />
        ))}
      </div>

      {/* Main Section */}
      <div className="flex flex-col items-center text-center space-y-6 mt-4">
        <div className="bg-amber-50 p-3 rounded-full border border-amber-200/50 flex items-center justify-center shadow-inner">
          <BookOpen className="w-8 h-8 text-amber-800" />
        </div>

        <div>
          <h3 className="text-2xl font-bold font-serif text-stone-800 flex items-center justify-center gap-2">
            {lang === "ar" ? "رواية الذكريات بالذكاء الاصطناعي" : "AI Chronicles & Family Stories"}
          </h3>
          <p className="text-xs text-stone-500 mt-1.5 font-sans">
            {lang === "ar" 
              ? `قراءة سياق الألبوم بالكامل: ${activeAlbum ? translateAlbumTitle(activeAlbum.id, activeAlbum.title, lang) : "جميع الصور"} وصياغة حكاية وجدانية عائلية واحدة` 
              : `Analyzing scope: ${activeAlbum ? translateAlbumTitle(activeAlbum.id, activeAlbum.title, lang) : "All Photos"} to craft a unified warm family chronicle`
            }
          </p>
        </div>

        {/* Configuration strip */}
        <div className="flex flex-wrap items-center justify-center gap-3 bg-white px-4 py-2 border border-stone-200 rounded-full shadow-sm">
          {/* Photos Count indicator */}
          <span className="text-[10px] bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full font-semibold">
            {photos.length} {lang === "ar" ? "مذكرات مدمجة" : "linked memories"}
          </span>

          {/* Lang Selector */}
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="flex items-center gap-1.5 text-[10px] text-amber-800 hover:bg-amber-50 px-3 py-1 border border-amber-200/50 rounded-full transition cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{lang === "ar" ? "لغة الرواية: العربية" : "Chronicle: English"}</span>
          </button>
        </div>

        {/* Generation / View Stage */}
        <div className="w-full pt-4 min-h-[180px] flex items-center justify-center relative">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <RefreshCw className="w-10 h-10 text-amber-700 animate-spin" />
                <Sparkles className="w-4 h-4 text-amber-500 absolute top-0 -right-2 animate-bounce" />
              </div>
              <p className="text-xs text-stone-600 font-serif italic animate-pulse">
                {lang === "ar" 
                  ? "قراءة ضحكات الشاطئ، دمعات التخرج، فخر العائلة والزمن البعيد... جاري صياغة السند العاطفي..." 
                  : "Reading sea laughter, graduation tears, family pride, and old days... Weaving emotional narrative..."
                }
              </p>
            </div>
          ) : story ? (
            <div className={`w-full bg-white/70 border border-stone-200/80 p-6 md:p-8 rounded-lg relative shadow-inner ${lang === "ar" ? "text-right" : "text-left"}`}>
              <div className="absolute -top-3.5 left-4 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded text-[9px] font-bold text-amber-800 font-serif">
                {lang === "ar" ? "رواية عائلية" : "Family Story"}
              </div>

              {/* Quotes decorator */}
              <Quote className="w-8 h-8 text-amber-200/60 absolute top-4 right-4 pointer-events-none transform scale-x-[-1]" />

              <div className="relative z-10 space-y-4 leading-relaxed font-serif text-stone-800 text-sm md:text-base leading-loose select-all text-center">
                <p className="whitespace-pre-line text-stone-800/95 font-serif py-3 px-2 line-clamp-none">
                  {story}
                </p>
              </div>

              {/* Action utilities right inside the book wrapper */}
              <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-center gap-4 text-stone-500">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 text-xs hover:text-amber-800 px-3 py-1.5 hover:bg-stone-50 rounded transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">{lang === 'ar' ? "تم النسخ!" : "Copied!"}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{lang === 'ar' ? "نسخ النص" : "Copy Text"}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 text-xs hover:text-amber-800 px-3 py-1.5 hover:bg-stone-50 rounded transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{lang === 'ar' ? "طابعة الألبوم" : "Print Chapter"}</span>
                </button>

                <button
                  onClick={generateStory}
                  className="flex items-center gap-1 text-xs hover:text-amber-800 px-3 py-1.5 hover:bg-stone-50 rounded transition cursor-pointer font-serif"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? "إعادة سرد" : "Reweave"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4 flex flex-col items-center">
              <p className="text-stone-400 text-xs font-serif leading-relaxed italic max-w-md">
                {lang === "ar"
                  ? '"مرحباً بك في ركن رواية القصص! اضغط على الزر أدناه لتتلقى رواية دافئة قصيرة يجمع ثناياها المحرك الذكي من كافة الصور المتوفرة بمقاطع من عميق حب عائلتكم."'
                  : '"Welcome to the Storytelling niche! Click below to command AI to scan your photos and compile a prose story expressing the absolute path of your family roots."'
                }
              </p>
              <button
                onClick={generateStory}
                disabled={photos.length === 0}
                className="flex items-center gap-2 py-2.5 px-6 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white rounded font-serif text-xs font-semibold shadow-md active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Sparkles className="w-4 h-3.5 text-amber-200" />
                <span>{lang === 'ar' ? "إطلاق راوية المجلد (AI)" : "Weave Family Prose (AI)"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
