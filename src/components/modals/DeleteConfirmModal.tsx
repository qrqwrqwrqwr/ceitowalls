"use client";

export function DeleteConfirmModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4">
      <div className="my-auto max-h-[90vh] w-[300px] overflow-y-auto rounded-xl border border-white/12 bg-[#0d0d0d] p-[26px]">
        <div className="mb-[18px] text-[15px] font-semibold text-[#f0f0f0]">¿Eliminar este wallpaper?</div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-[7px] border border-white/12 bg-[#181818] py-2.5 text-[13px] text-[#c0c0c0]"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-[7px] bg-[#e0453a] py-2.5 text-[13px] font-bold text-white"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
