export type Language = "ar" | "en";

export const translations = {
  ar: {
    appName: "دفتر ذكريات هيناتا العائلي المصور",
    appSlogan: "لحظات الزمن الجميل، الحكايا الدافئة، الضحكات التي لا تغيب والترابط الوثيق في ألبومنا التفاعلي الذكي.",
    navPhotos: "📸 ألبوم الصور التفاعلي",
    navStorybook: "✨ دفتر حكايا الذكاء الاصطناعي",
    btnNewAlbum: "ألبوم جديد",
    btnNewPhoto: "إضافة صورة عائلية",
    btnLangToggle: "English",
    themeDark: "وضع ليلي",
    themeLight: "وضع نهاري",
    allPhotos: "الجميع",
    filterTitle: "فلترة بوجود أفراد العائلة:",
    allCount: "كل الأرشيف",
    albumLabel: "مجلد:",
    searchPlaceholder: "بحث في الذكريات بالاسم أو الموقع أو السنة...",
    noPhotosFound: "لم نجد أي صور تطابق فلترة البحث هذه... أضف بعض الذكريات الدافئة!",
    albumPeriod: "الحقبة الزمنية:",
    photoDetailLocation: "الموقع:",
    photoDetailYear: "سنة التقاطها:",
    photoDetailTags: "الحاضرون:",
    photoDetailDate: "التاريخ:",
    allAlbumsArchive: "عرض الأرشيف الكلي للمجموعة",
    allAlbumsSubtitle: "فلترة وتصفح كلي مع قاعة عرض تكميلية.",
    confirmDelete: "هل أنت متأكد من حذف هذه الصورة الدافئة من ألبوم العائلة؟",

    // Layout names
    layoutPolaroid: "📸 بولارويد",
    layoutCollage: "🧱 كولاج",
    layoutTimeline: "📅 خط زمني",
    layoutCarousel: "🎭 التلفزيون القديم",
    layoutVideoMaker: "🎥 صانع الأفلام",
    layoutPhotoStudio: "🎨 استوديو الصور والذكاء الاصطناعي",

    // Polaroid card captions
    writeCaptionHelp: "اكتب يدوياً أو دع الذكاء الاصطناعي يسردها كشعر أو حكمة دافئة للذكرى العائلية",
    generateAiCaption: "كتابة قصة أو شعر بالذكاء الاصطناعي ✨",
    generatingAiCaption: "جاري صياغة السرد بالذكاء الاصطناعي...",
    btnSave: "حفظ",
    btnCancel: "إلغاء",

    // Modals
    addAlbumTitle: "إضافة ألبوم ذكريات جديد 📁",
    addAlbumSubtitle: "أدخل تفاصيل الألبوم الجديد الذي يضم حقبة زمنية عائلية فريدة.",
    inputAlbumTitleCol: "عنوان الألبوم (مثال: صيف الشباب)",
    inputAlbumDescCol: "الصفة / الوصف الدافئ للألبوم",
    inputAlbumPeriodCol: "الفترة الزمنية (مثال: 1980 - 1990)",
    inputAlbumCoverCol: "رابط صورة الغلاف",
    btnSaveAlbum: "حفظ الألبوم الدافئ",

    addPhotoTitle: "توثيق صورة عائلية جديدة 📸",
    addPhotoSubtitle: "املأ الحقول لتضم هذه الصورة للألبوم العائلي مع تحديد الشخصيات الحاضرة.",
    inputPhotoTitleCol: "عنوان الصورة (مثال: الجد في العيد)",
    inputPhotoDescCol: "سرد القصة أو الوصف الدافئ",
    inputPhotoUrlCol: "رابط الصورة المباشر",
    inputPhotoDateCol: "تاريخ الالتقاط",
    inputPhotoYearCol: "سنة الالتقاط تقريبياً",
    inputPhotoLocCol: "الموقع الجغرافي للذكرى",
    inputPhotoTagsCol: "أفراد العائلة المتواجدين بالصورة (اضغط للفلترة)",
    inputPhotoAlbumCol: "اختر المجلد التابع له",
    btnSavePhoto: "حفظ الصورة للأبد ✨",

    // Storybook
    sbTitle: "حكواتي العائلة الذكي 📖",
    sbSubtitle: "دع الذكاء الاصطناعي يقرأ أرشيف ألبومك المختار، وينسج منه رواية وثائقية دافئة تعيد تفاصيل ذكريات الزمن الجميل.",
    sbWarmDetailsInput: "تضمين تفاصيل دافئة (مثال: طقوس الشاي، الضحك العفوي، فناء المنزل القديم...)",
    sbWarmDetailsLabel: "تفاصيل عائلية خاصة تريد إضافتها:",
    sbSelectStyle: "حدد أسلوب سرد الحكواتي:",
    sbStyleProse: "رواية نثرية دافئة ✍️",
    sbStylePoetry: "شعر وقصيد وجداني 🌸",
    sbStyleDoc: "رواية وثائقية واقعية 🎬",
    sbSelectAlbum: "اختر الألبوم المستهدف للرواية:",
    sbWeaveBtn: "افتح الصندوق وانسج حكاية العائلة الآن ✨",
    sbWeaving: "جاري جمع خيوط الحكايات ونسج السرد العائلي بالذكاء الاصطناعي للجيل القادم...",
    sbResultHeader: "الحكايا الممسوكة بالذكاء الاصطناعي:",
    sbCopyBtn: "نسخ الحكاية العائلية",
    sbCopied: "تم النسخ بنجاح! 📋",
    sbReweaveBtn: "أعد السرد من جديد 🌾",

    // Video maker
    vmTitle: "تحويل الذكريات إلى فيلم سينمائي 🎥",
    vmSubtitle: "اصنع فيلماً وثائقياً فورياً من صور عائلتك مع حركات بانورامية ومقاطع موسيقية دافئة.",
    vmDurationLabel: "مدة الفيلم الإجمالية:",
    vmSeconds: "ثوانٍ",
    vmSelectMusic: "تحديد الصوت والموسيقى المرافقة للفيلم:",
    vmMusicRetro: "🎹 عزف بيانو ريترو (Nostalgia Piano)",
    vmMusicWarm: "🌌 أوتار دافئة (Cozy Ambient)",
    vmMusicUpload: "🎵 تحميل الأغنية الخاصة بك",
    vmMusicRetroSubtitle: "توليد نغمات دافئة بالذكاء الاصطناعي الكلاسيكي",
    vmMusicWarmSubtitle: "مؤثرات صوتية هادئة لعشاق الذكريات القديمة",
    vmMusicUploadSubtitle: "اختر ملف صوتي (MP3) للتشغيل التلقائي",
    vmUploaded: "مُحمل:",
    vmUploadPlaceholder: "اختر ملف صوتي (MP3) للتشغيل التلقائي",
    vmCinematicOptions: "خيارات الإخراج السينمائي:",
    vmTransition: "طريقة التنقل / Transition",
    vmTransitionFade: "تلاشي",
    vmTransitionZoom: "زوم",
    vmTransitionSlide: "سحب",
    vmFilter: "الفلتر الفني / Filter",
    vmFilterVintage: "فنتج / قديم",
    vmFilterMono: "أبيض وأسود",
    vmAspect: "أبعاد العرض / Aspect Ratio",
    vmSlideDuration: "زمن التموضع",
    vmSequenceArrangement: "تنظيم تسلسل المشاهد في الفيلم:",
    vmSequenceNotes: "مذكرات مرتبة في الفيلم",
    vmPrevSlideTooltip: "مشهد سابق",
    vmNextSlideTooltip: "مشهد تالي",
    vmRemoveTooltip: "حذف من العرض",
    vmAppendLabel: "تغذية الفيلم بصور أخرى:",
    vmPlayOverlay: "اضغط لبدء عرض الفيلم العائلي",
    vmPlayOverlaySubtitle: "سيبدأ العزف الموسيقي والتقليب التلقائي للصور فور التشغيل",

    // Lightbox / Enlarged
    lightboxTitle: "تفاصيل وعمق الذكرى",
    lightboxZoomedIn: "تصفح بملء الشاشة",

    // Static default content localization
    members: {
      "الجد أحمد": "الجد أحمد",
      "الجدة فاطمة": "الجدة فاطمة",
      "الأب علاء": "الأب علاء",
      "الأم ليلى": "الأم ليلى",
      "الابنة ياسمين": "الابنة ياسمين",
      "الابن عمر": "الابن عمر"
    },
    memberRoles: {
      "الجد / Grandfather": "الجد أحمد",
      "الجدة / Grandmother": "الجدة فاطمة",
      "الأب / Father": "الأب علاء",
      "الأم / Mother": "الأم ليلى",
      "الابنة / Daughter": "الابنة ياسمين",
      "الابن / Son": "الابن عمر"
    },
    albums: {
      "roots": {
        title: "الجذور والبدايات",
        description: "صور أثرية وحكايات قديمة من عبق الماضي تأسس عليها دفء عائلتنا."
      },
      "trips": {
        title: "مغامرات ورحلات عائلية",
        description: "لحظات الانطلاق والضحك في السفر والرحلات الصيفية وعطلات نهاية الأسبوع."
      },
      "milestones": {
        title: "أفراح وإنجازات",
        description: "الأيام الحافلة بالفخر من شهادات التخرج، أعياد الميلاد، والنجاحات الفردية."
      }
    },
    photos: {
      "ph1": {
        title: "الجد والجدة في حوش المنزل القديم",
        description: "صورة دافئة توثق البدايات في فناء المنزل الخشبي الريفي القديم، حيث بدأت فصول عائلتنا.",
        location: "طنطا، الغربية"
      },
      "ph2": {
        title: "نزهة ربيعية دافئة",
        description: "يوم ربيعي مشرق مليء بالضحك واللعب الجماعي وسط المروج الخضراء والأطعمة الشهية.",
        location: "حديقة الأزهر، القاهرة"
      },
      "ph3": {
        title: "بحر وصيف وضحكات لا تغيب",
        description: "أجواء عائلية رائعة على شاطئ الإسكندرية وسباق الضحك مع أمواج البحر الدافئة في المساء القريب.",
        location: "عروس البحر، الإسكندرية"
      },
      "ph4": {
        title: "فرحة تخرج ياسمين",
        description: "لحظة تاريخية مليئة بدموع الفرح وتكليل سنوات الدراسة والجهد بفخر واعتزاز شديد.",
        location: "جامعة القاهرة، الجيزة"
      }
    }
  },

  en: {
    appName: "Hinata Family Photo Memories",
    appSlogan: "Nostalgic moments, warm stories, endless laughter, and the close bond of our family recorded in our interactive digital scrapbook.",
    navPhotos: "📸 Interactive Scrapbook",
    navStorybook: "✨ AI Storybook Weaving",
    btnNewAlbum: "New Album",
    btnNewPhoto: "Add Family Photo",
    btnLangToggle: "العربية",
    themeDark: "Dark Mode",
    themeLight: "Light Mode",
    allPhotos: "All",
    filterTitle: "Filter by Family Members:",
    allCount: "All Archive",
    albumLabel: "Album:",
    searchPlaceholder: "Search memories by title, location, or year...",
    noPhotosFound: "No photos matching your search filters... Add some warm memories!",
    albumPeriod: "Time Period:",
    photoDetailLocation: "Location:",
    photoDetailYear: "Year captured:",
    photoDetailTags: "Family present:",
    photoDetailDate: "Date:",
    allAlbumsArchive: "All Collection Archive",
    allAlbumsSubtitle: "Complete browse and filter view of all family memories.",
    confirmDelete: "Are you sure you want to delete this warm memory from the family album?",

    // Layout names
    layoutPolaroid: "📸 Polaroid",
    layoutCollage: "🧱 Collage",
    layoutTimeline: "📅 Timeline",
    layoutCarousel: "🎭 Old TV",
    layoutVideoMaker: "🎥 Movie Maker",
    layoutPhotoStudio: "🎨 AI Photo & Editing Studio",

    // Polaroid card captions
    writeCaptionHelp: "Write manually or let AI draft a poetic caption or nostalgic quote to preserve the memory.",
    generateAiCaption: "Weave story using AI ✨",
    generatingAiCaption: "AI is drafting the narrative poetically...",
    btnSave: "Save",
    btnCancel: "Cancel",

    // Modals
    addAlbumTitle: "Create New Memories Album 📁",
    addAlbumSubtitle: "Fill in details of the new album to represent an era or family chapter.",
    inputAlbumTitleCol: "Album title (e.g., Summer Youth)",
    inputAlbumDescCol: "Warm introduction or description of the album",
    inputAlbumPeriodCol: "Timeframe period (e.g., 1980 - 1990)",
    inputAlbumCoverCol: "Cover Image URL reference",
    btnSaveAlbum: "Save Nostalgic Album",

    addPhotoTitle: "Document New Family Photo 📸",
    addPhotoSubtitle: "Enter details for the new photo to add to the family archive and tag member profiles.",
    inputPhotoTitleCol: "Photo Title (e.g., Grandpa in Eid vacations)",
    inputPhotoDescCol: "Write or tell the warm memory description",
    inputPhotoUrlCol: "Image Direct URL",
    inputPhotoDateCol: "Captured Date",
    inputPhotoYearCol: "Approximate Year of capturing",
    inputPhotoLocCol: "Geographic Location / City",
    inputPhotoTagsCol: "Present family members (click to select/toggle)",
    inputPhotoAlbumCol: "Target Album Grouping",
    btnSavePhoto: "Save Photo Forever ✨",

    // Storybook
    sbTitle: "Smart Family Storyteller 📖",
    sbSubtitle: "Let AI scan your chosen album archive, drafting a warm narrative or poem capturing family traditions.",
    sbWarmDetailsInput: "Include warm specific details (e.g., teatime rituals, spontaneous laughter, the old backyard...)",
    sbWarmDetailsLabel: "Special moments details you want included:",
    sbSelectStyle: "Select Narration Style:",
    sbStyleProse: "Warm Poetic Prose ✍️",
    sbStylePoetry: "Sensory Poetic Verse 🌸",
    sbStyleDoc: "Realistic Documentary Narrative 🎬",
    sbSelectAlbum: "Choose Target Album:",
    sbWeaveBtn: "Weave Family Story Now ✨",
    sbWeaving: "Gathering streams of memories and weaving family story for the next generation...",
    sbResultHeader: "The Weaved AI Narrative:",
    sbCopyBtn: "Copy Story Text",
    sbCopied: "Copied successfully! 📋",
    sbReweaveBtn: "Reweave Story 🌾",

    // Video maker
    vmTitle: "Transform Memories to Cinematic Movie 🎥",
    vmSubtitle: "Create an instant documentary from your family photos with Ken-Burns panning and cozy tunes.",
    vmDurationLabel: "Total Video Duration:",
    vmSeconds: "seconds",
    vmSelectMusic: "Choose Sound & Accompanying Music:",
    vmMusicRetro: "🎹 Nostalgia Piano Melody",
    vmMusicWarm: "🌌 Cozy Warm Strings",
    vmMusicUpload: "🎵 Upload Your Own Track",
    vmMusicRetroSubtitle: "Soft synthesized warm piano melodies with AI style",
    vmMusicWarmSubtitle: "Soothing strings and soft bell pulses",
    vmMusicUploadSubtitle: "Load your custom audio sound file (MP3/WAV)",
    vmUploaded: "File loaded:",
    vmUploadPlaceholder: "Upload your custom track (MP3) for background playback",
    vmCinematicOptions: "Cinematic Custom Controls:",
    vmTransition: "Transition",
    vmTransitionFade: "Crossfade",
    vmTransitionZoom: "Zoom",
    vmTransitionSlide: "Slide",
    vmFilter: "Cinematic Filter effect",
    vmFilterVintage: "Cozy Vintage",
    vmFilterMono: "Monochrome Black & White",
    vmAspect: "Aspect Ratio",
    vmSlideDuration: "Slide Duration",
    vmSequenceArrangement: "Arrange Slide Sequence Order:",
    vmSequenceNotes: "memories in movie",
    vmPrevSlideTooltip: "Previous scene",
    vmNextSlideTooltip: "Next scene",
    vmRemoveTooltip: "Remove from Movie",
    vmAppendLabel: "Add other photos to movie sequence:",
    vmPlayOverlay: "Click to Start Cinematic Movie",
    vmPlayOverlaySubtitle: "Lively soundtracks, Ken-Burns motion, and transitions play immediately on start",

    // Lightbox / Enlarged
    lightboxTitle: "Nostalgic Memory Details",
    lightboxZoomedIn: "Full Screen Experience",

    // Static default content localization helper map
    members: {
      "الجد أحمد": "Grandpa Ahmed",
      "الجدة فاطمة": "Grandma Fatima",
      "الأب علاء": "Father Alaa",
      "الأم ليلى": "Mother Laila",
      "الابنة ياسمين": "Daughter Yasmin",
      "الابن عمر": "Son Omar"
    },
    memberRoles: {
      "الجد / Grandfather": "Grandfather",
      "الجدة / Grandmother": "Grandmother",
      "الأب / Father": "Father",
      "الأم / Mother": "Mother",
      "الابنة / Daughter": "Daughter",
      "الابن / Son": "Son"
    },
    albums: {
      "roots": {
        title: "Roots & Beginnings",
        description: "Vintage photographs and ancient tales from which our family's warmth was established."
      },
      "trips": {
        title: "Family Trips & Adventures",
        description: "Moments of laughter and joy captured during summer excursions and weekend getaways."
      },
      "milestones": {
        title: "Joys & Milestones",
        description: "Proud graduation days, birthdays, and the landmark individual achievements of our family."
      }
    },
    photos: {
      "ph1": {
        title: "Grandparents in the Old Courtyard",
        description: "A warm black-and-white photo documenting beginnings in the rustic old wooden yard, where our family's chapters first began.",
        location: "Tanta, El-Gharbia"
      },
      "ph2": {
        title: "Warm Spring Outing Picnic",
        description: "A bright spring day full of laughter and collective games amidst green meadows and delightful foods.",
        location: "Al-Azhar Park, Cairo"
      },
      "ph3": {
        title: "Sea, Summer, and Lifelong Laughs",
        description: "Splendid vibes on the Alexandria beach and running alongside the warm evening waves.",
        location: "Bride of the Sea, Alexandria"
      },
      "ph4": {
        title: "Yasmin's Graduation Feast",
        description: "A historical family milestone filled with happy tears, marking years of hard work and pride.",
        location: "Cairo University, Giza"
      }
    }
  }
};

/**
 * Clean helper function to translate static default contents beautifully if requested
 */
export function translateMemberName(name: string, lang: Language): string {
  if (lang === "en") {
    return translations.en.members[name as keyof typeof translations.en.members] || name;
  }
  return translations.ar.members[name as keyof typeof translations.ar.members] || name;
}

export function translateMemberRole(role: string, lang: Language): string {
  if (lang === "en") {
    return translations.en.memberRoles[role as keyof typeof translations.en.memberRoles] || role;
  }
  return role;
}

export function translateAlbumTitle(albumId: string, fallbackTitle: string, lang: Language): string {
  if (lang === "en") {
    return translations.en.albums[albumId as keyof typeof translations.en.albums]?.title || fallbackTitle;
  }
  return translations.ar.albums[albumId as keyof typeof translations.ar.albums]?.title || fallbackTitle;
}

export function translateAlbumDesc(albumId: string, fallbackDesc: string, lang: Language): string {
  if (lang === "en") {
    return translations.en.albums[albumId as keyof typeof translations.en.albums]?.description || fallbackDesc;
  }
  return translations.ar.albums[albumId as keyof typeof translations.ar.albums]?.description || fallbackDesc;
}

export function translatePhotoTitle(photoId: string, fallbackTitle: string, lang: Language): string {
  if (lang === "en") {
    return translations.en.photos[photoId as keyof typeof translations.en.photos]?.title || fallbackTitle;
  }
  return translations.ar.photos[photoId as keyof typeof translations.ar.photos]?.title || fallbackTitle;
}

export function translatePhotoDesc(photoId: string, fallbackDesc: string, lang: Language): string {
  if (lang === "en") {
    return translations.en.photos[photoId as keyof typeof translations.en.photos]?.description || fallbackDesc;
  }
  return translations.ar.photos[photoId as keyof typeof translations.ar.photos]?.description || fallbackDesc;
}

export function translatePhotoLocation(photoId: string, fallbackLoc: string, lang: Language): string {
  if (lang === "en") {
    return translations.en.photos[photoId as keyof typeof translations.en.photos]?.location || fallbackLoc;
  }
  return translations.ar.photos[photoId as keyof typeof translations.ar.photos]?.location || fallbackLoc;
}
