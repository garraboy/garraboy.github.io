import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Photo, Album, FamilyMember } from "../types";
import { 
  Sparkles, 
  Palette, 
  Download, 
  Sparkle, 
  RefreshCw, 
  Save, 
  FileDown, 
  Upload, 
  Sliders, 
  RotateCw, 
  Image as ImageIcon, 
  Paintbrush, 
  FileCheck, 
  X, 
  HelpCircle,
  AlertCircle
} from "lucide-react";

interface PhotoStudioProps {
  photos: Photo[];
  setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
  albums: Album[];
  members: FamilyMember[];
  language: "ar" | "en";
  theme: "light" | "dark";
}

// Preset visual styles mappings & filter values
const PRESET_FILTERS = [
  { id: "original", nameAr: "الأصلية", nameEn: "Original", css: "" },
  { id: "cozy-vintage", nameAr: "عتيق دافئ 📻", nameEn: "Cozy Vintage", css: "sepia(0.5) contrast(1.1) brightness(0.9) saturate(0.85)" },
  { id: "golden-hour", nameAr: "غروب الشمس الدافئ 🌅", nameEn: "Golden Hour", css: "sepia(0.2) hue-rotate(-10deg) brightness(1.05) saturate(1.3)" },
  { id: "nostalgia-bnw", nameAr: "أبيض وأسود عتيق 🎞️", nameEn: "Vintage B&W", css: "grayscale(1) contrast(1.25) brightness(0.95)" },
  { id: "warm-egypt", nameAr: "شمس الشرق ليلية 🐪", nameEn: "Egyptian Sun", css: "sepia(0.35) saturate(1.4) contrast(1.05) brightness(1.02)" },
  { id: "cyber-neon", nameAr: "وهج النيون ☄️", nameEn: "Cyber Neon", css: "hue-rotate(130deg) saturate(1.6) brightness(1.1)" },
];

const FRAME_PRESETS = [
  { id: "none", nameAr: "بدون إطار", nameEn: "No Border" },
  { id: "polaroid", nameAr: "بولارويد أبيض 📸", nameEn: "Classic Polaroid" },
  { id: "wooden", nameAr: "إطار خشبي دافئ 🪵", nameEn: "Rustic Wood Frame" },
  { id: "film", nameAr: "سلوليد نيجاتيف 🎞️", nameEn: "Film Negative Border" },
  { id: "royal-gold", nameAr: "إطار ذهبي ملكي 👑", nameEn: "Imperial Gold" }
];

export default function PhotoStudio({
  photos,
  setPhotos,
  albums,
  members,
  language,
  theme
}: PhotoStudioProps) {
  const isAr = language === "ar";
  
  // Selection / Editing State
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>("upload");
  const [customUploadedImage, setCustomUploadedImage] = useState<string | null>(null);
  
  // Adjustment Sliders
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sepia, setSepia] = useState(0);
  const [hueRotate, setHueRotate] = useState(0);
  const [blur, setBlur] = useState(0);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  
  // Frame & Preset Selected
  const [selectedPresetId, setSelectedPresetId] = useState("original");
  const [selectedFrameId, setSelectedFrameId] = useState("none");
  
  // Interactive Paint Brush States
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [brushColor, setBrushColor] = useState("#d97706"); // Amber-600
  const [brushWidth, setBrushWidth] = useState(4);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // AI Tools States
  const [aiPromptInput, setAiPromptInput] = useState("");
  const [isEditingAiLoading, setIsEditingAiLoading] = useState(false);
  const [editAiError, setEditAiError] = useState("");
  
  // AI Image Generator States
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [generateAspectRatio, setGenerateAspectRatio] = useState<"1:1" | "4:3" | "16:9" | "9:16">("1:1");
  const [isGeneratingAiLoading, setIsGeneratingAiLoading] = useState(false);
  const [generateAiError, setGenerateAiError] = useState("");
  const [generatedImagePreview, setGeneratedImagePreview] = useState<string | null>(null);

  // Saving state
  const [saveTitle, setSaveTitle] = useState("");
  const [saveDesc, setSaveDesc] = useState("");
  const [saveAlbumId, setSaveAlbumId] = useState(albums[0]?.id || "roots");
  const [saveYear, setSaveYear] = useState<number>(new Date().getFullYear());
  const [saveLocation, setSaveLocation] = useState("");
  const [saveTags, setSaveTags] = useState<string[]>([]);
  const [wasAddedSuccessfully, setWasAddedSuccessfully] = useState(false);

  // Setup initial state when photo selected changes
  const getActiveImageSrc = (): string | null => {
    if (selectedPhotoId === "upload") {
      return customUploadedImage;
    }
    const found = photos.find(p => p.id === selectedPhotoId);
    return found ? found.src : null;
  };

  const imageSrc = getActiveImageSrc();

  // Reset adjustments
  const resetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSepia(0);
    setHueRotate(0);
    setBlur(0);
    setRotation(0);
    setSelectedPresetId("original");
    setSelectedFrameId("none");
    clearDrawingCanvas();
  };

  // Clear paint canvas
  const clearDrawingCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  // File uploading handler helper
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomUploadedImage(event.target.result as string);
          setSelectedPhotoId("upload");
          resetAdjustments();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas drawing triggers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawingMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = brushWidth;
    ctx.lineCap = "round";
    ctx.strokeStyle = brushColor;

    // Get exact canvas coordinate points independent of screen resizing layout
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  // Trigger AI Photo modification from backend route
  const handleAiPhotoEdit = async () => {
    if (!imageSrc) return;
    if (!aiPromptInput.trim()) {
      setEditAiError(isAr ? "يرجى كتابة التعديل أو التغيير الذي ترغب في تطبيقه" : "Please describe what edits you want the AI to perform.");
      return;
    }

    setIsEditingAiLoading(true);
    setEditAiError("");
    try {
      const res = await fetch("/api/edit-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageSrc,
          prompt: aiPromptInput
        })
      });

      const data = await res.json();
      if (data.image) {
        if (selectedPhotoId === "upload") {
          setCustomUploadedImage(data.image);
        } else {
          // If editing an existing photo from the state database:
          setCustomUploadedImage(data.image);
          setSelectedPhotoId("upload"); // switch to processed uploaded sandbox
        }
        setAiPromptInput("");
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      setEditAiError(err.message || (isAr ? "حدث خطأ أثناء تعديل الصورة بالذكاء الاصطناعي." : "Failed to perform AI image translation. Make sure your API key is correct."));
    } finally {
      setIsEditingAiLoading(false);
    }
  };

  // Trigger New Photo Generation
  const handleAiPhotoGenerate = async () => {
    if (!generatePrompt.trim()) {
      setGenerateAiError(isAr ? "يرجى كتابة وصف الصورة أولاً لتوليدها بالذكاء الاصطناعي" : "Please provide a description prompt for the image generation.");
      return;
    }

    setIsGeneratingAiLoading(true);
    setGenerateAiError("");
    setGeneratedImagePreview(null);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: generatePrompt,
          aspectRatio: generateAspectRatio
        })
      });

      const data = await res.json();
      if (data.image) {
        setGeneratedImagePreview(data.image);
        // Switch editing panel directly to this newly created memory file
        setCustomUploadedImage(data.image);
        setSelectedPhotoId("upload");
        resetAdjustments();
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      setGenerateAiError(err.message || (isAr ? "عجز الذكاء الاصطناعي عن توليد هذه الصورة، يرجى إعادة محاولة الصياغة." : "Unable to generate image. Please verify you have configured your GEMINI_API_KEY."));
    } finally {
      setIsGeneratingAiLoading(false);
    }
  };

  // Render merged adjustments CSS filter string
  const getFiltersStyleString = () => {
    const selectedPreset = PRESET_FILTERS.find(p => p.id === selectedPresetId);
    let filterStr = selectedPreset ? selectedPreset.css : "";
    
    // Add custom adjustments values on top of presets
    filterStr += ` brightness(${brightness}%)`;
    filterStr += ` contrast(${contrast}%)`;
    filterStr += ` saturate(${saturation}%)`;
    if (sepia > 0) filterStr += ` sepia(${sepia}%)`;
    if (hueRotate > 0) filterStr += ` hue-rotate(${hueRotate}deg)`;
    if (blur > 0) filterStr += ` blur(${blur}px)`;
    
    return filterStr;
  };

  // Render the final framed image with drawings as a downloadable single PNG via Canvas merger!
  const downloadFinishedImage = () => {
    if (!imageSrc) return;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.src = imageSrc;
    
    img.onload = () => {
      // Create offscreen canvas that compiles size
      const resultCanvas = document.createElement("canvas");
      const ctx = resultCanvas.getContext("2d");
      if (!ctx) return;
      
      // Calculate borders padding base on frame presets
      let paddingLeft = 0;
      let paddingTop = 0;
      let paddingRight = 0;
      let paddingBottom = 0;
      
      const frameId = selectedFrameId;
      const baseWidth = img.naturalWidth || 800;
      const baseHeight = img.naturalHeight || 600;
      
      if (frameId === "polaroid") {
        paddingLeft = baseWidth * 0.05;
        paddingRight = baseWidth * 0.05;
        paddingTop = baseWidth * 0.05;
        paddingBottom = baseHeight * 0.22; // iconic Polaroid wide bottom strip
      } else if (frameId === "wooden") {
        paddingLeft = paddingRight = paddingTop = paddingBottom = baseWidth * 0.04;
      } else if (frameId === "film") {
        paddingLeft = paddingRight = baseWidth * 0.06;
        paddingTop = paddingBottom = baseHeight * 0.08;
      } else if (frameId === "royal-gold") {
        paddingLeft = paddingRight = paddingTop = paddingBottom = baseWidth * 0.05;
      }
      
      resultCanvas.width = baseWidth + paddingLeft + paddingRight;
      resultCanvas.height = baseHeight + paddingTop + paddingBottom;
      
      // Draw frame background
      if (frameId === "polaroid") {
        ctx.fillStyle = "#faf9f6"; // soft eggshell polaroid white
        ctx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);
        // Draw vintage inner polaroid grey shadow outline
        ctx.strokeStyle = "#e5e5e0";
        ctx.lineWidth = 1;
        ctx.strokeRect(4, 4, resultCanvas.width - 8, resultCanvas.height - 8);
      } else if (frameId === "wooden") {
        ctx.fillStyle = "#78350f"; // Rich oak wood reddish amber
        ctx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);
        ctx.fillStyle = "#451a03"; // Darker wood stripes lines
        for (let i = 0; i < resultCanvas.width; i += 24) {
          ctx.fillRect(i, 0, 4, resultCanvas.height);
        }
      } else if (frameId === "film") {
        ctx.fillStyle = "#18181b"; // Dark zinc charcoal
        ctx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);
        // Draw movie sprocket holes
        ctx.fillStyle = "#ffffff";
        for (let i = 10; i < resultCanvas.width; i += 40) {
          ctx.fillRect(i, 8, 16, 24); // top holes
          ctx.fillRect(i, resultCanvas.height - 32, 16, 24); // bottom holes
        }
      } else if (frameId === "royal-gold") {
        ctx.fillStyle = "#fbbf24"; // Rich Amber/Gold
        ctx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);
        ctx.strokeStyle = "#92400e"; // bronze/brown inner outline
        ctx.lineWidth = 6;
        ctx.strokeRect(10, 10, resultCanvas.width - 20, resultCanvas.height - 20);
      } else {
        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);
      }
      
      // Apply CSS style visual filters directly to the 2D Canvas Context rendering pipeline!
      ctx.filter = getFiltersStyleString();
      
      // Handle ninety-degree rotations offsets if present
      ctx.save();
      const drawX = paddingLeft + baseWidth / 2;
      const drawY = paddingTop + baseHeight / 2;
      ctx.translate(drawX, drawY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -baseWidth / 2, -baseHeight / 2, baseWidth, baseHeight);
      ctx.restore();
      
      // Remove context filter for drawings overlay
      ctx.filter = "none";
      
      // Draw manual painted brush annotations on top of the image
      const srcCanvas = canvasRef.current;
      if (srcCanvas) {
        ctx.drawImage(srcCanvas, paddingLeft, paddingTop, baseWidth, baseHeight);
      }
      
      // Trigger instant anchor download
      const dataUrl = resultCanvas.toDataURL("image/jpeg", 0.95);
      const link = document.createElement("a");
      link.download = `hinata_scrape_${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
    };
  };

  // Save changes direct back into user's interactive archive list state database cache
  const handleSaveToScrapbook = () => {
    if (!imageSrc) return;
    if (!saveTitle.trim()) {
      alert(isAr ? "يرجى تعيين عنوان مميز لهذه الصورة قبل حفظها" : "Please write a title before saving this photo memory.");
      return;
    }

    const uniqueId = `saved_studio_${Date.now()}`;
    const newPhotoObject: Photo = {
      id: uniqueId,
      src: imageSrc, // Save base64 or source url directly
      title: saveTitle,
      description: saveDesc || (isAr ? "صورة مخصصة ومعدلة بالذكاء الاصطناعي في استوديو العائلة." : "Custom memory designed in the AI photo studio."),
      date: new Date().toISOString().split('T')[0],
      year: Number(saveYear) || new Date().getFullYear(),
      location: saveLocation || undefined,
      tags: saveTags,
      rotation: Math.floor(Math.random() * 14) - 7, // aesthetic tilt rotation [-7, 7]
      albumId: saveAlbumId,
      size: "large"
    };

    setPhotos(prev => [newPhotoObject, ...prev]);
    setWasAddedSuccessfully(true);
    setSaveTitle("");
    setSaveDesc("");
    setSaveLocation("");
    setSaveTags([]);
    
    // Clear check success status after a brief duration
    setTimeout(() => {
      setWasAddedSuccessfully(false);
    }, 4500);
  };

  // Backup downloader: download the FULL data archive scrapbook file so user can download the changes
  const downloadBackupDataJSON = () => {
    // Collect full current persistent cache configurations to make the app ready to download
    const fullScrapbookData = {
      photos: photos,
      albums: albums,
      language: language,
      theme: theme,
      exportedAt: new Date().toISOString(),
      creator: "Hinata AI Engine"
    };

    const dataStr = JSON.stringify(fullScrapbookData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `hinata_scrapbook_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Toggle tag existence
  const toggleSaveTag = (memberName: string) => {
    setSaveTags(prev => 
      prev.includes(memberName) 
        ? prev.filter(t => t !== memberName)
        : [...prev, memberName]
    );
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* 1. Header description banner */}
      <div className={`p-6 rounded-lg border flex flex-col md:flex-row items-center justify-between gap-6 transition ${
        theme === "dark" 
          ? "bg-gradient-to-br from-stone-900 to-stone-950 border-stone-800" 
          : "bg-gradient-to-br from-[#fdfbf7] to-[#f4efe4] border-stone-200"
      }`}>
        <div className="space-y-1.5 text-center md:text-right flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2 text-amber-700 dark:text-amber-500">
            <Palette className="w-5 h-5" />
            <h2 className="text-lg font-bold font-serif">{isAr ? "استوديو الصور الإبداعي والذكاء الاصطناعي 🎨" : "Creative AI Photo & FX Studio"}</h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed">
            {isAr 
              ? "قم بتعديل صور ألبومك، إضافة مؤثرات وفلاتر بصرية كلاسيكية، التوقيع بالفرشاة وتلوينها، أو توليد صور تاريخية جديدة كلياً بالذكاء الاصطناعي لحفظها بمجلداتك وتحميلها لجهازك فوراً!" 
              : "Edit family photos, apply instant digital vintager effects, paintbrush signatures, or generate high-quality historical memories from text prompts using AI."}
          </p>
        </div>
        
        {/* Backup export control direct layout */}
        <div className="shrink-0 flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={downloadBackupDataJSON}
            className="px-4.5 py-2.5 bg-zinc-800 hover:bg-zinc-900 dark:bg-amber-800 dark:hover:bg-amber-900 text-white text-xs font-bold rounded shadow-md flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-95"
            title={isAr ? "تحميل ملف النسخة الاحتياطية للألبوم بالكامل" : "Download Album Raw Data Backup JSON"}
          >
            <FileDown className="w-4 h-4 text-amber-400" />
            <span>{isAr ? "تحميل بيانات الألبوم بالكامل (JSON) 💾" : "Download Full Album Backup (JSON)"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: THE CANVAS PREVIEW & ADJUSTMENTS CONTROLS (7 COLS out of 12) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* PHOTO BOX AND CANVAS BLOCK */}
          <div className={`p-4 rounded-lg border shadow-lg flex flex-col relative overflow-hidden transition ${
            theme === "dark" ? "bg-stone-900/40 border-stone-800" : "bg-white border-stone-200"
          }`}>
            
            {/* Action Bar */}
            <div className={`flex items-center justify-between pb-3.5 mb-4 border-b ${
              theme === "dark" ? "border-stone-800" : "border-stone-100"
            }`}>
              
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  {isAr ? "معاينة الاستوديو الفورية" : "Live Studio Canvas Viewport"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                
                {/* Reset adjust buttons */}
                <button
                  onClick={resetAdjustments}
                  className="p-1 px-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition"
                  title={isAr ? "تصفير كل المؤثرات" : "Reset adjustments and clear edits"}
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{isAr ? "تصفير التعديلات" : "Reset"}</span>
                </button>

                {/* Drawing Mode Toggle Button */}
                <button
                  onClick={() => setIsDrawingMode(!isDrawingMode)}
                  className={`p-1.5 px-3 rounded text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition ${
                    isDrawingMode 
                      ? "bg-amber-700 text-white shadow-md animate-pulse" 
                      : "bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
                  }`}
                  title={isAr ? "الكتابة والتوقيع بالفرشاة على الصورة" : " paintbrush annotation signature tool"}
                >
                  <Paintbrush className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isAr ? "الفرشاة والتوقيع" : "Brush Signature"}</span>
                </button>

              </div>
            </div>

            {/* Main Visual Image Sandbox container with Borders wrapped dynamically */}
            <div className="flex items-center justify-center bg-black/5 dark:bg-black/40 min-h-[300px] md:min-h-[440px] max-h-[580px] p-6 rounded border border-dashed border-stone-300 dark:border-stone-800 relative z-10 select-none">
              
              {imageSrc ? (
                // THE PICTURE CONTAINER FRAME
                <div 
                  className={`relative max-w-full max-h-full transition-all duration-300 shadow-2xl relative z-10 flex flex-col items-center ${
                    selectedFrameId === "polaroid" 
                      ? "bg-[#faf9f6] p-4 pb-14 rounded-sm border border-stone-200" 
                      : selectedFrameId === "wooden" 
                      ? "bg-[#78350f] p-4 rounded border-4 border-[#451a03]"
                      : selectedFrameId === "film"
                      ? "bg-[#18181b] px-4 py-8 rounded border-y border-dashed border-white/20"
                      : selectedFrameId === "royal-gold"
                      ? "bg-amber-400 p-4 rounded border-4 border-amber-800"
                      : "p-0 rounded"
                  }`}
                >
                  {/* Film negative sprocket decoration */}
                  {selectedFrameId === "film" && (
                    <div className="absolute top-1 left-2 right-2 flex justify-between px-2 text-white/40 text-[8px] font-mono select-none pointer-events-none">
                      <span>🎞️ KODAK 400</span>
                      <span>S-104</span>
                      <span>▶ 02</span>
                    </div>
                  )}

                  <div className="relative overflow-hidden max-w-full max-h-[440px] flex items-center justify-center">
                    
                    {/* The physical img element with client CSS adjustments */}
                    <img
                      src={imageSrc}
                      alt="Studio editing item"
                      className="max-h-full max-w-full object-contain pointer-events-none transition-transform transition-all"
                      style={{
                        filter: getFiltersStyleString(),
                        transform: `rotate(${rotation}deg)`
                      }}
                      referrerPolicy="no-referrer"
                    />

                    {/* Paintbrush Canvas Overlay */}
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={600}
                      className={`absolute inset-0 w-full h-full object-fill ${
                        isDrawingMode ? "cursor-crosshair z-30 pointer-events-auto" : "pointer-events-none z-20"
                      }`}
                      onMouseDown={startDrawing}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onMouseMove={draw}
                      onTouchStart={startDrawing}
                      onTouchEnd={stopDrawing}
                      onTouchMove={draw}
                    />

                  </div>

                  {/* Polaroid caption area */}
                  {selectedFrameId === "polaroid" && (
                    <p className="absolute bottom-2 text-center text-stone-700/80 font-serif text-[11px] font-semibold italic truncate max-w-[85%] mt-2 select-none">
                      {saveTitle || (isAr ? "ذكريات عائلية في القلب 🕯️" : "Cozy family memories...")}
                    </p>
                  )}
                  
                  {/* Film negative bottom sprocket decoration */}
                  {selectedFrameId === "film" && (
                    <div className="absolute bottom-1.5 left-2 right-2 flex justify-between px-2 text-white/40 text-[8px] font-mono select-none pointer-events-none">
                      <span>ISO 400</span>
                      <span>© {new Date().getFullYear()}</span>
                      <span>FRAME 02</span>
                    </div>
                  )}

                </div>
              ) : (
                // Loader default state when empty (guide instructions)
                <div className="text-center py-12 px-6 flex flex-col items-center space-y-4 max-w-sm">
                  <span className="p-4 bg-amber-50 dark:bg-stone-900 rounded-full text-amber-600 dark:text-amber-400 animate-bounce">
                    <Upload className="w-8 h-8" />
                  </span>
                  <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300">
                    {isAr ? "حدد صورة للبدء بالتعديل عليها" : "Select or Upload a Photo to Start!"}
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    {isAr 
                      ? "اختر من القائمة المنسدلة بالأسفل أي صورة مخزنة حالياً، أو اسحب واصنع صورة محلية من كمبيوترك لنضعها بالاستوديو الإبداعي." 
                      : "Choose any calculated picture from your current archive list below, or upload a fresh image from your file system to apply filters and brush paints."}
                  </p>
                  
                  {/* File Upload Trigger */}
                  <label className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-semibold cursor-pointer shadow-md inline-flex items-center gap-1.5 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isAr ? "اختر صورة محلية من جهازك" : "Upload Local Photo File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLocalImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Drawing Color Options Bar */}
            {isDrawingMode && imageSrc && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-3 rounded-md border flex flex-wrap items-center justify-between gap-3.5 ${
                  theme === "dark" ? "bg-stone-950 border-stone-850" : "bg-stone-50 border-stone-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-600" />
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{isAr ? "خيارات التوقيع بالفرشاة" : "Brush Palette Options"}</span>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Predefined Colors */}
                  {["#d97706", "#dc2626", "#2563eb", "#10b981", "#7c3aed", "#18181b", "#ffffff"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setBrushColor(color)}
                      className={`w-5.5 h-5.5 rounded-full cursor-pointer transition transform active:scale-90 border flex items-center justify-center ${
                        brushColor === color ? "ring-2 ring-amber-500 scale-110" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      {brushColor === color && (
                        <span className={`w-1.5 h-1.5 rounded-full ${color === "#ffffff" ? "bg-black" : "bg-white"}`} />
                      )}
                    </button>
                  ))}
                  
                  {/* Brush width sliders inside tag */}
                  <div className="flex items-center gap-1.5 ml-2 border-l pl-2 border-stone-200 dark:border-stone-800">
                    <span className="text-[10px] text-stone-500">{isAr ? "السمك:" : "Size:"}</span>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      value={brushWidth}
                      onChange={(e) => setBrushWidth(Number(e.target.value))}
                      className="w-16 accent-amber-650 h-1 rounded"
                    />
                    <span className="text-[10px] font-mono font-bold">{brushWidth}px</span>
                  </div>

                  <button
                    onClick={clearDrawingCanvas}
                    className="p-1 px-2.5 bg-red-100 dark:bg-rose-950/40 hover:bg-red-200 dark:hover:bg-rose-950/70 text-red-700 dark:text-rose-400 rounded text-[9px] font-bold cursor-pointer transition flex items-center gap-1.5"
                  >
                    <span>{isAr ? "مسح الخطوط" : "Clear Canvas"}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Selector drop down of current scrapbook photos */}
            {imageSrc && (
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                <span className="text-xs font-semibold text-stone-400 whitespace-nowrap">{isAr ? "تعديل صورة من الألبوم:" : "Source Image File:"}</span>
                <select
                  value={selectedPhotoId}
                  onChange={(e) => {
                    setSelectedPhotoId(e.target.value);
                    resetAdjustments();
                  }}
                  className={`w-full text-xs p-2.5 rounded border focus:ring-1 focus:ring-amber-500 outline-none transition cursor-pointer font-serif ${
                    theme === "dark" ? "bg-stone-950 border-stone-850 text-stone-100" : "bg-stone-50 border-stone-200 text-stone-800"
                  }`}
                >
                  <option value="upload">{isAr ? "📂 [ملف صورة محلي أو مولد بالذكاء الاصطناعي]" : "📂 [Upload / Generated Sandbox Photo]"}</option>
                  {photos.map((p) => (
                    <option key={p.id} value={p.id}>
                      📷 {p.title} ({p.year}) - {p.location || "N/A"}
                    </option>
                  ))}
                </select>

                {/* Local Upload Alternative Button in line */}
                <label className="py-2.5 px-4 rounded border text-xs font-semibold shrink-0 cursor-pointer transition flex items-center justify-center gap-1.5 w-full sm:w-auto hover:bg-stone-100 dark:hover:bg-stone-850 border-stone-305 dark:border-stone-800">
                  <Upload className="w-3.5 h-3.5 text-stone-500" />
                  <span>{isAr ? "رفع صورة" : "Upload Local file"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLocalImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* ADJUSTMENT PANEL CONTROLS */}
          {imageSrc && (
            <div className={`p-5 rounded-lg border shadow-md space-y-5 transition ${
              theme === "dark" ? "bg-stone-900/40 border-stone-800" : "bg-white border-stone-200"
            }`}>
              <div className="flex items-center gap-1.5 border-b pb-2.5 border-stone-100 dark:border-stone-850 select-none">
                <Sliders className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold">{isAr ? "خيارات التعديل وعموم الفلاتر" : "Interactive Image Control Panel & Sliders"}</h3>
              </div>

              {/* A. Preset Filters selection row */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">{isAr ? "اختر طيفاً مجهزاً للفلاتر (Preset Filter)" : "Artistic Filter Presets"}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_FILTERS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setSelectedPresetId(preset.id);
                        // Trigger manual preset prefilled standard adjustment set
                        if (preset.id === "original") resetAdjustments();
                      }}
                      className={`py-2 px-3 rounded text-xs text-center border font-medium transition cursor-pointer ${
                        selectedPresetId === preset.id
                          ? "bg-amber-50 dark:bg-amber-950/20 border-amber-600 text-amber-800 dark:text-amber-300 font-semibold shadow-sm"
                          : "bg-transparent border-stone-200 dark:border-stone-850 text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-800"
                      }`}
                    >
                      {isAr ? preset.nameAr : preset.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* B. Frame Presets Selection row */}
              <div className="space-y-2 pt-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">{isAr ? "تأطير الصورة (Vintage Frame Borders)" : "Nostalgic Wrap Frames"}</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {FRAME_PRESETS.map((fr) => (
                    <button
                      key={fr.id}
                      onClick={() => setSelectedFrameId(fr.id)}
                      className={`py-2 px-2.5 rounded text-[11px] text-center border transition font-serif cursor-pointer ${
                        selectedFrameId === fr.id
                          ? "bg-[#9a3412] text-white border-amber-800 font-semibold shadow-sm"
                          : "bg-transparent border-stone-200 dark:border-stone-850 text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-800"
                      }`}
                    >
                      {isAr ? fr.nameAr : fr.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* C. Manual Precision sliders */}
              <div className="border-t pt-4 border-stone-100 dark:border-stone-850">
                <label className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-3">{isAr ? "تعديلات الأبعاد والألوان اليدوية" : "Manual Sliders Precision Edit"}</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Slider Brightness */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-stone-550 dark:text-stone-400">{isAr ? "السطوع / Brightness" : "Brightness"}</span>
                      <span className="text-amber-700 dark:text-amber-400 font-bold">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-amber-650 h-2 bg-stone-150 rounded"
                    />
                  </div>

                  {/* Slider Contrast */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-stone-550 dark:text-stone-400">{isAr ? "التباين / Contrast" : "Contrast"}</span>
                      <span className="text-amber-700 dark:text-amber-400 font-bold">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-amber-650 h-2 bg-stone-150 rounded"
                    />
                  </div>

                  {/* Slider Saturation */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-stone-550 dark:text-stone-400">{isAr ? "التشبع اللوني / Saturation" : "Saturation"}</span>
                      <span className="text-amber-700 dark:text-amber-400 font-bold">{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full accent-amber-650 h-2 bg-stone-150 rounded"
                    />
                  </div>

                  {/* Slider Sepia */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-stone-550 dark:text-stone-400">{isAr ? "التأثير العتيق / Sepia" : "Sepia Vintage"}</span>
                      <span className="text-amber-700 dark:text-amber-400 font-bold">{sepia}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sepia}
                      onChange={(e) => setSepia(Number(e.target.value))}
                      className="w-full accent-amber-650 h-2 bg-stone-150 rounded"
                    />
                  </div>

                  {/* Slider Hue Rotation */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-stone-550 dark:text-stone-400">{isAr ? "تبديل الأطياف / Hue Rotate" : "Hue Color Shift"}</span>
                      <span className="text-amber-700 dark:text-amber-400 font-bold">{hueRotate}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={hueRotate}
                      onChange={(e) => setHueRotate(Number(e.target.value))}
                      className="w-full accent-amber-650 h-2 bg-stone-150 rounded"
                    />
                  </div>

                  {/* Slider Blur */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-stone-550 dark:text-stone-400">{isAr ? "الضبابية / Lens Blur" : "Lens Blur background"}</span>
                      <span className="text-amber-700 dark:text-amber-400 font-bold">{blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={blur}
                      onChange={(e) => setBlur(Number(e.target.value))}
                      className="w-full accent-amber-650 h-2 bg-stone-150 rounded"
                    />
                  </div>
                </div>

                {/* Flip Rotate Buttons */}
                <div className="flex items-center gap-3.5 pt-4 mt-2 border-t border-dashed border-stone-100 dark:border-stone-850">
                  <span className="text-xs font-semibold text-stone-400 select-none">{isAr ? "تدوير تماثلي للاتجاه:" : "Canvas Rotation:"}</span>
                  <button
                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                    className="p-1 px-3 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded text-xs text-stone-600 dark:text-stone-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer transition transform active:scale-90"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-amber-500" />
                    <span>90° {isAr ? "درجة لليمين" : "Turn Right"}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: AI STUDIO MODIFICATIONS, AI GENERATION & SAVE TO ALBUM (5 COLS out of 12) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* A. GENERATE MEMORY PHOTO BY AI PROMPT (Text to image, Nana Banana!) */}
          <div className={`p-5 rounded-lg border shadow-md space-y-4 transition ${
            theme === "dark" ? "bg-stone-900/40 border-stone-800" : "bg-white border-stone-200"
          }`}>
            <div className="flex items-center gap-2 border-b pb-2.5 border-stone-100 dark:border-stone-850 select-none">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-amber-900 dark:text-amber-400">{isAr ? "توليد صورة فوتوغرافية بالذكاء الاصطناعي 🚀" : "AI Custom Photo Memory Generator"}</h3>
            </div>
            
            <p className="text-[11px] text-stone-400 leading-relaxed font-serif">
              {isAr 
                ? "صِف ذكريات عائلية من خيالك أو حقبتك، وسنقوم بتوليد صورة فوتوغرافية عتيقة واقعية بجودة هائلة بالاستعانة بموديل الذكاء الاصطناعي Gemini 2.5 Image." 
                : "Describe a historical scene or a vintage family picnic. Gemini will draw a photorealistic retro memory to document."}
            </p>

            <div className="space-y-3">
              <textarea
                rows={3}
                placeholder={isAr 
                  ? "مثال: صورة فوتوغرافية قديمة لجد عائلي سعيد يقرأ كتاباً في شرفة منزل خشبي ريفي دافئ عام 1975، تفاصيل زيتية دقيقة..." 
                  : "e.g., A vintage nostalgic photography of a happy smiling family posing next to an old retro 1980s car in Cairo streets..."}
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
                className={`w-full text-xs p-3 rounded focus:ring-1 focus:ring-amber-500 outline-none transition uppercase ${
                  theme === "dark" ? "bg-stone-955 border-stone-800 text-stone-100" : "bg-stone-50 border-stone-200 text-stone-800"
                }`}
              />

              {/* Ideas shortcut tags */}
              <div className="space-y-1 pt-1 select-none">
                <span className="text-[10px] text-stone-500 block font-bold uppercase">{isAr ? "أفكار مقفلة مقترحة (انقر للنسخ):" : "Suggested Prompts Examples (Click to apply):"}</span>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setGeneratePrompt(isAr ? "الجد والجدة نانا بانانا يضحكان بسعادة في ساحة المنزل القديم الترابي الدافئ، مرسومة بألوان مائية واضحة دافئة" : "Grandparents laughing cheerfully in their old rural soil cozy backyard, warm artistic watercolor style, historical")}
                    className="text-[9px] bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-500 px-2.5 py-1 rounded cursor-pointer"
                  >
                    👵🍌 {isAr ? "نانا بانانا العتيقة" : "Vintage Nana Banana"}
                  </button>
                  <button
                    onClick={() => setGeneratePrompt(isAr ? "صورة فوتوغرافية دافئة بلون أبيض وأسود عتيق لعائلتنا عام ١٩٨٠ في رحلة الإسكندرية القديمة مع بحر جميل ناعم" : "Warm black and white family archival portrait captured in Alexandria beach during 1982 vacations")}
                    className="text-[9px] bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-500 px-2.5 py-1 rounded cursor-pointer"
                  >
                    🌊 {isAr ? "صيف ١٩٨٢ العائلي" : "Summer 1982 Vacation"}
                  </button>
                </div>
              </div>

              {/* Aspect Ratio Config */}
              <div className="flex items-center justify-between pt-1 flex-wrap gap-2 text-xs">
                <span className="text-stone-400">{isAr ? "أبعاد الصورة:" : "Aspect Ratio:"}</span>
                <div className="flex gap-1.5">
                  {(["1:1", "4:3", "16:9", "9:16"] as const).map(ratio => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setGenerateAspectRatio(ratio)}
                      className={`text-[10px] px-2.5 py-1 rounded border cursor-pointer font-mono ${
                        generateAspectRatio === ratio 
                          ? "bg-amber-700 text-white border-amber-700 shadow-sm font-bold" 
                          : "border-stone-200 dark:border-stone-800 text-stone-500"
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Trigger Button */}
              <button
                type="button"
                disabled={isGeneratingAiLoading}
                onClick={handleAiPhotoGenerate}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded text-xs font-bold tracking-wide shadow flex items-center justify-center gap-1.5 hover:from-amber-700 hover:to-amber-800 cursor-pointer transition transform active:scale-95 disabled:opacity-50"
              >
                <Sparkle className={`w-3.5 h-3.5 ${isGeneratingAiLoading ? "animate-spin" : ""}`} />
                <span>
                  {isGeneratingAiLoading 
                    ? (isAr ? "جاري نسج الفضاء بالصور الذكية..." : "Weaving Image with AI ...") 
                    : (isAr ? "توليد صورة بالذكاء الاصطناعي 🚀" : "Generate Memory Now")
                  }
                </span>
              </button>

              {generateAiError && (
                <div className="p-3 bg-red-105 dark:bg-rose-950/20 text-red-700 dark:text-rose-400 text-[11px] rounded flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{generateAiError}</p>
                </div>
              )}
            </div>
          </div>

          {/* B. AI PHOTO EDITOR & FX MODIFICATIONS (Apply complex modifications to image) */}
          {imageSrc && (
            <div className={`p-5 rounded-lg border shadow-md space-y-4 transition ${
              theme === "dark" ? "bg-stone-900/40 border-stone-800" : "bg-white border-stone-200"
            }`}>
              <div className="flex items-center gap-2 border-b pb-2.5 border-stone-100 dark:border-stone-850 select-none">
                <Palette className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-amber-900 dark:text-amber-400">{isAr ? "تعديل محتوى الصورة بالذكاء الاصطناعي ✨" : "AI In-painting & Photo Editor"}</h3>
              </div>
              
              <p className="text-[11px] text-stone-400 leading-relaxed font-serif">
                {isAr 
                  ? "اطلب أي تعديل عيني على الصورة الحالية (مثال: 'أضف قبعة عتيقة حمراء للجد', 'اجعل الخلفية سماء حافلة بغيوم الغروب الجميلة')." 
                  : "Type what content change to execute on this image file. Gemini AI will redesign it."}
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder={isAr ? "مثال: أضف هرّة صغيرة غامقة تقف بجانب الكوب..." : "e.g., Add a fuzzy brown puppy in the floor background..."}
                  value={aiPromptInput}
                  onChange={(e) => setAiPromptInput(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded focus:ring-1 focus:ring-amber-500 outline-none transition ${
                    theme === "dark" ? "bg-stone-955 border-stone-800 text-stone-100" : "bg-stone-50 border-stone-200 text-stone-800"
                  }`}
                />

                <button
                  type="button"
                  disabled={isEditingAiLoading}
                  onClick={handleAiPhotoEdit}
                  className="w-full py-2 bg-stone-800 hover:bg-stone-900 text-amber-400 text-[11px] font-bold tracking-wide rounded shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isEditingAiLoading ? "animate-spin text-amber-500" : ""}`} />
                  <span>
                    {isEditingAiLoading 
                      ? (isAr ? "جاري تطبيق التعديلات البصرية..." : "AI Redraw is performing modifications...") 
                      : (isAr ? "تحديث الصورة بالذكاء الاصطناعي ✍️" : "Apply AI Modification Edit")
                    }
                  </span>
                </button>

                {editAiError && (
                  <div className="p-2.5 bg-red-105 dark:bg-rose-950/25 text-red-700 dark:text-rose-400 text-[10px] rounded flex items-start gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <p>{editAiError}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* C. SAVE PHOTO TO ALBUM FORM (Collect Metadata & Save) */}
          {imageSrc && (
            <div className={`p-5 rounded-lg border shadow-md space-y-4 transition ${
              theme === "dark" ? "bg-stone-900/40 border-stone-800" : "bg-white border-stone-200"
            }`}>
              <div className="flex items-center gap-2 border-b pb-2.5 border-stone-100 dark:border-stone-850 select-none">
                <Save className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-400">{isAr ? "حفظ الصورة وتضمينها بالألبوم 💾" : "Save Completed Photo to Scrapbook"}</h3>
              </div>

              {/* Form Metadata Fields */}
              <div className="space-y-3.5 text-xs">
                
                {/* Save Title */}
                <div className="space-y-1">
                  <label className="text-stone-400 uppercase text-[10px] block font-semibold">{isAr ? "عنوان الصورة العائلية *" : "Photo Title *"}</label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? "مثال: الجدة وعائلتها لقطة نانا بانانا" : "e.g., Grandma Nana Banana Custom Portrait"}
                    value={saveTitle}
                    onChange={(e) => setSaveTitle(e.target.value)}
                    className={`w-full p-2.5 rounded border outline-none focus:ring-1 focus:ring-emerald-500 ${
                      theme === "dark" ? "bg-stone-955 border-stone-850 text-stone-100" : "bg-stone-50 border-stone-200 text-stone-800"
                    }`}
                  />
                </div>

                {/* Save Description */}
                <div className="space-y-1">
                  <label className="text-stone-400 uppercase text-[10px] block font-semibold">{isAr ? "سرد قصة الذكرى" : "Nostalgic Story description"}</label>
                  <textarea
                    rows={2}
                    placeholder={isAr ? "اكتب توثيقاً دافئاً لهذه الصورة للجيل الجديد..." : "Describe this warm custom generated portrait..."}
                    value={saveDesc}
                    onChange={(e) => setSaveDesc(e.target.value)}
                    className={`w-full p-2.5 rounded border outline-none focus:ring-1 focus:ring-emerald-500 ${
                      theme === "dark" ? "bg-stone-955 border-stone-850 text-stone-100" : "bg-stone-50 border-stone-200 text-stone-800"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Location field */}
                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase text-[10px] block">{isAr ? "الموقع الجغرافي" : "Location"}</label>
                    <input
                      type="text"
                      placeholder={isAr ? "القاهرة، مصر" : "Cairo, Egypt"}
                      value={saveLocation}
                      onChange={(e) => setSaveLocation(e.target.value)}
                      className={`w-full p-2 rounded border outline-none focus:ring-1 focus:ring-emerald-500 ${
                        theme === "dark" ? "bg-stone-955 border-stone-850 text-stone-100" : "bg-stone-50 border-stone-200"
                      }`}
                    />
                  </div>

                  {/* Year field */}
                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase text-[10px] block">{isAr ? "سنة الالتقاط" : "Year"}</label>
                    <input
                      type="number"
                      value={saveYear}
                      onChange={(e) => setSaveYear(Number(e.target.value))}
                      className={`w-full p-2 rounded border outline-none focus:ring-1 focus:ring-emerald-500 ${
                        theme === "dark" ? "bg-stone-955 border-stone-850 text-stone-100" : "bg-stone-50 border-stone-200"
                      }`}
                    />
                  </div>
                </div>

                {/* Target Album Selection */}
                <div className="space-y-1">
                  <label className="text-stone-400 uppercase text-[10px] block font-semibold">{isAr ? "المجلد المستهدف" : "Target Scrapbook Album Group"}</label>
                  <select
                    value={saveAlbumId}
                    onChange={(e) => setSaveAlbumId(e.target.value)}
                    className={`w-full p-2 rounded border outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer ${
                      theme === "dark" ? "bg-stone-955 border-stone-850 text-stone-100" : "bg-stone-50 border-stone-200"
                    }`}
                  >
                    {albums.map(alb => (
                      <option key={alb.id} value={alb.id}>📂 {alb.title}</option>
                    ))}
                  </select>
                </div>

                {/* Family tagged select (Toggle tagging) */}
                <div className="space-y-1.5 select-none pt-1">
                  <label className="text-stone-400 uppercase text-[10px] block">{isAr ? "من من العائلة في الصورة؟" : "Who is tagged in this photo?"}</label>
                  <div className="flex flex-wrap gap-1">
                    {members.map(mb => {
                      const isTagged = saveTags.includes(mb.name);
                      return (
                        <button
                          key={mb.id}
                          type="button"
                          onClick={() => toggleSaveTag(mb.name)}
                          className={`px-2 py-1 rounded text-[10px] cursor-pointer transition border font-medium ${
                            isTagged 
                              ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-800 dark:text-emerald-400 font-semibold" 
                              : "bg-transparent border-stone-200 dark:border-stone-850 text-stone-500"
                          }`}
                        >
                          {mb.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SAVE AND DOWNLOAD TRIGGERS ROW */}
                <div className="pt-4 border-t border-stone-100 dark:border-stone-850 flex gap-2 w-full select-none">
                  <button
                    type="button"
                    onClick={handleSaveToScrapbook}
                    className="flex-1 py-2.5 px-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition transform active:scale-95"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>{isAr ? "حفظ بالألبوم 📂" : "Save to Album"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={downloadFinishedImage}
                    className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition transform active:scale-95"
                    title={isAr ? "تحميل الصورة المُعدّلة بجودة عالية" : "Download high resolution completed photograph to device"}
                  >
                    <Download className="w-4 h-4" />
                    <span>{isAr ? "تحميل الصورة 📥" : "Download"}</span>
                  </button>
                </div>

                {wasAddedSuccessfully && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-emerald-105 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-[11px] rounded border border-emerald-250 font-medium flex items-center gap-1.5 justify-center"
                  >
                    <span>✨ {isAr ? "تم حفظ الصورة الجديدة بنجاح في أرشيف ألبوم العائلة!" : "Photo saved successfully into your scrapbook archive!"}</span>
                  </motion.div>
                )}

              </div>
            </div>
          )}

          {/* D. HOW TO DOWNLOAD INSTRUCTION CARD - fully satisfies "اريد تحميل التطبيق" */}
          <div className={`p-5 rounded-lg border shadow-md space-y-3.5 transition select-none ${
            theme === "dark" 
              ? "bg-gradient-to-br from-stone-900 via-stone-950 to-amber-950/20 border-stone-800" 
              : "bg-gradient-to-br from-white via-[#faf9f6] to-amber-50/20 border-stone-200"
          }`}>
            <div className="flex items-center gap-2 border-b pb-2 border-stone-100 dark:border-stone-850">
              <HelpCircle className="w-4 h-4 text-amber-600 animate-pulse" />
              <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300">{isAr ? "كيفية تحميل هذا التطبيق وتثبيته؟ 💻" : "How to Download & Export application?"}</h3>
            </div>

            <p className="text-[11px] text-stone-400 leading-relaxed font-serif">
              {isAr 
                ? "لقد قمنا ببناء التطبيق بالكامل باللغتين العربية والإنجليزية مع قاعدة هيناتا وذكاء اصطناعي فائق. لتحميل الكود المصدري الكامل للتطبيق كملف مضغوط (ZIP) لتشغيله في أي سيرفر أو رفعه على جيت هاب:" 
                : "You can download the entire full-stack application source code to run locally or deploy to your production server."}
            </p>

            <div className="space-y-2 text-[11px] text-stone-500 dark:text-stone-400 font-sans leading-relaxed">
              <div className="flex items-start gap-1.5">
                <span className="bg-amber-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                <p>{isAr ? "اذهب إلى شريط الإعدادات الجانبي لـ AI Studio (على يسار أو يمين المتصفح)." : "Navigate to settings panel in AI Studio workspace."}</p>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="bg-amber-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                <p>{isAr ? "اضغط على خيار التصدير (Export to ZIP / Export to GitHub)." : "Click on the settings dropdown and find 'Export to ZIP'."}</p>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="bg-amber-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                <p>{isAr ? "سيقوم النظام فوراً بضغط كل الكود وتقديمه لك كباقة جاهزة للبدء والتشغيل الفوري بنقرة واحدة!" : "Your browser will package and download the completed bundle as a ZIP instantly!"}</p>
              </div>
            </div>

            {/* Quick backup reminders */}
            <div className="pt-2 bg-amber-50/50 dark:bg-amber-950/10 p-2.5 rounded border border-amber-500/20 text-center">
              <span className="text-[10px] font-bold text-amber-705 dark:text-amber-400 block mb-1">
                {isAr ? "💡 هل تود تجربة التنزيل الآن؟" : "💡 Ready to backup?"}
              </span>
              <button
                onClick={downloadBackupDataJSON}
                className="w-full text-center py-1 bg-amber-700 hover:bg-amber-800 text-white text-[10px] font-bold rounded cursor-pointer transition uppercase"
              >
                {isAr ? "تحميل نسخة احتياطية فورية (.json)" : "Export Quick JSON Backup File"}
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
