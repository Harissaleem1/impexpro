import { NextResponse } from "next/server";
import { deleteTeamMember, getTeamMemberById, updateTeamMember } from "@/lib/team";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const member = await getTeamMemberById((await params).id);
  return member
    ? NextResponse.json({ member })
    : NextResponse.json({ error: "Team member not found." }, { status: 404 });
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const result = await updateTeamMember((await params).id, await request.json().catch(() => ({})));
    if (!result.ok) {
      if ("errors" in result) return NextResponse.json({ errors: result.errors }, { status: 400 });
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }
    return NextResponse.json({ member: result.member });
  } catch (error) {
    console.error("[api-admin-team-put]", error);
    return NextResponse.json({ error: "Unable to update team member." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const deleted = await deleteTeamMember((await params).id);
    return deleted
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Team member not found." }, { status: 404 });
  } catch (error) {
    console.error("[api-admin-team-delete]", error);
    return NextResponse.json({ error: "Unable to delete team member." }, { status: 500 });
  }
}
