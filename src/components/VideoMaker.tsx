import React, { useState, useEffect, useRef } from "react";
import { Photo } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Film, 
  Play, 
  Pause, 
  Music, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Upload, 
  ChevronRight, 
  Timer, 
  SlidersHorizontal, 
  CheckCircle, 
  Grid, 
  Heart, 
  Sparkles, 
  Tv, 
  RefreshCw, 
  RotateCw, 
  Trash2, 
  ArrowLeftRight,
  Sparkle
} from "lucide-react";
import { Language, translations, translatePhotoTitle, translatePhotoDesc, translatePhotoLocation } from "../localization";

interface VideoMakerProps {
  photos: Photo[];
  theme: "light" | "dark";
  language: Language;
}

interface VideoSlide {
  photo: Photo;
  duration: number; // in seconds
  caption: string;
}

export default function VideoMaker({ photos, theme, language }: VideoMakerProps) {
  const t = translations[language];

  // Track selected photos to include in movie
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>(() => {
    // defaults to up to 6 photos from the current archive
    return photos.slice(0, 5);
  });

  // Presentation configurations
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideDuration, setSlideDuration] = useState<number>(4); // default 4 seconds per photo
  const [transitionEffect, setTransitionEffect] = useState<"fade" | "scale" | "slide">("fade");
  const [videoFilter, setVideoFilter] = useState<"none" | "vintage" | "monochrome" | "vibrant">("vintage");
  const [aspectRatio, setAspectRatio] = useState<"16-9" | "1-1" | "9-16">("16-9");

  // Audio track state
  const [selectedMusicId, setSelectedMusicId] = useState<string>("retro-piano");
  const [customAudioFile, setCustomAudioFile] = useState<File | null>(null);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [synthPlaying, setSynthPlaying] = useState(false);

  // References and Web Audio API synthesizer for interactive nostalgic soundtracks
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioIntervalRef = useRef<any>(null);
  const customAudioRef = useRef<HTMLAudioElement | null>(null);
  const slideTimerRef = useRef<any>(null);
  const activeSlideProgressRef = useRef<number>(0);
  const [slideProgress, setSlideProgress] = useState(0);

  // Toggle picture selection for sequence
  const togglePhotoSelection = (photo: Photo) => {
    setSelectedPhotos((prev) => {
      const exists = prev.some((p) => p.id === photo.id);
      if (exists) {
        // Prevent clearing all photos
        if (prev.length <= 1) return prev;
        return prev.filter((p) => p.id !== photo.id);
      } else {
        return [...prev, photo];
      }
    });
  };

  // Drag & drop sorting placeholder lists or simple reordering
  const movePhotoIndex = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === selectedPhotos.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...selectedPhotos];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    setSelectedPhotos(reordered);
    setActiveSlideIndex(0);
    setSlideProgress(0);
  };

  // Custom audio upload element creator
  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCustomAudioFile(file);
      const url = URL.createObjectURL(file);
      setCustomAudioUrl(url);
      setSelectedMusicId("custom-upload");
      setIsPlaying(false);
    }
  };

  // WEB AUDIO SYNTHESIZER: We will program beautiful soft pentatonic chord sequences using Web Audio nodes APIs
  // This provides active atmospheric background synth tracks instantly!
  const startSynthMusic = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      setSynthPlaying(true);

      // Simple pentatonic chords rolling continuously
      // Chords structure: C major pentatonic / A minor cozy
      const progression = [
        [110, 165, 220, 261], // Am cozy base
        [130, 196, 261, 329], // C major base
        [146, 220, 293, 349], // F major base
        [98, 146, 196, 293],  // G major sound base
      ];

      let chordIndex = 0;

      const playChordPulse = () => {
        if (!synthPlaying && !isPlaying) return;
        if (isMuted) return;

        const now = ctx.currentTime;
        const notes = progression[chordIndex % progression.length];

        // Synthesize a beautiful soft warm background bell oscillator
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc.type = selectedMusicId === "soft-ambient" ? "sine" : "triangle";
          osc.frequency.value = freq;

          // Soft volume envelope progression to avoid clipping
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.08 / notes.length, now + 0.4);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 3.2);
        });

        chordIndex++;
      };

      // Trigger initial
      playChordPulse();

      // Clear existing track loop intervals safely
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = setInterval(playChordPulse, 3000);

    } catch (err) {
      console.warn("Web Audio Synthesis is disabled or unsupported.", err);
    }
  };

  const stopSynthMusic = () => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    setSynthPlaying(false);
  };

  // Manage custom MP3 / sound player or Web Synth in sync with Movie lifecycle
  useEffect(() => {
    if (isPlaying) {
      // 1. Play background Audio tracks
      if (selectedMusicId === "custom-upload" && customAudioUrl) {
        if (customAudioRef.current) {
          customAudioRef.current.volume = isMuted ? 0 : 0.6;
          customAudioRef.current.play().catch(() => {});
        }
      } else if (selectedMusicId !== "none") {
        startSynthMusic();
      }

      // 2. Play slide transition progress steps interval
      setSlideProgress(0);
      let step = 0;
      const totalSteps = slideDuration * 10; // 10 ticks per second

      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
      
      slideTimerRef.current = setInterval(() => {
        step++;
        const pct = (step / totalSteps) * 100;
        setSlideProgress(pct);

        if (step >= totalSteps) {
          // Proceed to next slide chapter and reset tick progress
          step = 0;
          setSlideProgress(0);
          setActiveSlideIndex((prev) => (prev + 1) % selectedPhotos.length);
        }
      }, 100);

    } else {
      // Pause slideshow states
      if (slideTimerRef.current) {
        clearInterval(slideTimerRef.current);
        slideTimerRef.current = null;
      }
      
      // Stop dynamic synth sound outputs
      stopSynthMusic();

      // Pause physical audio element
      if (customAudioRef.current) {
        customAudioRef.current.pause();
      }
    }

    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [isPlaying, activeSlideIndex, selectedMusicId, customAudioUrl, slideDuration]);

  // Sync mute values on physical custom audio element
  useEffect(() => {
    if (customAudioRef.current) {
      customAudioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Change of soundtrack selector resets music streams
  const handleMusicChange = (trackId: string) => {
    setIsPlaying(false);
    setSelectedMusicId(trackId);
    stopSynthMusic();
    if (customAudioRef.current) {
      customAudioRef.current.pause();
      customAudioRef.current.currentTime = 0;
    }
  };

  // Calculate overall timeline duration
  const totalVideoDuration = selectedPhotos.length * slideDuration;

  const currentPhoto = selectedPhotos[activeSlideIndex] || selectedPhotos[0];

  return (
    <div className={`mt-12 p-6 md:p-8 rounded-xl border shadow-xl transition-colors duration-300 ${
      theme === "dark" 
        ? "bg-stone-900 border-stone-800 text-stone-100" 
        : "bg-white border-stone-200 text-stone-800"
    }`}>
      
      {/* HEADER BAR AND SUBHEADING */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-5 mb-6 gap-4 border-stone-200/60 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-600 rounded text-white shadow-sm">
              <Film className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-display">{t.vmTitle}</h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-serif">
            {t.vmSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 font-bold border border-amber-200/40 font-mono">
            {t.vmDurationLabel} {totalVideoDuration} {t.vmSeconds}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: THE MOVIE PROJECTOR VIEWPORT & PRESENTATION FRAME (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* Virtual Widescreen Projector Screen container */}
          <div className="relative w-full overflow-hidden bg-black rounded-lg border border-stone-800 shadow-2xl flex flex-col items-center justify-center">
            
            {/* Projector Aspect box wrapper ratio */}
            <div className={`relative w-full aspect-video ${
              aspectRatio === "1-1" ? "aspect-square" : aspectRatio === "9-16" ? "aspect-[9/16] max-h-[500px]" : "aspect-video"
            } overflow-hidden bg-stone-950`}>
              
              {/* Retro Film Grain Overlay dust overlay and scanner glitch visuals */}
              <div className="absolute inset-0 bg-film-grain pointer-events-none z-30 opacity-15 mix-blend-overlay" />
              
              {/* Subtle lighting vignette overlay to look like projector beams */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85))] pointer-events-none z-20" />

              {/* Photos slideshow presentation viewport with crossfade */}
              {selectedPhotos.length > 0 && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPhoto.id}
                    className="w-full h-full relative"
                    initial={
                      transitionEffect === "fade" 
                        ? { opacity: 0 } 
                        : transitionEffect === "scale" 
                        ? { opacity: 0, scale: 0.9 } 
                        : { opacity: 0, x: 200 }
                    }
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={
                      transitionEffect === "fade" 
                        ? { opacity: 0 } 
                        : transitionEffect === "scale" 
                        ? { opacity: 0, scale: 1.1 } 
                        : { opacity: 0, x: -200 }
                    }
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  >
                    {/* PANNING / KEN BURNS cinematic movement simulated via CSS inside frame */}
                    <img
                      src={currentPhoto.src}
                      alt={currentPhoto.title}
                      className={`w-full h-full object-cover transition-transform duration-[4000ms] ease-out ${
                        isPlaying ? "scale-110 translate-y-1 translate-x-1" : "scale-100"
                      } ${
                        videoFilter === "vintage" 
                          ? "sepia-[0.35] contrast-[1.05] brightness-[0.95]" 
                          : videoFilter === "monochrome" 
                          ? "grayscale contrast-[1.2] brightness-[0.9]" 
                          : videoFilter === "vibrant"
                          ? "saturate-[1.3] brightness-[1.02]"
                          : ""
                      }`}
                      referrerPolicy="no-referrer"
                    />

                    {/* Projected Title Caption Ribbon Overlay */}
                    <div className="absolute bottom-6 inset-x-8 text-center z-25 pointer-events-none bg-stone-950/85 backdrop-blur-sm p-4 rounded border border-stone-800 shadow-xl max-w-xl mx-auto">
                      <h4 className="text-white font-bold font-serif text-sm md:text-base leading-tight">
                        {translatePhotoTitle(currentPhoto.id, currentPhoto.title, language)}
                      </h4>
                      {currentPhoto.description && (
                        <p className="text-amber-400 text-[11px] md:text-xs font-serif mt-1 italic line-clamp-2">
                          "{translatePhotoDesc(currentPhoto.id, currentPhoto.description, language)}"
                        </p>
                      )}
                      
                      {/* Sub footer tags with location inside visual text strip */}
                      <div className="mt-2.5 flex items-center justify-center gap-4 text-[9px] text-stone-400 font-mono">
                        {currentPhoto.location && (
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {translatePhotoLocation(currentPhoto.id, currentPhoto.location, language)}
                          </span>
                        )}
                        <span>{currentPhoto.year}</span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Overlay indicating loading states or unplayed status */}
              {!isPlaying && (
                <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 p-4">
                  <div className="p-4 bg-amber-600 rounded-full text-white cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-transform" onClick={() => setIsPlaying(true)}>
                    <Play className="w-8 h-8 fill-white ml-1" />
                  </div>
                  <span className="text-xs text-white mt-4 font-bold tracking-wider font-sans">{t.vmPlayOverlay}</span>
                  <span className="text-[10px] text-stone-400 mt-1 max-w-xs text-center leading-relaxed">{t.vmPlayOverlaySubtitle}</span>
                </div>
              )}
            </div>

            {/* Video Control Bar elements */}
            <div className="w-full bg-[#1c1917] px-4 py-3 flex items-center justify-between gap-4 border-t border-stone-800">
              
              {/* Play Pause button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 hover:bg-stone-800 text-white rounded transition shrink-0 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-5 h-5 text-amber-500" /> : <Play className="w-5 h-5" />}
              </button>

              {/* Progress Slider track line representation */}
              <div className="flex-1 flex items-center gap-2">
                <span className="text-[9px] font-mono text-stone-400">
                  {Math.floor((activeSlideIndex * slideDuration) + (slideProgress / 100 * slideDuration))}s
                </span>
                <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden relative">
                  {/* Total slides marks */}
                  <div className="absolute inset-y-0 left-0 bg-amber-600" style={{ width: `${((activeSlideIndex + (slideProgress / 100)) / selectedPhotos.length) * 100}%` }} />
                </div>
                <span className="text-[9px] font-mono text-stone-400">
                  {totalVideoDuration}s
                </span>
              </div>

              {/* Mute and audio indicator control */}
              {selectedMusicId !== "none" && (
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-white rounded transition shrink-0 cursor-pointer"
                  title={isMuted ? "Unmute Movie" : "Mute Movie"}
                >
                  {isMuted ? <VolumeX className="w-4.5 h-4.5 text-red-500" /> : <Volume2 className="w-4.5 h-4.5 text-amber-500 animate-pulse" />}
                </button>
              )}
            </div>
          </div>

          {/* AUDIO CONTROLLER CONFIGURATION AND MUSIC TRACK PICKER */}
          <div className={`p-4 rounded-lg border flex flex-col space-y-4 ${
            theme === "dark" ? "bg-stone-900/60 border-stone-800" : "bg-stone-50 border-stone-200"
          }`}>
            <div className="flex items-center gap-2 border-b pb-2 border-stone-200/50 dark:border-stone-800">
              <Music className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold">{t.vmSelectMusic}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Dynamic Synth option 1 */}
              <button
                type="button"
                onClick={() => handleMusicChange("retro-piano")}
                className={`p-3.5 rounded border ${language === "ar" ? "text-right" : "text-left"} text-xs transition flex flex-col justify-between ${
                  selectedMusicId === "retro-piano"
                    ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-500 text-amber-950 dark:text-amber-300 font-semibold"
                    : "bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-600 hover:bg-stone-100"
                }`}
              >
                <span className="block text-xs font-bold font-serif">{t.vmMusicRetro}</span>
                <span className="text-[9px] text-stone-400 mt-1 block">{t.vmMusicRetroSubtitle}</span>
              </button>

              {/* Dynamic Synth option 2 */}
              <button
                type="button"
                onClick={() => handleMusicChange("soft-ambient")}
                className={`p-3.5 rounded border ${language === "ar" ? "text-right" : "text-left"} text-xs transition flex flex-col justify-between ${
                  selectedMusicId === "soft-ambient"
                    ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-500 text-amber-950 dark:text-amber-300 font-semibold"
                    : "bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-600 hover:bg-stone-100"
                }`}
              >
                <span className="block text-xs font-bold font-serif">{t.vmMusicWarm}</span>
                <span className="text-[9px] text-stone-400 mt-1 block">{t.vmMusicWarmSubtitle}</span>
              </button>

              {/* Custom Uploader for User's own song/MP3 file */}
              <div className="relative">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleCustomAudioUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  title="Upload mp3 song"
                />
                <div className={`p-3.5 rounded border ${language === "ar" ? "text-right" : "text-left"} text-xs transition h-full flex flex-col justify-between ${
                  selectedMusicId === "custom-upload"
                    ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-500 text-amber-950 dark:text-amber-300 font-semibold"
                    : "bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-600 hover:bg-[#d6cfc4]/20"
                }`}>
                  <span className="block text-xs font-bold font-serif flex items-center justify-between">
                    <span>{t.vmMusicUpload}</span>
                    <Upload className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  </span>
                  <span className="text-[9px] text-stone-400 mt-1 block truncate">
                    {customAudioFile ? `${t.vmUploaded} ${customAudioFile.name}` : t.vmUploadPlaceholder}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hidden audio tag to support local uploaded MP3 file playback */}
          {customAudioUrl && (
            <audio
              ref={customAudioRef}
              src={customAudioUrl}
              preload="auto"
            />
          )}

          <div className={`p-5 rounded-lg border space-y-4 ${
              theme === "dark" ? "bg-stone-900/40 border-stone-800" : "bg-white border-stone-200"
            }`}>
            <div className="flex items-center gap-2 border-b pb-2.5 border-stone-200/50 dark:border-stone-800 select-none">
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold">{t.vmCinematicOptions}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Transition styling selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-stone-500 dark:text-stone-400 font-bold block uppercase font-mono">{t.vmTransition}</label>
                <div className="grid grid-cols-3 gap-1 bg-stone-100 dark:bg-stone-950 p-1 rounded border border-stone-200/50 dark:border-stone-800/80">
                  {/* Fade */}
                  <button
                    type="button"
                    onClick={() => setTransitionEffect("fade")}
                    className={`py-1 text-[10px] rounded text-center font-semibold cursor-pointer ${
                      transitionEffect === "fade" ? "bg-amber-600 text-white shadow-sm" : "text-stone-600 hover:text-stone-800"
                    }`}
                  >
                    {t.vmTransitionFade}
                  </button>
                  {/* Scale */}
                  <button
                    type="button"
                    onClick={() => setTransitionEffect("scale")}
                    className={`py-1 text-[10px] rounded text-center font-semibold cursor-pointer ${
                      transitionEffect === "scale" ? "bg-amber-600 text-white shadow-sm" : "text-stone-600 hover:text-stone-800"
                    }`}
                  >
                    {t.vmTransitionZoom}
                  </button>
                  {/* Slide */}
                  <button
                    type="button"
                    onClick={() => setTransitionEffect("slide")}
                    className={`py-1 text-[10px] rounded text-center font-semibold cursor-pointer ${
                      transitionEffect === "slide" ? "bg-amber-600 text-white shadow-sm" : "text-stone-600 hover:text-stone-800"
                    }`}
                  >
                    {t.vmTransitionSlide}
                  </button>
                </div>
              </div>

              {/* Custom film grain or lens style overlay filter selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-stone-500 dark:text-stone-400 font-bold block uppercase font-mono">{t.vmFilter}</label>
                <div className="grid grid-cols-2 gap-1 bg-stone-100 dark:bg-stone-950 p-1 rounded border border-stone-200/50 dark:border-stone-800/80">
                  <button
                    type="button"
                    onClick={() => setVideoFilter("vintage")}
                    className={`py-1 text-[10px] rounded text-center font-semibold cursor-pointer ${
                      videoFilter === "vintage" ? "bg-amber-700 text-white shadow-sm" : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    {t.vmFilterVintage}
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoFilter("monochrome")}
                    className={`py-1 text-[10px] rounded text-center font-semibold cursor-pointer ${
                      videoFilter === "monochrome" ? "bg-amber-700 text-white shadow-sm" : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    {t.vmFilterMono}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Aspect Ratio choice */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-stone-500 dark:text-stone-400 font-bold block uppercase font-mono">{t.vmAspect}</label>
                <div className="grid grid-cols-3 gap-1 bg-stone-100 dark:bg-stone-950 p-1 rounded border border-stone-200/50 dark:border-stone-800/80">
                  {(["16-9", "1-1", "9-16"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAspectRatio(r)}
                      className={`py-1 text-[10px] rounded text-center font-semibold cursor-pointer ${
                        aspectRatio === r ? "bg-amber-600 text-white" : "text-stone-500"
                      }`}
                    >
                      {r === "16-9" ? "16:9" : r === "1-1" ? "1:1" : "9:16"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider seconds custom selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-stone-500 dark:text-stone-400 font-bold block uppercase font-mono flex items-center justify-between">
                  <span>{t.vmSlideDuration}</span>
                  <span className="font-mono text-amber-600">({slideDuration} {t.vmSeconds})</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={slideDuration}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setSlideDuration(Number(e.target.value));
                    setSlideProgress(0);
                  }}
                  className="w-full accent-amber-700 h-1 rounded bg-stone-200 dark:bg-stone-800 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: THE SEQUENCER TIMELINE (5 COLS out of 12) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">

          {/* SEQUENCING, DRAGGING & DROPPING CHOSEN IMAGES ROW */}
          <div className={`p-5 rounded-lg border space-y-4 ${
            theme === "dark" ? "bg-stone-900/40 border-stone-800" : "bg-white border-stone-200"
          }`}>
            <div className="flex items-center justify-between border-b pb-2.5 border-stone-200/50 dark:border-stone-800">
              <div className="flex items-center gap-1.5 select-none">
                <Grid className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold">{t.vmSequenceArrangement}</h3>
              </div>
              <span className="text-[10px] bg-stone-100 dark:bg-stone-950 text-stone-500 px-2 py-0.5 rounded-full border border-stone-200/40 font-mono">
                {selectedPhotos.length} {t.vmSequenceNotes}
              </span>
            </div>

            {/* List scrollable box representation */}
            <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
              {selectedPhotos.map((photo, idx) => {
                const isActive = idx === activeSlideIndex;
                return (
                  <div
                    key={photo.id}
                    className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 text-xs transition-all ${
                      isActive
                        ? "bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/20"
                        : "bg-stone-50 dark:bg-[#1c1917] border-stone-200 dark:border-stone-800"
                    }`}
                  >
                    {/* Small visual image preview thumbnail */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-12 h-9 rounded bg-stone-700 overflow-hidden shrink-0 border border-stone-300 dark:border-stone-800">
                        <img src={photo.src} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="min-w-0">
                        <p className={`font-semibold text-stone-800 dark:text-stone-200 truncate ${language === 'ar' ? 'pr-1' : 'pl-1'}`}>
                          {translatePhotoTitle(photo.id, photo.title, language)}
                        </p>
                        <p className="text-[9px] text-stone-400 font-mono">
                          {photo.year} - {translatePhotoLocation(photo.id, photo.location || "", language) || (language === 'ar' ? 'الألبوم' : 'Album')}
                        </p>
                      </div>
                    </div>

                    {/* Controls to shift reordering and eject from slideshow line */}
                    <div className="flex items-center gap-1">
                      {/* Move up */}
                      <button
                        type="button"
                        onClick={() => movePhotoIndex(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded disabled:opacity-30"
                        title={t.vmPrevSlideTooltip}
                      >
                        <ChevronRight className={`w-4.5 h-4.5 ${language === 'ar' ? 'rotate-90' : '-rotate-95'}`} />
                      </button>

                      {/* Move down */}
                      <button
                        type="button"
                        onClick={() => movePhotoIndex(idx, "down")}
                        disabled={idx === selectedPhotos.length - 1}
                        className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded disabled:opacity-30"
                        title={t.vmNextSlideTooltip}
                      >
                        <ChevronRight className={`w-4.5 h-4.5 ${language === 'ar' ? '-rotate-90' : 'rotate-95'}`} />
                      </button>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => togglePhotoSelection(photo)}
                        className="p-1 text-stone-400 hover:text-red-500 rounded transition"
                        title={t.vmRemoveTooltip}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selection bank area: allow ticking and unticking photos to append to movie timeline */}
            <div className="pt-3 border-t border-stone-200/60 dark:border-stone-800 space-y-2">
              <label className="text-[10px] text-stone-500 dark:text-stone-400 font-bold block uppercase font-mono">{t.vmAppendLabel}</label>
              
              <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto p-1 bg-stone-100 dark:bg-stone-950 rounded border border-stone-200/50 dark:border-stone-800/80">
                {photos.map((photo) => {
                  const isChecked = selectedPhotos.some((p) => p.id === photo.id);
                  return (
                    <button
                      type="button"
                      key={photo.id}
                      onClick={() => togglePhotoSelection(photo)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition font-sans border ${
                        isChecked
                          ? "bg-amber-600 border-amber-600 text-white font-medium"
                          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-55"
                      }`}
                    >
                      <span className="truncate max-w-[80px]">{translatePhotoTitle(photo.id, photo.title, language)}</span>
                      {isChecked && <CheckCircle className="w-3 h-3 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
