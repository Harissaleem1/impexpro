"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAdminDragReorder } from "@/components/useAdminDragReorder";
import type { Review } from "@/lib/review-shared";

function sortReviews(reviews: Review[]) {
  return [...reviews].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function AdminReviewsTable({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [items, setItems] = useState(() => sortReviews(reviews));
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState("");
  const [error, setError] = useState("");
  const reorder = useAdminDragReorder({ items, setItems, endpoint: "/api/admin/reviews/reorder", errorMessage: "Unable to save review order.", setError });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((review) => !q || [review.name, review.designation, review.company, review.reviewText].join(" ").toLowerCase().includes(q));
  }, [items, query]);

  async function remove(review: Review) {
    if (!window.confirm(`Delete the review from ${review.name}?`)) return;
    setDeleting(review.id);
    setError("");
    const response = await fetch(`/api/admin/reviews/${review.id}`, { method: "DELETE" });
    setDeleting("");
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Unable to delete review.");
      return;
    }
    setItems((current) => current.filter((item) => item.id !== review.id));
    router.refresh();
  }

  return (
    <div className="admin-panel">
      <div className="admin-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reviews..." />
        <Link className="btn btn-gold" href="/admin/reviews/new">Add Review</Link>
      </div>
      {error ? <div className="form-msg error" role="alert">{error}</div> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Order</th><th>Reviewer</th><th>Company</th><th>Rating</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((review) => {
              return (
                <tr key={review.id} {...reorder.rowProps(review.id)}>
                  <td><button type="button" className="admin-drag-handle" disabled={reorder.savingOrder} {...reorder.handleProps(review.id)}>☰</button></td>
                  <td><strong>{review.name}</strong><span>{review.designation}</span></td>
                  <td>{review.company}</td>
                  <td>{review.rating}/5</td>
                  <td><div className="admin-actions">
                    <Link href={`/admin/reviews/edit/${review.id}`}>Edit</Link>
                    <button className="danger-action" type="button" onClick={() => remove(review)} disabled={deleting === review.id}>
                      {deleting === review.id ? "Deleting..." : "Delete Review"}
                    </button>
                  </div></td>
                </tr>
              );
            })}
            {!filtered.length ? <tr><td colSpan={5}>No reviews found.</td></tr> : null}
          </tbody>
        </table>
      </div>
      {reorder.savingOrder ? <div className="admin-order-status">Saving order...</div> : null}
    </div>
  );
}
