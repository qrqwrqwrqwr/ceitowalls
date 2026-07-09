import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DetailView } from "@/components/DetailView";
import type { Comment, Wallpaper } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function WallpaperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: wallpaper } = await supabase.from("wallpapers").select("*").eq("id", id).single();
  if (!wallpaper) notFound();

  const { data: comments } = await supabase
    .from("comments")
    .select("id, wallpaper_id, user_id, text, created_at, profiles(username)")
    .eq("wallpaper_id", id)
    .order("created_at", { ascending: true });

  const { data: related } = await supabase
    .from("wallpapers")
    .select("*")
    .neq("id", id)
    .limit(50);

  const scored = ((related ?? []) as Wallpaper[])
    .map((w) => {
      let score = 0;
      if (w.category === wallpaper.category) score += 5;
      const titleWords = new Set(wallpaper.title.toLowerCase().split(/\s+/).filter((s: string) => s.length >= 3));
      for (const word of w.title.toLowerCase().split(/\s+/)) {
        if (word.length >= 3 && titleWords.has(word)) score += 1;
      }
      return { w, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((s) => s.w);

  return (
    <DetailView
      wallpaper={wallpaper as Wallpaper}
      comments={(comments ?? []).map((c) => ({
        ...c,
        profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles,
      })) as Comment[]}
      related={scored}
    />
  );
}
