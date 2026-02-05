import { NextResponse } from "next/server";
import { getPathsInfo } from "@/lib/academy";

/** GET: return all paths with file-driven lesson counts and completion. No hardcoded data. */
export async function GET() {
  try {
    const paths = getPathsInfo();
    return NextResponse.json({ paths });
  } catch (e) {
    console.error("Academy paths error:", e);
    return NextResponse.json(
      { error: "Failed to load academy paths." },
      { status: 500 },
    );
  }
}
