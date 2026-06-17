import { randomUUID } from "node:crypto";
import { getMongoDb, getReviewsCollection } from "@/lib/mongodb";
import type { Review, ReviewFormInput } from "@/lib/review-shared";
import { serializeMongoDocument, serializeMongoDocuments, withoutMongoId } from "@/lib/mongo-serialize";

export type { Review, ReviewFormInput } from "@/lib/review-shared";

const migratedAt = "2020-01-01T00:00:00.000Z";
const initialReviews: Review[] = [
  {
    id: "review-ahmed-karim",
    name: "Ahmed Karim",
    designation: "CEO & Founder",
    company: "AK Agro Exports",
    location: "Lahore",
    reviewText: "Impex-Pro transformed our export journey from scratch. Faheem sahib and his team handled our WEBOC registration, customs documentation, and first shipment with remarkable professionalism.",
    rating: 5, sortOrder: 0, active: true, createdAt: migratedAt, updatedAt: migratedAt
  },
  {
    id: "review-sana-rehman",
    name: "Sana Rehman",
    designation: "Entrepreneur & Trainee Alumni",
    company: "SRG Trading Company",
    location: "Islamabad",
    reviewText: "The training program at Impex-Pro was a game-changer for me. As a fresh graduate, I launched my own trading business within 4 months. The certification and mentorship are world-class.",
    rating: 5, sortOrder: 1, active: true, createdAt: migratedAt, updatedAt: migratedAt
  },
  {
    id: "review-muhammad-farooq",
    name: "Muhammad Farooq",
    designation: "Director Operations",
    company: "PakMineral Resources Ltd.",
    reviewText: "Our customs clearance was stuck for weeks before we approached Impex-Pro. Their team resolved everything within 48 hours - documentation, duties, compliance. They are true experts.",
    rating: 5, sortOrder: 2, active: true, createdAt: migratedAt, updatedAt: migratedAt
  },
  {
    id: "review-zainab-nawaz",
    name: "Zainab Nawaz",
    designation: "Managing Director",
    company: "ZN Global Trade",
    location: "Faisalabad",
    reviewText: "From company registration to obtaining our import license and setting up our FBR profile - Impex-Pro handled everything seamlessly. Their one-window approach saved us months of hassle.",
    rating: 5, sortOrder: 3, active: true, createdAt: migratedAt, updatedAt: migratedAt
  },
  {
    id: "review-tariq-hussain",
    name: "Tariq Hussain",
    designation: "Business Development Manager",
    company: "Punjab Textile Mills",
    reviewText: "I attended Impex-Pro's workshop on export documentation and it was incredibly practical. Mr. Faheem's real-world experience shines through every session. My team learned more in 2 days than months of self-study.",
    rating: 5, sortOrder: 4, active: true, createdAt: migratedAt, updatedAt: migratedAt
  },
  {
    id: "review-omar-baig",
    name: "Omar Baig",
    designation: "Export Manager",
    company: "Chemex Industries",
    location: "Karachi",
    reviewText: "Impex-Pro's freight forwarding service is exceptional. They arranged LCL shipments for our chemical exports at very competitive rates with zero delays. Their global coordination is outstanding.",
    rating: 5, sortOrder: 5, active: true, createdAt: migratedAt, updatedAt: migratedAt
  }
];

function cleanText(value: unknown, max = 5000) {
  return String(value || "").replace(/\u0000/g, "").trim().slice(0, max);
}

function parseBoolean(value: unknown, fallback = true) {
  if (value === undefined || value === null || value === "") return fallback;
  return value === true || value === "true" || value === "on";
}

function sortReviews(reviews: Review[]) {
  return [...reviews].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

let initialReviewsPromise: Promise<void> | undefined;

async function seedInitialReviews() {
  const collection = await getReviewsCollection();
  const migrations = (await getMongoDb()).collection<{ key: string; completedAt: string }>("cmsMigrations");
  const key = "seed-reviews-v1";
  if (await migrations.findOne({ key })) return;

  if (!(await collection.countDocuments({}))) {
    try {
      await collection.insertMany(initialReviews, { ordered: false });
    } catch (error) {
      if ((error as { code?: number }).code !== 11000) throw error;
    }
  }

  await migrations.updateOne(
    { key },
    { $set: { key, completedAt: new Date().toISOString() } },
    { upsert: true }
  );
}

async function ensureInitialReviews() {
  initialReviewsPromise ??= seedInitialReviews().catch((error) => {
    initialReviewsPromise = undefined;
    throw error;
  });
  return initialReviewsPromise;
}

export function validateReviewInput(input: Partial<ReviewFormInput>) {
  const errors: Record<string, string> = {};
  const name = cleanText(input.name, 160);
  const designation = cleanText(input.designation, 180);
  const company = cleanText(input.company, 180);
  const reviewText = cleanText(input.reviewText, 3000);
  const avatarImage = cleanText(input.avatarImage, 1000) || undefined;
  const location = cleanText(input.location, 180) || undefined;
  const rating = Math.round(Number(input.rating));
  const active = parseBoolean(input.active);

  if (!name) errors.name = "Name is required.";
  if (!designation) errors.designation = "Designation is required.";
  if (!company) errors.company = "Company is required.";
  if (!reviewText) errors.reviewText = "Review text is required.";
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.rating = "Rating must be between 1 and 5.";
  if (avatarImage && !/^https:\/\//.test(avatarImage) && !avatarImage.startsWith("/")) {
    errors.avatarImage = "Avatar image is invalid.";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    data: { name, designation, company, reviewText, rating, avatarImage, location, active }
  };
}

export async function getAllReviews() {
  await ensureInitialReviews();
  return sortReviews(serializeMongoDocuments(await (await getReviewsCollection()).find({}).toArray()));
}

export async function getActiveReviews() {
  await ensureInitialReviews();
  return sortReviews(serializeMongoDocuments(await (await getReviewsCollection()).find({ active: true }).toArray()));
}

export async function getReviewById(id: string) {
  await ensureInitialReviews();
  const review = await (await getReviewsCollection()).findOne({ id });
  return review ? serializeMongoDocument(review) : null;
}

export async function createReview(input: Partial<ReviewFormInput>) {
  const result = validateReviewInput(input);
  if (!result.ok) return { ok: false as const, errors: result.errors };

  await ensureInitialReviews();
  const collection = await getReviewsCollection();
  const now = new Date().toISOString();
  const first = await collection.find({}).sort({ sortOrder: 1 }).limit(1).next();
  const review: Review = {
    id: randomUUID(),
    ...result.data,
    sortOrder: Number.isFinite(first?.sortOrder) ? Number(first?.sortOrder) - 1 : 0,
    createdAt: now,
    updatedAt: now
  };
  await collection.insertOne(review);
  return { ok: true as const, review };
}

export async function updateReview(id: string, input: Partial<ReviewFormInput>) {
  const result = validateReviewInput(input);
  if (!result.ok) return { ok: false as const, errors: result.errors };

  const collection = await getReviewsCollection();
  const existing = await collection.findOne({ id });
  if (!existing) return { ok: false as const, status: 404, error: "Review not found." };

  const review: Review = {
    ...withoutMongoId(existing),
    ...result.data,
    sortOrder: existing.sortOrder,
    updatedAt: new Date().toISOString()
  };
  await collection.updateOne({ id }, { $set: review });
  return { ok: true as const, review };
}

export async function deleteReview(id: string) {
  return (await (await getReviewsCollection()).deleteOne({ id })).deletedCount > 0;
}

export async function reorderReviews(ids: string[]) {
  const cleanIds = ids.map((id) => cleanText(id, 120)).filter(Boolean);
  if (!cleanIds.length) return { ok: false as const, error: "No reviews were provided." };

  const collection = await getReviewsCollection();
  const now = new Date().toISOString();
  await collection.bulkWrite(cleanIds.map((id, index) => ({
    updateOne: { filter: { id }, update: { $set: { sortOrder: index, updatedAt: now } } }
  })));
  return { ok: true as const };
}
