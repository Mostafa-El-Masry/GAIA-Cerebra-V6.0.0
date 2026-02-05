import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function createExternalVideo(data: {
  title: string;
  embed_url: string;
}) {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };
  const res = await fetch("/api/oembed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: data.embed_url }),
  });
  const oembed = await res.json();
  return supabase.from("gallery_videos").insert({
    title: data.title,
    embed_url: data.embed_url,
    embed_html: oembed.html,
  });
}

export async function saveProgress(videoId: string, seconds: number) {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };
  return supabase
    .from("gallery_watch_history")
    .upsert({ video_id: videoId, progress_seconds: Math.floor(seconds) });
}

export async function loadProgress(videoId: string) {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };
  return supabase
    .from("gallery_watch_history")
    .select("progress_seconds")
    .eq("video_id", videoId)
    .single();
}

export async function loadRelated(videoId: string) {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };
  return supabase
    .from("gallery_videos")
    .select("*")
    .neq("id", videoId)
    .order("created_at", { ascending: false })
    .limit(8);
}

export async function updateMediaTitle(mediaId: string, title: string) {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };
  return supabase.from("gallery_videos").update({ title }).eq("id", mediaId);
}

export async function deleteMedia(mediaId: string) {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };
  return supabase.from("gallery_videos").delete().eq("id", mediaId);
}

export async function getCurrentUser() {
  return { data: { user: null } };
}
