import { MongoClient, type Collection } from "mongodb";
import type { Activity } from "@/lib/activities";
import type { Blog } from "@/lib/blog-shared";
import type { ContactSubmission } from "@/lib/submissions";
import type { TeamMember } from "@/lib/team-shared";
import type { Review } from "@/lib/review-shared";
import type { SiteSettings } from "@/lib/site-settings";

type GlobalMongo = typeof globalThis & {
  _impexMongoClient?: MongoClient;
  _impexMongoClientPromise?: Promise<MongoClient>;
  _impexMongoIndexesReady?: Promise<void>;
};

const globalMongo = globalThis as GlobalMongo;

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required. Set ${name} in Vercel Environment Variables.`);
  }
  return value;
}

export async function getMongoClient() {
  const uri = requiredEnv("MONGODB_URI");

  if (!globalMongo._impexMongoClientPromise) {
    globalMongo._impexMongoClient = new MongoClient(uri);
    globalMongo._impexMongoClientPromise = globalMongo._impexMongoClient.connect();
  }
  return globalMongo._impexMongoClientPromise;
}

export async function getMongoDb() {
  const client = await getMongoClient();
  return client.db(requiredEnv("MONGODB_DB"));
}

export async function getBlogsCollection(): Promise<Collection<Blog>> {
  const db = await getMongoDb();
  return db.collection<Blog>("blogs");
}

export async function getSubmissionsCollection(): Promise<Collection<ContactSubmission>> {
  const db = await getMongoDb();
  return db.collection<ContactSubmission>("submissions");
}

export async function getActivitiesCollection(): Promise<Collection<Activity>> {
  const db = await getMongoDb();
  return db.collection<Activity>("activities");
}

export async function getTeamMembersCollection(): Promise<Collection<TeamMember>> {
  const db = await getMongoDb();
  return db.collection<TeamMember>("teamMembers");
}

export async function getReviewsCollection(): Promise<Collection<Review>> {
  const db = await getMongoDb();
  return db.collection<Review>("reviews");
}

export async function getSiteSettingsCollection(): Promise<Collection<SiteSettings>> {
  const db = await getMongoDb();
  return db.collection<SiteSettings>("siteSettings");
}

export async function ensureMongoIndexes() {
  if (globalMongo._impexMongoIndexesReady) return globalMongo._impexMongoIndexesReady;

  globalMongo._impexMongoIndexesReady = (async () => {
    const blogs = await getBlogsCollection();
    const submissions = await getSubmissionsCollection();
    const activities = await getActivitiesCollection();
    const teamMembers = await getTeamMembersCollection();
    const reviews = await getReviewsCollection();
    const siteSettings = await getSiteSettingsCollection();
    const migrations = (await getMongoDb()).collection("cmsMigrations");

    await Promise.all([
      blogs.createIndex({ slug: 1 }, { unique: true }),
      blogs.createIndex({ status: 1 }),
      blogs.createIndex({ sortOrder: 1 }),
      blogs.createIndex({ publishedAt: -1 }),
      submissions.createIndex({ status: 1 }),
      submissions.createIndex({ createdAt: -1 }),
      activities.createIndex({ slug: 1 }, { unique: true }),
      activities.createIndex({ status: 1 }),
      activities.createIndex({ sortOrder: 1 }),
      teamMembers.createIndex({ id: 1 }, { unique: true }),
      teamMembers.createIndex({ active: 1, sortOrder: 1 }),
      reviews.createIndex({ id: 1 }, { unique: true }),
      reviews.createIndex({ active: 1, sortOrder: 1 }),
      siteSettings.createIndex({ key: 1 }, { unique: true }),
      migrations.createIndex({ key: 1 }, { unique: true })
    ]);
  })();

  return globalMongo._impexMongoIndexesReady;
}
