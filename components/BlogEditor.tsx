"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Blog } from "@/lib/blog-shared";
import { parseTags, slugify } from "@/lib/blog-shared";
import { MediaUploadField } from "@/components/MediaUploadField";

type BlogEditorProps = {
  blog?: Blog;
};

type Errors = Record<string, string>;

export function BlogEditor({ blog }: BlogEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(blog?.title || "");
  const [slug, setSlug] = useState(blog?.slug || "");
  const [manualSlug, setManualSlug] = useState(Boolean(blog?.slug));
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const previewSlug = useMemo(() => slug || slugify(title), [slug, title]);

  function updateTitle(value: string) {
    setTitle(value);
    if (!manualSlug) setSlug(slugify(value));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const targetForm = event.currentTarget;
    if (targetForm.querySelector('[data-uploading="true"]')) {
      setErrors({ form: "Please wait for media uploads to finish before saving." });
      return;
    }
    setLoading(true);
    setErrors({});
    setMessage("");

    const form = new FormData(targetForm);
    const payload = {
      title,
      slug: previewSlug,
      excerpt: form.get("excerpt"),
      content: form.get("content"),
      coverImage: form.get("coverImage"),
      category: form.get("category"),
      tags: parseTags(String(form.get("tags") || "")),
      author: form.get("author"),
      status: "published",
      metaTitle: form.get("metaTitle"),
      metaDescription: form.get("metaDescription"),
      canonicalUrl: form.get("canonicalUrl")
    };

    const response = await fetch(blog ? `/api/admin/blogs/${blog.id}` : "/api/admin/blogs", {
      method: blog ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setErrors(data.errors || { form: data.error || "Unable to save blog." });
      return;
    }

    setMessage("Blog saved successfully.");
    router.push("/admin/blogs");
    router.refresh();
  }

  return (
    <form className="admin-editor" onSubmit={submit}>
      {message ? <div className="form-msg success">{message}</div> : null}
      {errors.form ? <div className="form-msg error">{errors.form}</div> : null}
      <div className="admin-editor-grid">
        <div className="admin-panel">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input id="title" value={title} onChange={(e) => updateTitle(e.target.value)} required />
            {errors.title ? <span className="field-error">{errors.title}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="slug">Slug</label>
            <input
              id="slug"
              value={previewSlug}
              onChange={(e) => {
                setManualSlug(true);
                setSlug(slugify(e.target.value));
              }}
            />
            {errors.slug ? <span className="field-error">{errors.slug}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="excerpt">Excerpt</label>
            <textarea id="excerpt" name="excerpt" defaultValue={blog?.excerpt || ""} />
            {errors.excerpt ? <span className="field-error">{errors.excerpt}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea id="content" name="content" className="content-editor" defaultValue={blog?.content || ""} />
            {errors.content ? <span className="field-error">{errors.content}</span> : null}
          </div>
        </div>
        <aside className="admin-panel">
          <div className="form-group">
            <MediaUploadField
              name="coverImage"
              label="Cover Image"
              defaultValue={blog?.coverImage || ""}
              folder="blogs"
            />
            {errors.coverImage ? <span className="field-error">{errors.coverImage}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input id="category" name="category" defaultValue={blog?.category || "General"} />
            {errors.category ? <span className="field-error">{errors.category}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input id="tags" name="tags" defaultValue={parseTags(blog?.tags).join(", ")} placeholder="customs, export, freight" />
          </div>
          <div className="form-group">
            <label htmlFor="author">Author</label>
            <input id="author" name="author" defaultValue={blog?.author || "Impex-Pro Team"} />
            {errors.author ? <span className="field-error">{errors.author}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="metaTitle">Meta Title</label>
            <input id="metaTitle" name="metaTitle" defaultValue={blog?.metaTitle || ""} />
            {errors.metaTitle ? <span className="field-error">{errors.metaTitle}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="metaDescription">Meta Description</label>
            <textarea id="metaDescription" name="metaDescription" defaultValue={blog?.metaDescription || ""} />
            {errors.metaDescription ? <span className="field-error">{errors.metaDescription}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="canonicalUrl">Canonical URL</label>
            <input id="canonicalUrl" name="canonicalUrl" defaultValue={blog?.canonicalUrl || ""} placeholder="https://..." />
          </div>
          <div className="admin-editor-actions">
            <button type="submit" className="form-submit" disabled={loading}>
              {loading ? "Saving..." : blog ? "Update Blog" : "Save Blog"}
            </button>
          </div>
        </aside>
      </div>
    </form>
  );
}
