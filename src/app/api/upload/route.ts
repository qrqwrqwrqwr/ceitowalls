import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadToR2, getTotalStorageUsedBytes } from "@/lib/r2";

const STORAGE_LIMIT_BYTES = 9 * 1024 * 1024 * 1024; // 9GB safety margin out of R2's 10GB free tier

function formatGB(bytes: number) {
  return (bytes / 1024 / 1024 / 1024).toFixed(2);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null;

  if (!file || (type !== "wallpaper" && type !== "avatar")) {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  if (type === "wallpaper") {
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Solo administradores pueden subir wallpapers" }, { status: 403 });
    }
  }

  const usedBytes = await getTotalStorageUsedBytes();
  if (usedBytes + file.size > STORAGE_LIMIT_BYTES) {
    return NextResponse.json(
      {
        error: `No hay espacio suficiente: ya se usaron ${formatGB(usedBytes)}GB de un límite de ${formatGB(
          STORAGE_LIMIT_BYTES
        )}GB. Este archivo no entra. Contactá al administrador para liberar espacio o ampliar el plan.`,
      },
      { status: 413 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const prefix = type === "avatar" ? "avatars" : user.id;
  const key = `${prefix}/${Date.now()}-${file.name}`;

  try {
    const url = await uploadToR2(key, buffer, file.type || "application/octet-stream");
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al subir" }, { status: 500 });
  }
}
