export type Wallpaper = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  media_url: string;
  media_type: "image" | "video";
  resolution: string;
  file_size_bytes: number;
  uploader_id: string | null;
  votes: number;
  created_at: string;
};

export type Comment = {
  id: string;
  wallpaper_id: string;
  user_id: string;
  text: string;
  created_at: string;
  profiles?: { username: string } | null;
};

export type Profile = {
  id: string;
  username: string;
  photo_url: string | null;
  is_admin: boolean;
};

export const CATEGORY_PRESET = [
  "Fantasy",
  "Anime",
  "Vehicle",
  "Móvil Wallpaper",
  "Games",
  "Movies",
  "Abstract",
];

export const RESOLUTION_PRESET = [
  "3840x2160",
  "2560x1440",
  "1920x1080",
  "1366x768",
  "1280x720",
];
