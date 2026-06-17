import { NextResponse } from "next/server";
import { reorderReviews } from "@/lib/reviews";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await reorderReviews(Array.isArray(body.ids) ? body.ids.map(String) : []);
    return result.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: result.error }, { status: 400 });
  } catch (error) {
    console.error("[api-admin-reviews-reorder]", error);
    return NextResponse.json({ error: "Unable to save review order." }, { status: 500 });
  }
}
