import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function saveYoutubeVideo(data: {
  title: string;
  youtubeId: string;
}) {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };
  return supabase.from("gallery_videos").insert(data);
}

export async function loadYoutubeVideos() {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };
  return supabase
    .from("gallery_videos")
    .select("*")
    .order("created_at", { ascending: true });
}
