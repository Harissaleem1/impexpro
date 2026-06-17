import { NextResponse } from "next/server";
import { createActivity, getAllActivities } from "@/lib/activities";

export async function GET() {
  try {
    const activities = await getAllActivities();
    return NextResponse.json({ activities });
  } catch (error) {
    console.error("[api-admin-activities-get]", error);
    return NextResponse.json({ error: "Unable to load activities." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await createActivity(body);

    if (!result.ok) {
      return NextResponse.json({ errors: result.errors }, { status: 400 });
    }

    return NextResponse.json({ activity: result.activity }, { status: 201 });
  } catch (error) {
    console.error("[api-admin-activities-post]", error);
    return NextResponse.json({ error: "Unable to save activity." }, { status: 500 });
  }
}
