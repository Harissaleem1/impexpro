import { NextResponse } from "next/server";
import { getSiteSettings, updateSiteSettings } from "@/lib/site-settings";

export async function GET() {
  try {
    return NextResponse.json({ settings: await getSiteSettings() });
  } catch (error) {
    console.error("[api-admin-settings-get]", error);
    return NextResponse.json({ error: "Unable to load site settings." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const result = await updateSiteSettings(await request.json().catch(() => ({})));
    return result.ok
      ? NextResponse.json({ settings: result.settings })
      : NextResponse.json({ errors: result.errors }, { status: 400 });
  } catch (error) {
    console.error("[api-admin-settings-put]", error);
    return NextResponse.json({ error: "Unable to save site settings." }, { status: 500 });
  }
}
