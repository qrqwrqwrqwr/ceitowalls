import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://ceitowalls.vercel.app";
  const supabase = await createClient();
  const { data: wallpapers } = await supabase.from("wallpapers").select("id, created_at");

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...(wallpapers ?? []).map((w) => ({
      url: `${base}/w/${w.id}`,
      lastModified: new Date(w.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
