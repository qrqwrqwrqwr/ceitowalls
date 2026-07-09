"use client";

import { useApp } from "@/context/AppContext";

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-lg border border-white/15 bg-[#0d0d0d] px-5 py-3 text-[13.5px] text-[#f0f0f0] shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
      {toast.message}
    </div>
  );
}
