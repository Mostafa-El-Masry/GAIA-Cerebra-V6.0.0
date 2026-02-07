import { NextResponse } from "next/server";
import { getPathsInfoWithCompletion } from "@/lib/academy";

/** GET: return all paths with lesson counts and completion (from DB only — lesson gate). */
export async function GET() {
  try {
    const paths = await getPathsInfoWithCompletion();
    return NextResponse.json({ paths });
  } catch (e) {
    console.error("Academy paths error:", e);
    return NextResponse.json(
      { error: "Failed to load academy paths." },
      { status: 500 },
    );
  }
}
