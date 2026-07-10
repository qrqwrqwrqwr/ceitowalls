"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/context/AppContext";
import { Header } from "@/components/Header";
import type { Comment, Wallpaper } from "@/lib/types";

type Tab = "info" | "share" | "comments";

const QUALITIES = ["144p", "360p", "480p", "720p", "1080p", "2K", "4K"] as const;
const QUALITY_BLUR: Record<(typeof QUALITIES)[number], string> = {
  "144p": "blur(10px)",
  "360p": "blur(6px)",
  "480p": "blur(4px)",
  "720p": "blur(1.5px)",
  "1080p": "none",
  "2K": "none",
  "4K": "none",
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function DetailView({
  wallpaper,
  comments,
  related,
}: {
  wallpaper: Wallpaper;
  comments: Comment[];
  related: Wallpaper[];
}) {
  const { profile, setAuthModalOpen, showToast } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("info");
  const [quality, setQuality] = useState<(typeof QUALITIES)[number]>("1080p");
  const [qualityOpen, setQualityOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentList, setCommentList] = useState(comments);
  const [posting, setPosting] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const ext = wallpaper.media_url.split(".").pop()?.split("?")[0] || (wallpaper.media_type === "video" ? "mp4" : "jpg");
  const downloadName = `${slugify(wallpaper.title)}-ceitowalls-com.${ext}`;

  async function submitComment() {
    if (!profile || !commentDraft.trim()) return;
    setPosting(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("comments")
      .insert({ wallpaper_id: wallpaper.id, user_id: profile.id, text: commentDraft.trim() })
      .select("id, wallpaper_id, user_id, text, created_at")
      .single();
    setPosting(false);
    if (error) {
      showToast(`Error al comentar: ${error.message}`);
      return;
    }
    setCommentList((prev) => [...prev, { ...data, profiles: { username: profile.username } }]);
    setCommentDraft("");
  }

  async function deleteComment(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) {
      showToast(`Error al eliminar: ${error.message}`);
      return;
    }
    setCommentList((prev) => prev.filter((c) => c.id !== id));
    showToast("Comentario eliminado");
  }

  async function download() {
    const res = await fetch(wallpaper.media_url);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName;
    a.click();
    URL.revokeObjectURL(url);

    const supabase = createClient();
    await supabase.from("downloads").insert({
      wallpaper_id: wallpaper.id,
      user_id: profile?.id ?? null,
    });
  }

  return (
    <div className="min-h-screen bg-black text-[#e8dede]">
      <Header
        searchQuery=""
        onSearchChange={() => router.push("/")}
        activeCategory={null}
        activeResolution={null}
        onCategoryChange={() => router.push("/")}
        onResolutionChange={() => router.push("/")}
      />

      <div className="grid grid-cols-1 items-start gap-6 px-4 pb-10 pt-5 sm:px-[30px] sm:pb-[60px] sm:pt-[26px] lg:grid-cols-[1fr_340px]">
        <div>
          <button
            onClick={() => router.push("/")}
            className="mb-[18px] flex items-center gap-1.5 text-[13.5px] text-[#a0a0a0] hover:text-white"
          >
            ← Back to wallpapers
          </button>

          <div className="overflow-hidden rounded-[10px] border border-white/8 bg-[#0d0d0d]">
            <div className="relative aspect-video overflow-hidden bg-[#181022]">
              {wallpaper.media_type === "video" ? (
                <>
                  <video
                    src={wallpaper.media_url}
                    controls
                    autoPlay
                    loop
                    muted
                    style={{ filter: QUALITY_BLUR[quality] }}
                    className="h-full w-full object-contain bg-black transition-[filter] duration-200"
                  />
                  <div className="absolute right-3 top-3 z-10">
                    <button
                      onClick={() => setQualityOpen((v) => !v)}
                      className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/70 px-3 py-1.5 text-[12.5px] font-semibold text-white hover:border-white/50 hover:bg-black/90"
                    >
                      ⚙ {quality}
                      <span className={`text-[9px] transition-transform ${qualityOpen ? "rotate-180" : ""}`}>▾</span>
                    </button>
                    {qualityOpen && (
                      <div className="absolute right-0 top-full mt-2 flex min-w-[110px] flex-col gap-0.5 rounded-lg border border-white/15 bg-[#0d0d0d] p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.6)]">
                        {QUALITIES.map((q) => (
                          <button
                            key={q}
                            onClick={() => {
                              setQuality(q);
                              setQualityOpen(false);
                            }}
                            className={`rounded-md px-3 py-2 text-left text-[13px] hover:bg-white/10 hover:text-white ${
                              q === quality ? "text-white" : "text-[#c0c0c0]"
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={wallpaper.media_url} alt={wallpaper.title} className="h-full w-full object-contain bg-black" />
              )}
            </div>
            <div className="border-t border-white/8 py-3 text-center text-xs font-semibold tracking-[1.2px] text-[#a0a0a0]">
              PREVIEW {wallpaper.media_type === "video" ? "VIDEO" : "IMAGE"}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex gap-6 border-b border-white/10 text-[13.5px] font-semibold text-[#808080]">
              <button
                onClick={() => setTab("info")}
                className={`border-b-2 py-3 ${tab === "info" ? "border-white text-white" : "border-transparent"}`}
              >
                Information
              </button>
              <button
                onClick={() => setTab("share")}
                className={`border-b-2 py-3 ${tab === "share" ? "border-white text-white" : "border-transparent"}`}
              >
                Share
              </button>
              <button
                onClick={() => setTab("comments")}
                className={`border-b-2 py-3 ${tab === "comments" ? "border-white text-white" : "border-transparent"}`}
              >
                {commentList.length} Comments
              </button>
            </div>

            {tab === "info" && (
              <div className="pt-[22px]">
                <div className="mb-3 text-xs font-semibold tracking-[1px] text-[#808080]">TAGS</div>
                <div className="mb-[22px] flex flex-wrap gap-2">
                  {wallpaper.tags.length === 0 && <span className="text-sm text-[#707070]">Sin etiquetas.</span>}
                  {wallpaper.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-[5px] border border-white/12 bg-[#0d0d0d] px-3 py-1.5 text-[12.5px] text-[#c8c8c8]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tab === "share" && (
              <div className="pt-[22px]">
                <div className="mb-3 text-xs font-semibold tracking-[1px] text-[#808080]">COMPARTIR EN</div>
                <div className="mb-6 flex flex-wrap gap-2.5">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-[#25D366] px-4 py-2.5 text-[13px] font-semibold text-white hover:opacity-85"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-white/20 bg-[#111] px-4 py-2.5 text-[13px] font-semibold text-white hover:opacity-85"
                  >
                    X
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-[#3b5998] px-4 py-2.5 text-[13px] font-semibold text-white hover:opacity-85"
                  >
                    Facebook
                  </a>
                  <a
                    href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-[#FF4500] px-4 py-2.5 text-[13px] font-semibold text-white hover:opacity-85"
                  >
                    Reddit
                  </a>
                </div>
                <div className="mb-2 text-xs font-semibold tracking-[1px] text-[#808080]">ENLACE DIRECTO</div>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap rounded-[7px] border border-white/12 bg-[#0d0d0d] px-3 py-2.5 text-[13px] text-[#c8c8c8]">
                  {shareUrl}
                </div>
              </div>
            )}

            {tab === "comments" && (
              <div className="pt-[22px]">
                {profile ? (
                  <div className="mb-[18px] flex gap-2.5">
                    <input
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitComment()}
                      placeholder="Escribí un comentario…"
                      className="flex-1 rounded-[7px] border border-white/12 bg-[#0d0d0d] px-3 py-2.5 text-[13.5px] text-white outline-none"
                    />
                    <button
                      onClick={submitComment}
                      disabled={posting}
                      className="rounded-[7px] bg-white px-[18px] text-[13px] font-bold text-black disabled:opacity-50"
                    >
                      Enviar
                    </button>
                  </div>
                ) : (
                  <div className="mb-[18px] rounded-lg border border-dashed border-white/15 p-4 text-center text-[13.5px] text-[#a0a0a0]">
                    Iniciá sesión para poder comentar.{" "}
                    <button onClick={() => setAuthModalOpen(true)} className="text-white underline">
                      Iniciar sesión
                    </button>
                  </div>
                )}

                {commentList.length === 0 ? (
                  <div className="py-5 text-center text-[13.5px] italic text-[#707070]">Sé el primero en comentar.</div>
                ) : (
                  <div className="flex flex-col gap-3.5">
                    {commentList.map((c) => (
                      <div key={c.id} className="border-b border-white/6 pb-3">
                        <div className="mb-1 flex items-baseline gap-2">
                          <span className="text-[13.5px] font-semibold text-white">
                            {c.profiles?.username ?? "Usuario"}
                          </span>
                          <span className="text-[11.5px] text-[#808080]">
                            {new Date(c.created_at).toLocaleDateString()}
                          </span>
                          {profile && (profile.id === c.user_id || profile.is_admin) && (
                            <button
                              onClick={() => deleteComment(c.id)}
                              className="ml-auto text-[11.5px] text-[#808080] hover:text-[#f06a6a]"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                        <div className="text-[13.5px] leading-relaxed text-[#c8c8c8]">{c.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="mb-4 text-[17px] font-semibold text-[#f0f0f0]">{wallpaper.title}</div>

          <button
            onClick={download}
            className="mb-[18px] w-full rounded-lg bg-white py-3.5 text-[13.5px] font-bold tracking-[0.5px] text-black hover:bg-[#d8d8d8]"
          >
            DOWNLOAD {wallpaper.category === "Icono" ? "ICONO" : wallpaper.category === "Banner" ? "BANNER" : "WALLPAPER"}
          </button>

          <div className="overflow-hidden rounded-[10px] border border-white/8 bg-[#0d0d0d]">
            <div className="flex justify-between border-b border-white/6 px-4 py-3 text-[13.5px]">
              <span className="text-[#909090]">Date</span>
              <span className="text-[#e0e0e0]">{new Date(wallpaper.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between border-b border-white/6 px-4 py-3 text-[13.5px]">
              <span className="text-[#909090]">Category</span>
              <span className="text-[#e0e0e0]">{wallpaper.category}</span>
            </div>
            <div className="flex justify-between border-b border-white/6 px-4 py-3 text-[13.5px]">
              <span className="text-[#909090]">Resolution</span>
              <span className="text-[#e0e0e0]">{wallpaper.resolution}</span>
            </div>
            <div className="flex justify-between border-b border-white/6 px-4 py-3 text-[13.5px]">
              <span className="text-[#909090]">File Size</span>
              <span className="text-[#e0e0e0]">{formatBytes(wallpaper.file_size_bytes)}</span>
            </div>
            <div className="flex justify-between px-4 py-3 text-[13.5px]">
              <span className="text-[#909090]">Views</span>
              <span className="text-[#e0e0e0]">{wallpaper.views.toLocaleString()}</span>
            </div>
          </div>

          {related.length > 0 && (
            <>
              <div className="mb-3 mt-[22px] text-[13px] font-semibold tracking-[0.8px] text-[#a0a0a0]">RELATED</div>
              <div className="flex flex-col gap-2.5">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/w/${r.id}`}
                    className="flex items-center gap-2.5 rounded-lg border border-white/8 bg-[#0d0d0d] p-2 hover:border-white/30"
                  >
                    <div className="h-12 w-20 flex-shrink-0 overflow-hidden rounded bg-[#181022]">
                      {r.media_type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.media_url} alt={r.title} className="h-full w-full object-cover" />
                      ) : (
                        <video src={r.media_url} muted className="h-full w-full object-cover" />
                      )}
                    </div>
                    <span className="truncate text-[13px] text-[#e0e0e0]">{r.title}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
