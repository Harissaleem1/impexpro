import { NextResponse } from "next/server";
import { reorderTeamMembers } from "@/lib/team";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? body.ids.map(String) : [];
    const result = await reorderTeamMembers(ids);
    return result.ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: result.error }, { status: 400 });
  } catch (error) {
    console.error("[api-admin-team-reorder]", error);
    return NextResponse.json({ error: "Unable to save team order." }, { status: 500 });
  }
}
