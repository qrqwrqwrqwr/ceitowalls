"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { WallpaperCard } from "@/components/WallpaperCard";
import { UploadButton } from "@/components/modals/UploadModal";
import { AdminModal } from "@/components/modals/AdminModal";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import type { Wallpaper } from "@/lib/types";

const PAGE_SIZE = 16;

export function GridView({ wallpapers }: { wallpapers: Wallpaper[] }) {
  const { profile, isAdminUnlocked, setIsAdminUnlocked, showToast } = useApp();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeResolution, setActiveResolution] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const isAdmin = Boolean(profile?.is_admin && isAdminUnlocked);

  const filtered = useMemo(() => {
    return wallpapers.filter((w) => {
      if (activeCategory && w.category !== activeCategory) return false;
      if (activeResolution && w.resolution !== activeResolution) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const haystack = `${w.title} ${w.category} ${w.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [wallpapers, activeCategory, activeResolution, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleAdmin() {
    if (isAdminUnlocked) {
      setIsAdminUnlocked(false);
      showToast("Modo administrador desactivado");
    } else {
      setAdminModalOpen(true);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const supabase = createClient();
    const { error } = await supabase.from("wallpapers").delete().eq("id", deleteTarget);
    setDeleteTarget(null);
    if (error) {
      showToast(`Error al eliminar: ${error.message}`);
      return;
    }
    showToast("Wallpaper eliminado");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-black text-[#e8dede]">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        activeResolution={activeResolution}
        onCategoryChange={(c) => {
          setActiveCategory(c);
          setPage(1);
        }}
        onResolutionChange={(r) => {
          setActiveResolution(r);
          setPage(1);
        }}
      />

      <main className="px-[30px] pb-[140px] pt-[26px]">
        <div className="mb-[18px] flex items-center justify-between">
          <div className="text-[13px] font-semibold tracking-[1.2px] text-[#a88888]">LATEST VIDEOS</div>
          <div className="flex items-center gap-2.5">
            {profile?.is_admin && <UploadButton />}
            {profile?.is_admin && (
              <button
                onClick={toggleAdmin}
                title="Modo administrador"
                className={`h-[34px] w-[34px] rounded-[7px] border border-white/12 bg-[#0d0d0d] text-sm hover:border-white/40 ${
                  isAdminUnlocked ? "text-[oklch(0.6_0.22_25)]" : "text-white"
                }`}
              >
                ⚙
              </button>
            )}
          </div>
        </div>

        {pageItems.length === 0 ? (
          <div className="py-20 text-center text-[#707070]">No se encontraron wallpapers.</div>
        ) : (
          <div className="grid grid-cols-3 gap-[22px]">
            {pageItems.map((w) => (
              <WallpaperCard key={w.id} wallpaper={w} isAdmin={isAdmin} onDeleteRequest={setDeleteTarget} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-9 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-10 w-10 rounded-[7px] border border-white/12 text-sm font-semibold hover:border-white/50 ${
                  p === page ? "bg-white text-black" : "bg-[#0d0d0d] text-[#e0e0e0]"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-10 rounded-[7px] border border-white/12 bg-[#0d0d0d] px-[18px] text-[13px] font-bold tracking-[0.4px] text-[#e0e0e0] disabled:opacity-40"
            >
              NEXT →
            </button>
          </div>
        )}
      </main>

      <AdminModal open={adminModalOpen} onClose={() => setAdminModalOpen(false)} />
      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
