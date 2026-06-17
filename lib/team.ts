import { randomUUID } from "node:crypto";
import { getMongoDb, getTeamMembersCollection } from "@/lib/mongodb";
import type { TeamMember, TeamMemberFormInput } from "@/lib/team-shared";
import { serializeMongoDocument, serializeMongoDocuments, withoutMongoId } from "@/lib/mongo-serialize";

export type { TeamMember, TeamMemberFormInput } from "@/lib/team-shared";

const initialTeamMembers: TeamMember[] = [
  {
    id: "team-muhammad-faheem-akhtar",
    name: "Muhammad Faheem Akhtar",
    designation: "Founder & Chief Executive Officer",
    shortBio: "Import-Export Strategy, Business Development, Customs Compliance, Trade Consultancy",
    fullBio: "With over 15 years of hands-on experience in international trade, Muhammad Faheem Akhtar founded Impex-Pro to be Pakistan's premier one-window trade consultancy. His vision - bridging the gap between ambition and execution - has empowered 400+ individuals and launched 10+ businesses in global trade.",
    sortOrder: 0,
    active: true,
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt: "2020-01-01T00:00:00.000Z"
  },
  {
    id: "team-muhammad-haris-saleem",
    name: "Muhammad Haris Saleem",
    designation: "Chief Operating Officer",
    shortBio: "Operations, Logistics, Trade Management",
    profileImage: "/images/Haris_Saleem.webp",
    sortOrder: 1,
    active: true,
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt: "2020-01-01T00:00:00.000Z"
  },
  {
    id: "team-sahrish-sana-khalid",
    name: "Sahrish Sana Khalid",
    designation: "Director (USA)",
    shortBio: "US Markets, Business Development, Global Trade",
    profileImage: "/images/sehrish_sana_khalid.webp",
    sortOrder: 2,
    active: true,
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt: "2020-01-01T00:00:00.000Z"
  },
  {
    id: "team-bilal-hafeez",
    name: "Bilal Hafeez",
    designation: "Head - Minerals & Salt",
    shortBio: "Minerals, Salt Division, Commodity Trade",
    profileImage: "/images/Bilal_hafeez.webp",
    sortOrder: 3,
    active: true,
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt: "2020-01-01T00:00:00.000Z"
  },
  {
    id: "team-muhammad-qasim",
    name: "Muhammad Qasim",
    designation: "Managing Director",
    shortBio: "Strategy, Business Growth, Management",
    profileImage: "/images/malik_qasim.webp",
    sortOrder: 4,
    active: true,
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt: "2020-01-01T00:00:00.000Z"
  },
  {
    id: "team-sajid-mehmood",
    name: "Sajid Mehmood",
    designation: "Managing Director",
    shortBio: "Trade Finance, Operations, Compliance",
    profileImage: "/images/Sajid_mehmoo.webp",
    sortOrder: 5,
    active: true,
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt: "2020-01-01T00:00:00.000Z"
  },
  {
    id: "team-ch-amjad-mehmood",
    name: "Ch. Amjad Mehmood",
    designation: "Managing Director",
    shortBio: "Customs, Freight, Clearance",
    sortOrder: 6,
    active: true,
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt: "2020-01-01T00:00:00.000Z"
  }
];

function cleanText(value: unknown, max = 5000) {
  return String(value || "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, max);
}

function validUrlOrPath(value?: string) {
  return !value || /^https?:\/\//.test(value) || value.startsWith("/");
}

function sortTeamMembers(members: TeamMember[]) {
  return [...members].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.name.localeCompare(b.name);
  });
}

let initialTeamMembersPromise: Promise<void> | undefined;

async function seedInitialTeamMembers() {
  const collection = await getTeamMembersCollection();
  const db = await getMongoDb();
  const migrations = db.collection<{ key: string; completedAt: string }>("cmsMigrations");
  const migrationKey = "seed-team-members-v1";
  if (await migrations.findOne({ key: migrationKey })) return;

  if (!(await collection.countDocuments({}))) {
    try {
      await collection.insertMany(initialTeamMembers, { ordered: false });
    } catch (error) {
      const mongoError = error as { code?: number };
      if (mongoError.code !== 11000) throw error;
    }
  }

  await migrations.updateOne(
    { key: migrationKey },
    { $set: { key: migrationKey, completedAt: new Date().toISOString() } },
    { upsert: true }
  );
}

async function ensureInitialTeamMembers() {
  initialTeamMembersPromise ??= seedInitialTeamMembers().catch((error) => {
    initialTeamMembersPromise = undefined;
    throw error;
  });
  return initialTeamMembersPromise;
}

export function validateTeamMemberInput(input: Partial<TeamMemberFormInput>) {
  const errors: Record<string, string> = {};
  const name = cleanText(input.name, 160);
  const designation = cleanText(input.designation, 180);
  const expertise = Array.isArray(input.expertise)
    ? input.expertise.map((item) => cleanText(item, 80)).filter(Boolean).slice(0, 30)
    : cleanText(input.shortBio, 600).split(",").map((item) => item.trim()).filter(Boolean);
  const shortBio = expertise.join(", ");
  const fullBio = cleanText(input.fullBio, 6000) || undefined;
  const profileImage = cleanText(input.profileImage, 1000) || undefined;
  const email = cleanText(input.email, 240) || undefined;
  const phone = cleanText(input.phone, 80) || undefined;
  const linkedinUrl = cleanText(input.linkedinUrl, 1000) || undefined;
  const facebookUrl = cleanText(input.facebookUrl, 1000) || undefined;
  const instagramUrl = cleanText(input.instagramUrl, 1000) || undefined;
  const xUrl = cleanText(input.xUrl, 1000) || undefined;
  const active = true;

  if (!name) errors.name = "Name is required.";
  if (!designation) errors.designation = "Designation is required.";
  if (!expertise.length) errors.expertise = "Add at least one expertise item.";
  if (profileImage && !validUrlOrPath(profileImage)) errors.profileImage = "Profile image is invalid.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
  if (phone && !/^\+?[0-9()\-\s]{7,20}$/.test(phone)) errors.phone = "Enter a valid phone number.";
  if (linkedinUrl && !/^https?:\/\//.test(linkedinUrl)) errors.linkedinUrl = "LinkedIn URL must start with http:// or https://.";
  if (facebookUrl && !/^https?:\/\//.test(facebookUrl)) errors.facebookUrl = "Facebook URL must start with http:// or https://.";
  if (instagramUrl && !/^https?:\/\//.test(instagramUrl)) errors.instagramUrl = "Instagram URL must start with http:// or https://.";
  if (xUrl && !/^https?:\/\//.test(xUrl)) errors.xUrl = "X URL must start with http:// or https://.";

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    data: { name, designation, shortBio, expertise, fullBio, profileImage, email, phone, linkedinUrl, facebookUrl, instagramUrl, xUrl, active }
  };
}

export async function getAllTeamMembers() {
  await ensureInitialTeamMembers();
  const collection = await getTeamMembersCollection();
  return sortTeamMembers(serializeMongoDocuments(await collection.find({}).toArray()));
}

export async function getActiveTeamMembers() {
  await ensureInitialTeamMembers();
  const collection = await getTeamMembersCollection();
  return sortTeamMembers(serializeMongoDocuments(await collection.find({}).toArray())).map((member) => ({ ...member, active: true }));
}

export async function getTeamMemberById(id: string) {
  await ensureInitialTeamMembers();
  const collection = await getTeamMembersCollection();
  const member = await collection.findOne({ id });
  return member ? serializeMongoDocument(member) : null;
}

export async function createTeamMember(input: Partial<TeamMemberFormInput>) {
  const result = validateTeamMemberInput(input);
  if (!result.ok) return { ok: false as const, errors: result.errors };

  await ensureInitialTeamMembers();
  const collection = await getTeamMembersCollection();
  const now = new Date().toISOString();
  const first = await collection.find({}).sort({ sortOrder: 1 }).limit(1).next();
  const member: TeamMember = {
    id: randomUUID(),
    ...result.data,
    sortOrder: Number.isFinite(first?.sortOrder) ? Number(first?.sortOrder) - 1 : 0,
    createdAt: now,
    updatedAt: now
  };

  await collection.insertOne(member);
  return { ok: true as const, member };
}

export async function updateTeamMember(id: string, input: Partial<TeamMemberFormInput>) {
  const result = validateTeamMemberInput(input);
  if (!result.ok) return { ok: false as const, errors: result.errors };

  const collection = await getTeamMembersCollection();
  const existing = await collection.findOne({ id });
  if (!existing) return { ok: false as const, status: 404, error: "Team member not found." };

  const member: TeamMember = {
    ...withoutMongoId(existing),
    ...result.data,
    sortOrder: existing.sortOrder,
    updatedAt: new Date().toISOString()
  };

  await collection.updateOne({ id }, { $set: member });
  return { ok: true as const, member };
}

export async function deleteTeamMember(id: string) {
  const collection = await getTeamMembersCollection();
  const result = await collection.deleteOne({ id });
  return result.deletedCount > 0;
}

export async function reorderTeamMembers(ids: string[]) {
  const cleanIds = ids.map((id) => cleanText(id, 120)).filter(Boolean);
  if (!cleanIds.length) return { ok: false as const, error: "No team members were provided." };

  const collection = await getTeamMembersCollection();
  const now = new Date().toISOString();
  await collection.bulkWrite(
    cleanIds.map((id, index) => ({
      updateOne: {
        filter: { id },
        update: { $set: { sortOrder: index, updatedAt: now } }
      }
    }))
  );

  return { ok: true as const };
}
