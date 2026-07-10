"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/context/AppContext";

export function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile, refreshProfile, showToast } = useApp();
  const [username, setUsername] = useState(profile?.username ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(profile?.photo_url ?? null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && profile) {
      setUsername(profile.username);
      setFile(null);
      setPreview(profile.photo_url);
    }
  }, [open, profile]);

  if (!open || !profile) return null;

  function pickPhoto() {
    inputRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function save() {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    let photoUrl = profile.photo_url;

    if (file) {
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      uploadForm.append("type", "avatar");
      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadForm });
      const uploadJson = await uploadRes.json();
      if (uploadRes.ok) {
        photoUrl = uploadJson.url;
      }
    }

    await supabase.from("profiles").update({ username, photo_url: photoUrl }).eq("id", profile.id);
    await refreshProfile();
    showToast("Perfil actualizado");
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4">
      <div className="my-auto max-h-[90vh] w-[300px] overflow-y-auto rounded-xl border border-white/12 bg-[#0d0d0d] p-[26px]">
        <div className="mb-[18px] text-[15px] font-semibold text-[#f0f0f0]">Editar perfil</div>

        <div className="mb-[18px] flex justify-center">
          <button
            onClick={pickPhoto}
            className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-white/25 bg-white/5 text-[28px] font-light text-white/60 backdrop-blur-md hover:border-white/60 hover:bg-white/8"
          >
            {!preview && <span>+</span>}
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
            )}
          </button>
          <input ref={inputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
        </div>

        <div className="mb-1.5 text-[11.5px] text-[#808080]">Nombre de usuario</div>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4 w-full rounded-[7px] border border-white/15 bg-[#181818] px-3 py-2.5 text-[13.5px] text-white outline-none"
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-[7px] border border-white/12 bg-[#181818] py-2.5 text-[13px] text-[#c0c0c0]"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-[7px] bg-white py-2.5 text-[13px] font-bold text-black disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
