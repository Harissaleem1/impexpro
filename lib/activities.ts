import { randomUUID } from "node:crypto";
import { getActivitiesCollection, getMongoDb } from "@/lib/mongodb";
import {
  activityTypes,
  normalizeGalleryImages,
  type Activity,
  type ActivityFormInput,
  type ActivityStatus,
  type ActivityType
} from "@/lib/activity-shared";
import { slugify } from "@/lib/blog-shared";
import { serializeMongoDocument, serializeMongoDocuments, withoutMongoId } from "@/lib/mongo-serialize";

export { activityTypes };
export type { Activity, ActivityFormInput, ActivityStatus, ActivityType };

const defaultActivities: Activity[] = [
  {
    id: "activity-regional-transport-ministers-conference-2025",
    title: "Regional Transport Ministers' Conference 2025",
    slug: "regional-transport-ministers-conference-2025",
    activityType: "Conference",
    shortDescription: "Impex-Pro leadership participated in high-level discussions on regional trade connectivity, logistics infrastructure, and international transportation collaboration.",
    fullDescription: "Impex-Pro leadership participated in high-level discussions on regional trade connectivity, logistics infrastructure, and international transportation collaboration.",
    date: "2025-03-01",
    location: "Islamabad, Pakistan",
    status: "published",
    galleryImages: [],
    sortOrder: 0,
    createdAt: "2025-03-01T00:00:00.000Z",
    updatedAt: "2025-03-01T00:00:00.000Z"
  },
  {
    id: "activity-business-networking-industry-collaboration",
    title: "Business Networking & Industry Collaboration",
    slug: "business-networking-industry-collaboration",
    activityType: "Networking Event",
    shortDescription: "Strategic meetings with business leaders and institutional representatives to strengthen partnerships and promote sustainable trade opportunities.",
    fullDescription: "Strategic meetings with business leaders and institutional representatives to strengthen partnerships and promote sustainable trade opportunities.",
    date: "2025-02-01",
    location: "Lahore Chamber of Commerce",
    status: "published",
    galleryImages: [],
    sortOrder: 1,
    createdAt: "2025-02-01T00:00:00.000Z",
    updatedAt: "2025-02-01T00:00:00.000Z"
  },
  {
    id: "activity-official-business-delegation-visit",
    title: "Official Business Delegation Visit",
    slug: "official-business-delegation-visit",
    activityType: "Delegation",
    shortDescription: "Corporate engagement aimed at exploring investment opportunities, trade facilitation, and international business collaboration with regional partners.",
    fullDescription: "Corporate engagement aimed at exploring investment opportunities, trade facilitation, and international business collaboration with regional partners.",
    date: "2024-12-01",
    location: "Ministry of Commerce, Islamabad",
    status: "published",
    galleryImages: [],
    sortOrder: 2,
    createdAt: "2024-12-01T00:00:00.000Z",
    updatedAt: "2024-12-01T00:00:00.000Z"
  },
  {
    id: "activity-export-development-training-session",
    title: "Export Development Training Session",
    slug: "export-development-training-session",
    activityType: "Training",
    shortDescription: "Capacity-building workshop focused on empowering entrepreneurs and startups with practical knowledge of export procedures and international trade operations.",
    fullDescription: "Capacity-building workshop focused on empowering entrepreneurs and startups with practical knowledge of export procedures and international trade operations.",
    date: "2025-01-01",
    location: "PIM, Islamabad",
    status: "published",
    galleryImages: [],
    sortOrder: 3,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z"
  },
  {
    id: "activity-professional-training-skill-development",
    title: "Professional Training & Skill Development",
    slug: "professional-training-skill-development",
    activityType: "Workshop",
    shortDescription: "Interactive sessions conducted to bridge the gap between academia and industry through practical business and logistics training.",
    fullDescription: "Interactive sessions conducted to bridge the gap between academia and industry through practical business and logistics training.",
    date: "2024-11-01",
    location: "NUST University, Islamabad",
    status: "published",
    galleryImages: [],
    sortOrder: 4,
    createdAt: "2024-11-01T00:00:00.000Z",
    updatedAt: "2024-11-01T00:00:00.000Z"
  },
  {
    id: "activity-entrepreneurship-development-workshop",
    title: "Entrepreneurship Development Workshop",
    slug: "entrepreneurship-development-workshop",
    activityType: "Entrepreneurship",
    shortDescription: "Training initiatives designed to support emerging entrepreneurs in startup development, business formalization, and export readiness.",
    fullDescription: "Training initiatives designed to support emerging entrepreneurs in startup development, business formalization, and export readiness.",
    date: "2024-10-01",
    location: "SMEDA, Islamabad",
    status: "published",
    galleryImages: [],
    sortOrder: 5,
    createdAt: "2024-10-01T00:00:00.000Z",
    updatedAt: "2024-10-01T00:00:00.000Z"
  }
];

let defaultActivitiesMigrationPromise: Promise<void> | undefined;

async function seedDefaultActivities() {
  const collection = await getActivitiesCollection();
  const migrations = (await getMongoDb()).collection<{
    key: string;
    completedAt: string;
    seededSlugs?: string[];
  }>("cmsMigrations");
  const migrationKey = "seed-default-activities-v1";
  const defaultSlugs = defaultActivities.map((activity) => activity.slug);

  if (!(await migrations.findOne({ key: migrationKey }))) {
    const customActivities = await collection
      .find({ slug: { $nin: defaultSlugs } })
      .sort({ sortOrder: 1, date: -1, createdAt: -1 })
      .toArray();

    if (customActivities.length) {
      await collection.bulkWrite(customActivities.map((activity, index) => ({
        updateOne: {
          filter: { id: activity.id },
          update: { $set: { sortOrder: defaultActivities.length + index } }
        }
      })));
    }

    await Promise.all(defaultActivities.map((activity) => {
      const insertDefaults: Partial<Activity> = { ...activity };
      delete insertDefaults.status;
      delete insertDefaults.sortOrder;
      return collection.updateOne(
        { slug: activity.slug },
        {
          $setOnInsert: insertDefaults,
          $set: { status: "published", sortOrder: activity.sortOrder }
        },
        { upsert: true }
      );
    }));

    await migrations.updateOne(
      { key: migrationKey },
      {
        $set: {
          key: migrationKey,
          completedAt: new Date().toISOString(),
          seededSlugs: defaultSlugs
        }
      },
      { upsert: true }
    );
  }

  const fallbackRepairKey = "repair-default-activity-fallbacks-v1";
  if (!(await migrations.findOne({ key: fallbackRepairKey }))) {
    const incorrectSeedImages = new Map([
      ["regional-transport-ministers-conference-2025", "/images/AdobeStock_139828873_Preview.jpeg"],
      ["business-networking-industry-collaboration", "/images/aboutVisual.png"],
      ["official-business-delegation-visit", "/images/A large container ship.jpg"],
      ["export-development-training-session", "/images/Business_Registration.webp"],
      ["professional-training-skill-development", "/images/Business_Consultancy.webp"],
      ["entrepreneurship-development-workshop", "/images/Branding_and_Support_Services.webp"]
    ]);

    await Promise.all([...incorrectSeedImages].map(([slug, coverImage]) =>
      collection.updateOne({ slug, coverImage }, { $unset: { coverImage: "" } })
    ));
    await migrations.updateOne(
      { key: fallbackRepairKey },
      { $set: { key: fallbackRepairKey, completedAt: new Date().toISOString() } },
      { upsert: true }
    );
  }

  const featuredCleanupKey = "remove-activity-featured-v1";
  if (!(await migrations.findOne({ key: featuredCleanupKey }))) {
    await collection.updateMany({}, { $unset: { featured: "" } });
    await migrations.updateOne(
      { key: featuredCleanupKey },
      { $set: { key: featuredCleanupKey, completedAt: new Date().toISOString() } },
      { upsert: true }
    );
  }
}

async function ensureDefaultActivities() {
  defaultActivitiesMigrationPromise ??= seedDefaultActivities().catch((error) => {
    defaultActivitiesMigrationPromise = undefined;
    throw error;
  });
  return defaultActivitiesMigrationPromise;
}

function cleanText(value: unknown, max = 5000) {
  return String(value || "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, max);
}

function parseNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeActivity(activity: Activity): Activity {
  const plain = serializeMongoDocument(activity);
  return {
    ...plain,
    id: String(plain.id),
    galleryImages: normalizeGalleryImages(plain.galleryImages),
    createdAt: String(plain.createdAt),
    updatedAt: String(plain.updatedAt)
  };
}

function validUrlOrPath(value?: string) {
  return !value || /^https?:\/\//.test(value) || value.startsWith("/");
}

function activityTypeFromValue(value: unknown): ActivityType {
  const cleaned = cleanText(value, 80);
  return activityTypes.includes(cleaned as ActivityType) ? (cleaned as ActivityType) : "Other";
}

function activityDateValue(activity: Activity) {
  return new Date(activity.date || activity.createdAt || activity.updatedAt).getTime() || 0;
}

function sortActivitiesForDisplay(activities: Activity[]) {
  return [...activities].sort((a, b) => {
    const aOrder = Number.isFinite(a.sortOrder) ? Number(a.sortOrder) : Number.MAX_SAFE_INTEGER;
    const bOrder = Number.isFinite(b.sortOrder) ? Number(b.sortOrder) : Number.MAX_SAFE_INTEGER;

    if (aOrder !== bOrder) return aOrder - bOrder;
    return activityDateValue(b) - activityDateValue(a);
  });
}

export function validateActivityInput(input: Partial<ActivityFormInput>) {
  const errors: Record<string, string> = {};
  const title = cleanText(input.title, 180);
  const slug = slugify(cleanText(input.slug, 220) || title);
  const activityType = activityTypeFromValue(input.activityType);
  const shortDescription = cleanText(input.shortDescription, 600);
  const fullDescription = cleanText(input.fullDescription, 10000) || undefined;
  const date = cleanText(input.date, 80) || undefined;
  const location = cleanText(input.location, 180) || undefined;
  const coverImage = cleanText(input.coverImage, 1000) || undefined;
  const videoUrl = cleanText(input.videoUrl, 1000) || undefined;
  const galleryImages = normalizeGalleryImages(input.galleryImages);
  const status: ActivityStatus = "published";
  const sortOrder = parseNumber(input.sortOrder);

  if (!title) errors.title = "Title is required.";
  if (!slug) errors.slug = "Slug is required.";
  if (!shortDescription) errors.shortDescription = "Short description is required.";
  if (coverImage && !validUrlOrPath(coverImage)) {
    errors.coverImage = "Cover image must be a public URL or a /public path.";
  }
  if (videoUrl && !validUrlOrPath(videoUrl)) {
    errors.videoUrl = "Video URL must be a public URL or a /public path.";
  }

  galleryImages.forEach((url, index) => {
    if (!validUrlOrPath(url)) errors.galleryImages = `Gallery image ${index + 1} must be a public URL or /public path.`;
  });

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    data: {
      title,
      slug,
      activityType,
      shortDescription,
      fullDescription,
      date,
      location,
      status,
      coverImage,
      galleryImages,
      videoUrl,
      sortOrder
    }
  };
}

export async function getAllActivities() {
  await ensureDefaultActivities();
  const collection = await getActivitiesCollection();
  const activities = serializeMongoDocuments(await collection.find({}).toArray()).map(normalizeActivity);
  return sortActivitiesForDisplay(activities);
}

export async function getPublishedActivities() {
  await ensureDefaultActivities();
  const collection = await getActivitiesCollection();
  const activities = serializeMongoDocuments(await collection.find({}).toArray()).map(normalizeActivity);
  return sortActivitiesForDisplay(activities);
}

export async function getActivityById(id: string) {
  await ensureDefaultActivities();
  const collection = await getActivitiesCollection();
  const activity = await collection.findOne({ id });
  return activity ? normalizeActivity(serializeMongoDocument(activity)) : null;
}

export async function createActivity(input: Partial<ActivityFormInput>) {
  const result = validateActivityInput(input);
  if (!result.ok) return { ok: false as const, errors: result.errors };

  await ensureDefaultActivities();
  const collection = await getActivitiesCollection();
  const existing = await collection.findOne({ slug: result.data.slug });
  if (existing) {
    return { ok: false as const, errors: { slug: "This slug is already in use." } };
  }

  const now = new Date().toISOString();
  const first = await collection.find({}).sort({ sortOrder: 1 }).limit(1).next();
  const sortOrder = result.data.sortOrder ?? (Number.isFinite(first?.sortOrder) ? Number(first?.sortOrder) - 1 : 0);
  const activity: Activity = {
    id: randomUUID(),
    ...result.data,
    status: "published",
    sortOrder,
    createdAt: now,
    updatedAt: now
  };

  await collection.insertOne(activity);
  return { ok: true as const, activity };
}

export async function updateActivity(id: string, input: Partial<ActivityFormInput>) {
  const result = validateActivityInput(input);
  if (!result.ok) return { ok: false as const, errors: result.errors };

  await ensureDefaultActivities();
  const collection = await getActivitiesCollection();
  const existing = await collection.findOne({ id });
  if (!existing) return { ok: false as const, status: 404, error: "Activity not found." };

  const duplicate = await collection.findOne({ id: { $ne: id }, slug: result.data.slug });
  if (duplicate) {
    return { ok: false as const, errors: { slug: "This slug is already in use." } };
  }

  const activity: Activity = {
    ...withoutMongoId(existing),
    ...result.data,
    status: "published",
    sortOrder: result.data.sortOrder ?? existing.sortOrder ?? 0,
    updatedAt: new Date().toISOString()
  };

  await collection.updateOne({ id }, { $set: activity });
  return { ok: true as const, activity };
}

export async function deleteActivity(id: string) {
  await ensureDefaultActivities();
  const collection = await getActivitiesCollection();
  const result = await collection.deleteOne({ id });
  return result.deletedCount > 0;
}

export async function reorderActivities(ids: string[]) {
  const cleanIds = ids.map((id) => cleanText(id, 120)).filter(Boolean);
  if (!cleanIds.length) return { ok: false as const, error: "No activities were provided." };

  await ensureDefaultActivities();
  const collection = await getActivitiesCollection();
  const now = new Date().toISOString();
  await collection.bulkWrite(
    cleanIds.map((id, index) => ({
      updateOne: {
        filter: { id },
        update: { $set: { sortOrder: index, status: "published", updatedAt: now } }
      }
    }))
  );

  return { ok: true as const };
}
