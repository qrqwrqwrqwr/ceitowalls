"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { CATEGORY_PRESET, DISCORD_CATEGORY_PRESET } from "@/lib/types";
import { compressImageToLimit, compressVideoToLimit } from "@/lib/compress";

type PendingUpload = {
  file: File;
  mediaType: "image" | "video";
  resolution: string;
};

const MAX_UPLOAD_BYTES = 70 * 1024 * 1024;

function formatMB(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(1);
}

export function UploadButton() {
  const { profile, showToast } = useApp();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingUpload | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [compressing, setCompressing] = useState(false);

  function trigger() {
    inputRef.current?.click();
  }

  function readMetadata(file: File) {
    const isVideo = file.type.startsWith("video");
    const el = document.createElement(isVideo ? "video" : "img");

    const finish = (width: number, height: number) => {
      setPending({ file, mediaType: isVideo ? "video" : "image", resolution: `${width}x${height}` });
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
      setCategory("");
    };

    if (isVideo) {
      const video = el as HTMLVideoElement;
      video.preload = "metadata";
      video.onloadedmetadata = () => finish(video.videoWidth, video.videoHeight);
      video.src = URL.createObjectURL(file);
    } else {
      const img = el as HTMLImageElement;
      img.onload = () => finish(img.naturalWidth, img.naturalHeight);
      img.src = URL.createObjectURL(file);
    }
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.files?.[0];
    e.target.value = "";
    if (!raw) return;

    let file = raw;

    if (file.size > MAX_UPLOAD_BYTES) {
      setCompressing(true);
      showToast(`Comprimiendo ${formatMB(file.size)}MB para bajar de 50MB, puede tardar…`);
      try {
        file = file.type.startsWith("video")
          ? await compressVideoToLimit(file, MAX_UPLOAD_BYTES)
          : await compressImageToLimit(file, MAX_UPLOAD_BYTES);
        showToast(`Comprimido a ${formatMB(file.size)}MB`);
      } catch (err) {
        showToast(`No se pudo comprimir: ${(err as Error).message}`);
        setCompressing(false);
        return;
      }
      setCompressing(false);
    }

    readMetadata(file);
  }

  function cancel() {
    setPending(null);
  }

  async function confirm() {
    if (!pending || !profile) return;
    setSaving(true);
    const supabase = createClient();

    const uploadForm = new FormData();
    uploadForm.append("file", pending.file);
    uploadForm.append("type", "wallpaper");
    const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadForm });
    const uploadJson = await uploadRes.json();
    if (!uploadRes.ok) {
      showToast(`Error al subir: ${uploadJson.error}`);
      setSaving(false);
      return;
    }
    const mediaUrl: string = uploadJson.url;

    const { error: insertError } = await supabase.from("wallpapers").insert({
      title: title || pending.file.name,
      category: category || "Sin categoría",
      tags: category ? [category] : [],
      media_url: mediaUrl,
      media_type: pending.mediaType,
      resolution: pending.resolution,
      file_size_bytes: pending.file.size,
      uploader_id: profile.id,
    });

    setSaving(false);
    if (insertError) {
      showToast(`Error al guardar: ${insertError.message}`);
      return;
    }
    showToast("Wallpaper agregado");
    setPending(null);
    router.refresh();
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*,video/*" onChange={onFileChange} className="hidden" />
      <button
        onClick={trigger}
        disabled={compressing}
        className="rounded-[7px] bg-white px-4 py-2.5 text-[12.5px] font-bold tracking-[0.4px] text-black hover:bg-[#d8d8d8] disabled:opacity-50"
      >
        {compressing ? "COMPRIMIENDO…" : "↑ SUBIR"}
      </button>

      {pending && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <div className="my-auto max-h-[90vh] w-80 overflow-y-auto rounded-xl border border-white/12 bg-[#0d0d0d] p-[26px]">
            <div className="mb-3.5 text-[15px] font-semibold text-[#f0f0f0]">Detalles del wallpaper</div>
            <div className="mb-1.5 text-[11.5px] text-[#808080]">Título</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre del wallpaper"
              className="mb-3 w-full rounded-[7px] border border-white/15 bg-[#181818] px-3 py-2.5 text-[13.5px] text-white outline-none"
            />
            <div className="mb-1.5 text-[11.5px] text-[#808080]">Etiqueta / categoría</div>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ej: Anime, Fantasy, Vehicle…"
              className="mb-2 w-full rounded-[7px] border border-white/15 bg-[#181818] px-3 py-2.5 text-[13.5px] text-white outline-none"
            />
            <div className="mb-4 flex flex-wrap gap-1.5">
              {[...CATEGORY_PRESET, ...DISCORD_CATEGORY_PRESET].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`rounded-full border px-3 py-1 text-[12px] ${
                    category === c
                      ? "border-white bg-white text-black"
                      : "border-white/15 bg-[#181818] text-[#c0c0c0] hover:border-white/40"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={cancel}
                className="flex-1 rounded-[7px] border border-white/12 bg-[#181818] py-2.5 text-[13px] text-[#c0c0c0]"
              >
                Cancelar
              </button>
              <button
                onClick={confirm}
                disabled={saving}
                className="flex-1 rounded-[7px] bg-white py-2.5 text-[13px] font-bold text-black disabled:opacity-50"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
