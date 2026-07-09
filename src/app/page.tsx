import { createClient } from "@/lib/supabase/server";
import { GridView } from "@/components/GridView";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("wallpapers")
    .select("*")
    .order("created_at", { ascending: false });

  return <GridView wallpapers={data ?? []} />;
}
