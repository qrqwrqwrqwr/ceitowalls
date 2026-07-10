import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadToR2 } from "@/lib/r2";

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
