export interface Photo {
  id: string;
  src: string;
  title: string;
  description: string;
  date: string;
  year: number;
  location?: string;
  tags: string[]; // Names or roles of family members tagged
  rotation: number; // Degree rotation for polaroid collage effect (e.g., -10 to 10)
  albumId: string;
  size: "small" | "medium" | "large"; // Size variant for artistic collage wall layouts
}

export interface Album {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  period?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
}

export type ViewMode = "masonry" | "polaroid" | "timeline" | "carousel" | "video-maker" | "photo-studio";
export type Language = "ar" | "en";
export type ThemeMode = "light" | "dark";

export interface AudioTrack {
  id: string;
  name: string;
  url: string; // fallback or synthesizable type
  genre: string;
  duration: string;
}

