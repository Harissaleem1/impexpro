import { randomUUID } from "node:crypto";
import { getBlogsCollection } from "@/lib/mongodb";
import {
  parseTags,
  slugify,
  type Blog,
  type BlogFormInput,
  type PublicBlog
} from "@/lib/blog-shared";
import { serializeMongoDocument, serializeMongoDocuments, withoutMongoId } from "@/lib/mongo-serialize";

export { excerptFromContent, formatDate, parseTags, readingTime, slugify } from "@/lib/blog-shared";
export type { Blog, BlogFormInput, BlogStatus, PublicBlog } from "@/lib/blog-shared";

export const BLOG_PAGE_SIZE = 6;

function cleanText(value: unknown, max = 5000) {
  return String(value || "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, max);
}

function parseOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function blogDateValue(blog: Blog) {
  return new Date(blog.publishedAt || blog.createdAt || blog.updatedAt).getTime() || 0;
}

function sortBlogsForDisplay(blogs: Blog[]) {
  return [...blogs].sort((a, b) => {
    const aOrder = Number.isFinite(a.sortOrder) ? Number(a.sortOrder) : Number.MAX_SAFE_INTEGER;
    const bOrder = Number.isFinite(b.sortOrder) ? Number(b.sortOrder) : Number.MAX_SAFE_INTEGER;

    if (aOrder !== bOrder) return aOrder - bOrder;
    return blogDateValue(b) - blogDateValue(a);
  });
}

export function validateBlogInput(input: Partial<BlogFormInput>) {
  const errors: Record<string, string> = {};
  const title = cleanText(input.title, 180);
  const slug = slugify(cleanText(input.slug, 200) || title);
  const excerpt = cleanText(input.excerpt, 500);
  const content = cleanText(input.content, 100000);
  const category = cleanText(input.category, 80) || "General";
  const author = cleanText(input.author, 120) || "Impex-Pro Team";
  const status = "published" as const;
  const sortOrder = parseOptionalNumber(input.sortOrder);
  const coverImage = cleanText(input.coverImage, 1000) || undefined;
  const metaTitle = cleanText(input.metaTitle, 180) || undefined;
  const metaDescription = cleanText(input.metaDescription, 300) || undefined;
  const canonicalUrl = cleanText(input.canonicalUrl, 1000) || undefined;
  const tags = parseTags(input.tags).slice(0, 20).map((tag) => tag.slice(0, 50));

  if (!title) errors.title = "Title is required.";
  if (!slug) errors.slug = "Slug is required.";
  if (!excerpt) errors.excerpt = "Excerpt is required.";
  if (!content) errors.content = "Content is required.";
  if (!metaTitle) errors.metaTitle = "Meta title is required.";
  if (!metaDescription) errors.metaDescription = "Meta description is required.";
  if (coverImage && !/^https?:\/\//.test(coverImage) && !coverImage.startsWith("/")) {
    errors.coverImage = "Cover image must be a public URL or a /public path.";
  }
  if (canonicalUrl && !/^https?:\/\//.test(canonicalUrl)) {
    errors.canonicalUrl = "Canonical URL must start with http:// or https://.";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      category,
      tags,
      author,
      status,
      sortOrder,
      metaTitle,
      metaDescription,
      canonicalUrl
    }
  };
}

export async function getAllBlogs() {
  const collection = await getBlogsCollection();
  const blogs = serializeMongoDocuments(await collection.find({}).toArray());
  return sortBlogsForDisplay(blogs);
}

export async function getPublishedBlogs(): Promise<PublicBlog[]> {
  const collection = await getBlogsCollection();
  const blogs = serializeMongoDocuments(await collection.find({ status: { $ne: "archived" } }).toArray());
  return sortBlogsForDisplay(blogs);
}

export async function getBlogById(id: string) {
  const collection = await getBlogsCollection();
  const blog = await collection.findOne({ id });
  return blog ? serializeMongoDocument(blog) : null;
}

export async function getPublishedBlogBySlug(slug: string): Promise<PublicBlog | null> {
  const collection = await getBlogsCollection();
  const blog = await collection.findOne({ slug, status: { $ne: "archived" } });
  return blog ? serializeMongoDocument(blog) : null;
}

export async function getRelatedBlogs(blog: PublicBlog, take = 3): Promise<PublicBlog[]> {
  const blogs = await getPublishedBlogs();
  return blogs
    .filter((item) => item.id !== blog.id)
    .filter((item) => item.category === blog.category || item.tags.some((tag) => blog.tags.includes(tag)))
    .slice(0, take);
}

export async function createBlog(input: Partial<BlogFormInput>) {
  const result = validateBlogInput(input);
  if (!result.ok) return { ok: false as const, errors: result.errors };

  const collection = await getBlogsCollection();
  const existing = await collection.findOne({ slug: result.data.slug });
  if (existing) {
    return { ok: false as const, errors: { slug: "This slug is already in use." } };
  }

  const now = new Date().toISOString();
  const first = await collection.find({}).sort({ sortOrder: 1 }).limit(1).next();
  const sortOrder = result.data.sortOrder ?? (Number.isFinite(first?.sortOrder) ? Number(first?.sortOrder) - 1 : 0);
  const blog: Blog = {
    id: randomUUID(),
    ...result.data,
    status: "published",
    sortOrder,
    publishedAt: now,
    createdAt: now,
    updatedAt: now
  };

  await collection.insertOne(blog);
  return { ok: true as const, blog };
}

export async function updateBlog(id: string, input: Partial<BlogFormInput>) {
  const result = validateBlogInput(input);
  if (!result.ok) return { ok: false as const, errors: result.errors };

  const collection = await getBlogsCollection();
  const existing = await collection.findOne({ id });
  if (!existing) return { ok: false as const, status: 404, error: "Blog not found." };

  const duplicate = await collection.findOne({ id: { $ne: id }, slug: result.data.slug });
  if (duplicate) {
    return { ok: false as const, errors: { slug: "This slug is already in use." } };
  }

  const now = new Date().toISOString();
  const blog: Blog = {
    ...withoutMongoId(existing),
    ...result.data,
    status: "published",
    sortOrder: result.data.sortOrder ?? existing.sortOrder,
    publishedAt: existing.publishedAt || now,
    updatedAt: now
  };

  await collection.updateOne({ id }, { $set: blog });
  return { ok: true as const, blog };
}

export async function deleteBlog(id: string) {
  const collection = await getBlogsCollection();
  const result = await collection.deleteOne({ id });
  return result.deletedCount > 0;
}

export async function reorderBlogs(ids: string[]) {
  const cleanIds = ids.map((id) => cleanText(id, 120)).filter(Boolean);
  if (!cleanIds.length) return { ok: false as const, error: "No blogs were provided." };

  const collection = await getBlogsCollection();
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
