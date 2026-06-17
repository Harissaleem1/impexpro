"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAdminDragReorder } from "@/components/useAdminDragReorder";
import type { Activity } from "@/lib/activity-shared";
import { formatDate } from "@/lib/blog-shared";

function activityDateValue(activity: Activity) {
  return new Date(activity.date || activity.createdAt || activity.updatedAt).getTime() || 0;
}

function sortActivities(activities: Activity[]) {
  return [...activities].sort((a, b) => {
    const aOrder = Number.isFinite(a.sortOrder) ? Number(a.sortOrder) : Number.MAX_SAFE_INTEGER;
    const bOrder = Number.isFinite(b.sortOrder) ? Number(b.sortOrder) : Number.MAX_SAFE_INTEGER;

    if (aOrder !== bOrder) return aOrder - bOrder;
    return activityDateValue(b) - activityDateValue(a);
  });
}

export function AdminActivitiesTable({ activities }: { activities: Activity[] }) {
  const router = useRouter();
  const [items, setItems] = useState(() => sortActivities(activities));
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState("");
  const [orderError, setOrderError] = useState("");
  const reorder = useAdminDragReorder({
    items,
    setItems,
    endpoint: "/api/admin/activities/reorder",
    errorMessage: "Unable to save activity order.",
    setError: setOrderError
  });

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter((activity) => {
      const matchesQuery =
        !q ||
        [activity.title, activity.slug, activity.activityType, activity.shortDescription, activity.location]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesQuery;
    });
  }, [items, query]);

  async function remove(id: string) {
    if (!window.confirm("Delete this activity permanently?")) return;
    setDeleting(id);
    const response = await fetch(`/api/admin/activities/${id}`, { method: "DELETE" });
    setDeleting("");
    if (response.ok) {
      setItems((current) => current.filter((activity) => activity.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search activities..." />
        <Link className="btn btn-gold" href="/admin/activities/new">Create Activity</Link>
      </div>
      {orderError ? <div className="form-msg error">{orderError}</div> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Title</th>
              <th>Type</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((activity) => (
              <tr key={activity.id} {...reorder.rowProps(activity.id)}>
                <td>
                  <button type="button" className="admin-drag-handle" disabled={reorder.savingOrder} {...reorder.handleProps(activity.id)}>☰</button>
                </td>
                <td>
                  <strong>{activity.title}</strong>
                  <span>{activity.slug}</span>
                </td>
                <td>{activity.activityType}</td>
                <td>{formatDate(activity.date)}</td>
                <td>
                  <div className="admin-actions">
                    <Link href={`/admin/activities/edit/${activity.id}`}>Edit</Link>
                    <button className="danger-action" type="button" onClick={() => remove(activity.id)} disabled={deleting === activity.id}>
                      {deleting === activity.id ? "Deleting" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <td colSpan={5}>No activities found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {reorder.savingOrder ? <div className="admin-order-status">Saving order...</div> : null}
    </div>
  );
}
