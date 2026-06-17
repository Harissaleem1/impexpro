"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAdminDragReorder } from "@/components/useAdminDragReorder";
import type { TeamMember } from "@/lib/team-shared";

function sortMembers(members: TeamMember[]) {
  return [...members].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function AdminTeamTable({ members }: { members: TeamMember[] }) {
  const router = useRouter();
  const [items, setItems] = useState(() => sortMembers(members));
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState("");
  const [error, setError] = useState("");
  const reorder = useAdminDragReorder({ items, setItems, endpoint: "/api/admin/team/reorder", errorMessage: "Unable to save team order.", setError });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((member) => !q || [member.name, member.designation, member.shortBio].join(" ").toLowerCase().includes(q));
  }, [items, query]);

  async function remove(member: TeamMember) {
    if (!window.confirm(`Delete ${member.name} permanently?`)) return;
    setDeleting(member.id);
    setError("");
    const response = await fetch(`/api/admin/team/${member.id}`, { method: "DELETE" });
    setDeleting("");

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Unable to delete team member.");
      return;
    }

    setItems((current) => current.filter((item) => item.id !== member.id));
    router.refresh();
  }

  return (
    <div className="admin-panel">
      <div className="admin-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search team members..." />
        <Link className="btn btn-gold" href="/admin/team/new">Add Team Member</Link>
      </div>
      {error ? <div className="form-msg error" role="alert">{error}</div> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Order</th><th>Member</th><th>Designation</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((member) => {
              return (
                <tr key={member.id} {...reorder.rowProps(member.id)}>
                  <td>
                    <button type="button" className="admin-drag-handle" disabled={reorder.savingOrder} {...reorder.handleProps(member.id)}>☰</button>
                  </td>
                  <td><strong>{member.name}</strong><span>{member.email || member.phone || ""}</span></td>
                  <td>{member.designation}</td>
                  <td>
                    <div className="admin-actions">
                      <Link href={`/admin/team/edit/${member.id}`}>Edit</Link>
                      <button className="danger-action" type="button" onClick={() => remove(member)} disabled={deleting === member.id}>
                        {deleting === member.id ? "Deleting..." : "Delete Team Member"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!filtered.length ? <tr><td colSpan={4}>No team members found.</td></tr> : null}
          </tbody>
        </table>
      </div>
      {reorder.savingOrder ? <div className="admin-order-status">Saving order...</div> : null}
    </div>
  );
}
