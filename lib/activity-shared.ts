export const activityTypes = [
  "Conference",
  "Workshop",
  "Training",
  "Seminar",
  "Exhibition",
  "Trade Mission",
  "Networking Event",
  "Delegation",
  "Entrepreneurship",
  "Video",
  "Other"
] as const;

export type ActivityType = (typeof activityTypes)[number];
export type ActivityStatus = "draft" | "published";

export type Activity = {
  id: string;
  title: string;
  slug: string;
  activityType: ActivityType;
  shortDescription: string;
  fullDescription?: string;
  date?: string;
  location?: string;
  status: ActivityStatus;
  coverImage?: string;
  galleryImages: string[];
  videoUrl?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ActivityFormInput = Omit<Activity, "id" | "createdAt" | "updatedAt" | "galleryImages"> & {
  galleryImages?: string[] | Record<string, unknown>[] | string | null;
};

function galleryImageUrl(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";
  const image = value as Record<string, unknown>;
  return String(image.secure_url || image.secureUrl || image.url || image.imageUrl || image.src || "").trim();
}

export function normalizeGalleryImages(value: unknown) {
  const values = Array.isArray(value)
    ? value.map(galleryImageUrl)
    : typeof value === "string"
      ? value.split(/\r?\n|,/).map((item) => item.trim())
      : [];

  return [...new Set(values)]
    .filter(Boolean)
    .filter((url) => /^https?:\/\//.test(url) || url.startsWith("/"))
    .slice(0, 10);
}
