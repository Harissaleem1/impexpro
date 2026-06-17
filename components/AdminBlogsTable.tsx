"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAdminDragReorder } from "@/components/useAdminDragReorder";
import type { Blog } from "@/lib/blog-shared";
import { formatDate } from "@/lib/blog-shared";

type AdminBlogsTableProps = {
  blogs: Blog[];
};

function blogDateValue(blog: Blog) {
  return new Date(blog.publishedAt || blog.createdAt || blog.updatedAt).getTime() || 0;
}

function sortBlogs(blogs: Blog[]) {
  return [...blogs].sort((a, b) => {
    const aOrder = Number.isFinite(a.sortOrder) ? Number(a.sortOrder) : Number.MAX_SAFE_INTEGER;
    const bOrder = Number.isFinite(b.sortOrder) ? Number(b.sortOrder) : Number.MAX_SAFE_INTEGER;

    if (aOrder !== bOrder) return aOrder - bOrder;
    return blogDateValue(b) - blogDateValue(a);
  });
}

export function AdminBlogsTable({ blogs }: AdminBlogsTableProps) {
  const router = useRouter();
  const [items, setItems] = useState(() => sortBlogs(blogs));
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState("");
  const [orderError, setOrderError] = useState("");
  const reorder = useAdminDragReorder({ items, setItems, endpoint: "/api/admin/blogs/reorder", errorMessage: "Unable to save blog order.", setError: setOrderError });

  const filtered = useMemo(() => {
    return items.filter((blog) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        [blog.title, blog.excerpt, blog.category, blog.author, blog.slug].join(" ").toLowerCase().includes(q);
      return matchesQuery;
    });
  }, [items, query]);

  async function remove(id: string) {
    if (!window.confirm("Delete this blog permanently?")) return;
    setDeleting(id);
    const response = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
    setDeleting("");
    if (response.ok) {
      setItems((current) => current.filter((blog) => blog.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-toolbar">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search blogs..." />
        <Link className="btn btn-gold" href="/admin/blogs/new">Create Blog</Link>
      </div>
      {orderError ? <div className="form-msg error">{orderError}</div> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Title</th>
              <th>Category</th>
              <th>Updated</th>
              <th>Published</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((blog) => (
              <tr key={blog.id} {...reorder.rowProps(blog.id)}>
                <td>
                  <button type="button" className="admin-drag-handle" disabled={reorder.savingOrder} {...reorder.handleProps(blog.id)}>☰</button>
                </td>
                <td>
                  <strong>{blog.title}</strong>
                  <span>{blog.slug}</span>
                </td>
                <td>{blog.category}</td>
                <td>{formatDate(blog.updatedAt)}</td>
                <td>{formatDate(blog.publishedAt)}</td>
                <td>
                  <div className="admin-actions">
                    <Link href={`/admin/blogs/edit/${blog.id}`}>Edit</Link>
                    <button className="danger-action" type="button" onClick={() => remove(blog.id)} disabled={deleting === blog.id}>
                      {deleting === blog.id ? "Deleting" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <td colSpan={6}>No blogs found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {reorder.savingOrder ? <div className="admin-order-status">Saving order...</div> : null}
    </div>
  );
}
