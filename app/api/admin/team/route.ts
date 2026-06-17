import { NextResponse } from "next/server";
import { createTeamMember, getAllTeamMembers } from "@/lib/team";

export async function GET() {
  try {
    return NextResponse.json({ members: await getAllTeamMembers() });
  } catch (error) {
    console.error("[api-admin-team-get]", error);
    return NextResponse.json({ error: "Unable to load team members." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await createTeamMember(await request.json().catch(() => ({})));
    if (!result.ok) return NextResponse.json({ errors: result.errors }, { status: 400 });
    return NextResponse.json({ member: result.member }, { status: 201 });
  } catch (error) {
    console.error("[api-admin-team-post]", error);
    return NextResponse.json({ error: "Unable to save team member." }, { status: 500 });
  }
}
