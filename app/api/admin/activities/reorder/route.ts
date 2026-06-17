import { NextResponse } from "next/server";
import { reorderActivities } from "@/lib/activities";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? body.ids.map(String) : [];
    const result = await reorderActivities(ids);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api-admin-activities-reorder]", error);
    return NextResponse.json({ error: "Unable to save activity order." }, { status: 500 });
  }
}
