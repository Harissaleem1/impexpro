import { NextResponse } from "next/server";
import { deleteActivity, getActivityById, updateActivity } from "@/lib/activities";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const activity = await getActivityById(id);
  if (!activity) {
    return NextResponse.json({ error: "Activity not found." }, { status: 404 });
  }

  return NextResponse.json({ activity });
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const body = await request.json().catch(() => ({}));
    const result = await updateActivity(id, body);

    if (!result.ok) {
      if ("errors" in result) {
        return NextResponse.json({ errors: result.errors }, { status: 400 });
      }
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    return NextResponse.json({ activity: result.activity });
  } catch (error) {
    console.error("[api-admin-activity-put]", error);
    return NextResponse.json({ error: "Unable to update activity." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const deleted = await deleteActivity(id);
    if (!deleted) {
      return NextResponse.json({ error: "Activity not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api-admin-activity-delete]", error);
    return NextResponse.json({ error: "Unable to delete activity." }, { status: 500 });
  }
}
