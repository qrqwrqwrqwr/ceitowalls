"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Wallpaper } from "@/lib/types";

let currentlyPlaying: HTMLVideoElement | null = null;

export function WallpaperCard({
  wallpaper,
  isAdmin,
  onDeleteRequest,
}: {
  wallpaper: Wallpaper;
  isAdmin: boolean;
  onDeleteRequest: (id: string) => void;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  function togglePlay(e: React.MouseEvent) {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.pause();
      video.currentTime = 0;
      setPlaying(false);
      setProgress(0);
      if (currentlyPlaying === video) currentlyPlaying = null;
      return;
    }

    if (currentlyPlaying && currentlyPlaying !== video) {
      currentlyPlaying.pause();
      currentlyPlaying.currentTime = 0;
    }
    currentlyPlaying = video;
    video.currentTime = 0;
    video.play();
    setPlaying(true);
  }

  function onPause() {
    if (currentlyPlaying !== videoRef.current) {
      setPlaying(false);
      setProgress(0);
    }
  }

  function onTimeUpdate() {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  }

  function onEnded() {
    setPlaying(false);
    setProgress(0);
    if (currentlyPlaying === videoRef.current) currentlyPlaying = null;
  }

  return (
    <div className="overflow-hidden rounded-[10px] border border-white/8 bg-[#0d0d0d] transition-all duration-200 hover:-translate-y-1 hover:scale-[1.015] hover:border-white/50 hover:shadow-[0_12px_36px_4px_rgba(255,255,255,0.25)]">
      <div
        onClick={wallpaper.media_type === "video" ? togglePlay : undefined}
        className="group relative aspect-video cursor-pointer overflow-hidden bg-[#181022]"
      >
        {wallpaper.media_type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={wallpaper.media_url}
            alt={wallpaper.title}
            className="h-full w-full object-cover transition-[filter] duration-200 group-hover:brightness-[1.35]"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              src={wallpaper.media_url}
              muted
              preload="metadata"
              playsInline
              disablePictureInPicture
              disableRemotePlayback
              controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
              onTimeUpdate={onTimeUpdate}
              onEnded={onEnded}
              onPause={onPause}
              className="pointer-events-none h-full w-full object-cover transition-[filter] duration-200 group-hover:brightness-[1.35]"
            />
            {!playing && (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-[0_4px_18px_rgba(0,0,0,0.5)]">
                  <span className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-[#111]" />
                </span>
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/10">
              <div className="h-full bg-white transition-[width] duration-100 linear" style={{ width: `${progress}%` }} />
            </div>
          </>
        )}
        <span className="absolute left-2.5 top-2.5 rounded bg-black/65 px-2 py-1 font-mono text-[11.5px] tracking-[0.3px] text-[#e8e9ec]">
          {wallpaper.resolution}
        </span>
        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRequest(wallpaper.id);
            }}
            title="Eliminar"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-black/70 text-[#f0a0a0] hover:bg-[#c80000d9] hover:text-white"
          >
            ✕
          </button>
        )}
      </div>
      <div
        onClick={() => router.push(`/w/${wallpaper.id}`)}
        className="cursor-pointer px-3.5 pb-3.5 pt-3 hover:bg-white/4"
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="flex items-center gap-1 text-[12.5px] text-[#a88888]">👁 {wallpaper.views}</span>
          <span className="rounded bg-[oklch(0.55_0.2_25)] px-2.5 py-1 text-[11.5px] font-semibold text-[#2a0505]">
            {wallpaper.category}
          </span>
        </div>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[14.5px] font-semibold text-[#f0e6e6]">
          {wallpaper.title}
        </div>
      </div>
    </div>
  );
}
