import { Album, FamilyMember, Photo } from "./types";

export const DEFAULT_MEMBERS: FamilyMember[] = [
  { id: "1", name: "الجد أحمد", role: "الجد / Grandfather", avatarColor: "bg-amber-700 text-white" },
  { id: "2", name: "الجدة فاطمة", role: "الجدة / Grandmother", avatarColor: "bg-rose-700 text-white" },
  { id: "3", name: "الأب علاء", role: "الأب / Father", avatarColor: "bg-blue-700 text-white" },
  { id: "4", name: "الأم ليلى", role: "الأم / Mother", avatarColor: "bg-teal-700 text-white" },
  { id: "5", name: "الابنة ياسمين", role: "الابنة / Daughter", avatarColor: "bg-purple-700 text-white" },
  { id: "6", name: "الابن عمر", role: "الابن / Son", avatarColor: "bg-indigo-700 text-white" },
];

export const DEFAULT_ALBUMS: Album[] = [
  {
    id: "roots",
    title: "الجذور والبدايات",
    description: "صور أثرية وحكايات قديمة من عبق الماضي تأسس عليها دفء عائلتنا.",
    coverImage: "/src/assets/images/grandparents_vintage_1779309468697.png",
    period: "1970 - 1985",
  },
  {
    id: "trips",
    title: "مغامرات ورحلات عائلية",
    description: "لحظات الانطلاق والضحك في السفر والرحلات الصيفية وعطلات نهاية الأسبوع.",
    coverImage: "/src/assets/images/beach_vacation_1779309488226.png",
    period: "2010 - 2020",
  },
  {
    id: "milestones",
    title: "أفراح وإنجازات",
    description: "الأيام الحافلة بالفخر من شهادات التخرج، أعياد الميلاد، والنجاحات الفردية.",
    coverImage: "/src/assets/images/graduation_1779309504321.png",
    period: "2020 - 2026",
  },
];

export const DEFAULT_PHOTOS: Photo[] = [
  {
    id: "ph1",
    src: "/src/assets/images/grandparents_vintage_1779309468697.png",
    title: "الجد والجدة في حوش المنزل القديم",
    description: "صورة دافئة توثق البدايات في فناء المنزل الخشبي الريفي القديم، حيث بدأت فصول عائلتنا.",
    date: "1978-05-15",
    year: 1978,
    location: "طنطا، الغربية",
    tags: ["الجد أحمد", "الجدة فاطمة"],
    rotation: -4,
    albumId: "roots",
    size: "medium",
  },
  {
    id: "ph2",
    src: "/src/assets/images/family_picnic_1779309450025.png",
    title: "نزهة ربيعية دافئة",
    description: "يوم ربيعي مشرق مليء بالضحك واللعب الجماعي وسط المروج الخضراء والأطعمة الشهية.",
    date: "2012-04-10",
    year: 2012,
    location: "حديقة الأزهر، القاهرة",
    tags: ["الأب علاء", "الأم ليلى", "الابنة ياسمين", "الابن عمر"],
    rotation: 5,
    albumId: "trips",
    size: "large",
  },
  {
    id: "ph3",
    src: "/src/assets/images/beach_vacation_1779309488226.png",
    title: "بحر وصيف وضحكات لا تغيب",
    description: "أجواء عائلية رائعة على شاطئ الإسكندرية وسباق الضحك مع أمواج البحر الدافئة في المساء القريب.",
    date: "2018-07-22",
    year: 2018,
    location: "عروس البحر، الإسكندرية",
    tags: ["الأب علاء", "الأم ليلى", "الابن عمر"],
    rotation: -6,
    albumId: "trips",
    size: "medium",
  },
  {
    id: "ph4",
    src: "/src/assets/images/graduation_1779309504321.png",
    title: "فرحة تخرج ياسمين",
    description: "لحظة تاريخية مليئة بدموع الفرح وتكليل سنوات الدراسة والجهد بفخر واعتزاز شديد.",
    date: "2024-06-18",
    year: 2024,
    location: "جامعة القاهرة، الجيزة",
    tags: ["الأب علاء", "الأم ليلى", "الابنة ياسمين"],
    rotation: 3,
    albumId: "milestones",
    size: "large",
  },
];
