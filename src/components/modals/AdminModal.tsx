"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";

const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE || "ceito2026";

export function AdminModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setIsAdminUnlocked, showToast } = useApp();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  if (!open) return null;

  function submit() {
    if (code === ADMIN_CODE) {
      setIsAdminUnlocked(true);
      showToast("Modo administrador activado");
      setCode("");
      setError(false);
      onClose();
    } else {
      setError(true);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4">
      <div className="my-auto max-h-[90vh] w-[300px] overflow-y-auto rounded-xl border border-white/12 bg-[#0d0d0d] p-[26px]">
        <div className="mb-3.5 text-[15px] font-semibold text-[#f0f0f0]">Código de administrador</div>
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="mb-2 w-full rounded-[7px] border border-white/15 bg-[#181818] px-3 py-2.5 text-[13.5px] text-white outline-none"
        />
        {error && <div className="mb-2.5 text-[12.5px] text-[#f06a6a]">Código incorrecto.</div>}
        <div className="mt-3 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-[7px] border border-white/12 bg-[#181818] py-2.5 text-[13px] text-[#c0c0c0]"
          >
            Cancelar
          </button>
          <button onClick={submit} className="flex-1 rounded-[7px] bg-white py-2.5 text-[13px] font-bold text-black">
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}
