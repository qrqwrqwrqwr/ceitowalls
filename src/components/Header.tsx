"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { CATEGORY_PRESET, DISCORD_CATEGORY_PRESET, RESOLUTION_PRESET } from "@/lib/types";
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
  const [discordCategoryOpen, setDiscordCategoryOpen] = useState(false);
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

        <div className="relative">
          <button
            onClick={() => setDiscordCategoryOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-white/12 bg-[#0d0d0d] px-4 py-2.5 text-[13.5px] text-[#e0e0e0] hover:border-white/35 hover:bg-[#1a1a1a]"
          >
            Discord
            <span className={`text-[10px] transition-transform ${discordCategoryOpen ? "rotate-180" : ""}`}>▾</span>
          </button>
          {discordCategoryOpen && (
            <div className="absolute left-0 top-full z-30 mt-2 flex min-w-[160px] flex-col gap-0.5 rounded-[10px] border border-white/12 bg-[#0d0d0d] p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.6)]">
              {DISCORD_CATEGORY_PRESET.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onCategoryChange(c);
                    setDiscordCategoryOpen(false);
                  }}
                  className="rounded-md px-3.5 py-2 text-left text-sm text-[#d0d0d0] hover:bg-white/10 hover:text-white"
                >
                  {c}
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

      <a
        href="https://discord.gg/4Hsfav6wy6"
        target="_blank"
        rel="noreferrer"
        title="Únete a nuestro Discord"
        className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full border border-white/12 bg-[#0d0d0d] text-[#e0e0e0] hover:border-white/40 hover:bg-[#1a1a1a] hover:text-[#5865F2]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.036A18.35 18.35 0 0 0 3.677 4.492a.07.07 0 0 0-.032.027C.533 9.093-.32 13.58.099 18.011a.08.08 0 0 0 .031.055 18.5 18.5 0 0 0 5.494 2.775.078.078 0 0 0 .084-.026 13.2 13.2 0 0 0 1.14-1.85.076.076 0 0 0-.041-.106 12.2 12.2 0 0 1-1.741-.828.077.077 0 0 1-.008-.128q.175-.13.337-.267a.074.074 0 0 1 .077-.01c3.655 1.664 7.612 1.664 11.223 0a.074.074 0 0 1 .078.009q.163.137.337.268a.077.077 0 0 1-.006.127 11.4 11.4 0 0 1-1.742.83.076.076 0 0 0-.041.105c.334.643.72 1.255 1.139 1.85a.077.077 0 0 0 .084.026 18.45 18.45 0 0 0 5.505-2.775.077.077 0 0 0 .032-.054c.5-5.126-.838-9.577-3.548-13.492a.06.06 0 0 0-.031-.028M8.02 15.278c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38m7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.947 2.38-2.157 2.38" />
        </svg>
      </a>

      {profile ? (
        <div className="flex items-center gap-2">
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
