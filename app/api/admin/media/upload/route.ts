import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { type MediaFolder, uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

const folders: Record<string, MediaFolder> = {
  blogs: "impexpro/blogs",
  activities: "impexpro/activities",
  general: "impexpro/general"
};

function folderFromValue(value: FormDataEntryValue | null): MediaFolder {
  return folders[String(value || "general")] || "impexpro/general";
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "A media file is required." }, { status: 400 });
    }

    const result = await uploadToCloudinary(file, {
      folder: folderFromValue(formData.get("folder")),
      resourceType: "image"
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[admin-media-upload]", error);
    return NextResponse.json({ error: "Unable to upload media." }, { status: 500 });
  }
}
