import Image from "next/image";
import Link from "next/link";
import type { PublicBlog } from "@/lib/blog-shared";
import { formatDate, readingTime } from "@/lib/blog-shared";
import { coverImageOrFallback } from "@/lib/images";

type BlogCardProps = {
  blog: PublicBlog;
};

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <article className="blog-card">
      <Link href={`/blogs/${blog.slug}`} className="blog-card-img" aria-label={blog.title}>
        <Image
          src={coverImageOrFallback(blog.coverImage)}
          alt={blog.title}
          fill
          sizes="(max-width: 900px) 100vw, 33vw"
        />
      </Link>
      <div className="blog-card-body">
        <div className="blog-meta">
          <span>{blog.category}</span>
          <span>{formatDate(blog.publishedAt)}</span>
          <span>{readingTime(blog.content)} min read</span>
        </div>
        <h2>
          <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
        </h2>
        <p>{blog.excerpt}</p>
        <div className="blog-tags">
          {blog.tags.slice(0, 3).map((tag) => (
            <Link key={tag} href={`/blogs?tag=${encodeURIComponent(tag)}`}>
              {tag}
            </Link>
          ))}
        </div>
        <Link href={`/blogs/${blog.slug}`} className="blog-read-link">
          Read Article <span>→</span>
        </Link>
      </div>
    </article>
  );
}
