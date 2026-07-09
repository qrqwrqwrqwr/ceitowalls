"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { CATEGORY_PRESET, RESOLUTION_PRESET } from "@/lib/types";
import { AuthModal } from "@/components/modals/AuthModal";
import { ProfileModal } from "@/components/modals/ProfileModal";

export function Header({
  searchQuery,
  onSearchChange,
  activeCategory,
  activeResolution,
  onCategoryChange,
  onResolutionChange,
}: {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  activeCategory: string | null;
  activeResolution: string | null;
  onCategoryChange: (c: string | null) => void;
  onResolutionChange: (r: string | null) => void;
}) {
  const { profile, setAuthModalOpen, logout } = useApp();
  const router = useRouter();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [resolutionsOpen, setResolutionsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  function goHome() {
    onCategoryChange(null);
    onResolutionChange(null);
    onSearchChange("");
    router.push("/");
  }

  return (
    <>
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-white/10 bg-black/90 px-4 py-3 backdrop-blur-sm sm:gap-4 sm:px-7 sm:py-3.5 md:flex-nowrap md:gap-7">
      <button onClick={goHome} className="flex flex-shrink-0 cursor-pointer items-center gap-2.5">
        <div className="text-[18px] font-bold leading-none tracking-[0.3px] sm:text-[20px]">
          <span className="text-[#f2f3f5]">CEITO</span>
          <span className="animate-[rgbCycle_6s_linear_infinite] text-[oklch(0.6_0.22_25)]">WALLS</span>
        </div>
      </button>

      <nav className="hidden items-center gap-[22px] text-[14.5px] font-medium text-[#b7bac2] md:flex">
        <div className="relative">
          <button
            onClick={() => setCategoriesOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-white/12 bg-[#0d0d0d] px-4 py-2.5 text-[13.5px] text-[#e0e0e0] hover:border-white/35 hover:bg-[#1a1a1a]"
          >
            Categories
            <span className={`text-[10px] transition-transform ${categoriesOpen ? "rotate-180" : ""}`}>▾</span>
          </button>
          {categoriesOpen && (
            <div className="absolute left-0 top-full z-30 mt-2 flex min-w-[180px] flex-col gap-0.5 rounded-[10px] border border-white/12 bg-[#0d0d0d] p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.6)]">
              <button
                onClick={() => {
                  onCategoryChange(null);
                  setCategoriesOpen(false);
                }}
                className="rounded-md px-3.5 py-2 text-left text-sm text-[#d0d0d0] hover:bg-white/10 hover:text-white"
              >
                Inicio
              </button>
              {CATEGORY_PRESET.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onCategoryChange(c);
                    setCategoriesOpen(false);
                  }}
                  className="rounded-md px-3.5 py-2 text-left text-sm text-[#d0d0d0] hover:bg-white/10 hover:text-white"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setResolutionsOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-white/12 bg-[#0d0d0d] px-4 py-2.5 text-[13.5px] text-[#e0e0e0] hover:border-white/35 hover:bg-[#1a1a1a]"
          >
            Resolutions
            <span className={`text-[10px] transition-transform ${resolutionsOpen ? "rotate-180" : ""}`}>▾</span>
          </button>
          {resolutionsOpen && (
            <div className="absolute left-0 top-full z-30 mt-2 flex max-h-80 min-w-[190px] flex-col gap-0.5 overflow-y-auto rounded-[10px] border border-white/12 bg-[#0d0d0d] p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.6)]">
              <button
                onClick={() => {
                  onResolutionChange(null);
                  setResolutionsOpen(false);
                }}
                className="rounded-md px-3.5 py-2 text-left text-sm text-[#d0d0d0] hover:bg-white/10 hover:text-white"
              >
                Todas
              </button>
              {RESOLUTION_PRESET.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    onResolutionChange(r);
                    setResolutionsOpen(false);
                  }}
                  className="rounded-md px-3.5 py-2 text-left text-sm text-[#d0d0d0] hover:bg-white/10 hover:text-white"
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="order-last flex w-full min-w-0 items-center gap-2.5 rounded-lg border border-white/12 bg-[#0d0d0d] px-3.5 py-2 sm:order-none sm:ml-auto sm:w-[200px] lg:w-[280px]">
        <span className="text-sm text-[#7a7a7a]">⌕</span>
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search live wallpapers…"
          className="w-full bg-transparent text-[13.5px] text-[#e8dede] outline-none"
        />
      </div>

      {profile ? (
        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-2 rounded-full border border-white/12 bg-[#0d0d0d] py-1.5 pl-1.5 pr-3.5 text-[13px] font-semibold text-[#e0e0e0] hover:border-white/40"
          >
            <span className="relative flex h-[26px] w-[26px] items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/8 text-xs font-bold text-[#e0e0e0]">
              {profile.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.photo_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                profile.username.charAt(0).toUpperCase()
              )}
            </span>
            {profile.username}
          </button>
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="h-[34px] w-[34px] rounded-full border border-white/12 bg-[#0d0d0d] text-[13px] text-[#a0a0a0] hover:border-white/40 hover:text-white"
          >
            ⏻
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAuthModalOpen(true)}
          className="ml-auto rounded-full bg-white px-4 py-2.5 text-[13px] font-bold text-black hover:bg-[#d8d8d8] sm:ml-0"
        >
          INICIAR SESIÓN
        </button>
      )}
    </header>
    <AuthModal />
    <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
