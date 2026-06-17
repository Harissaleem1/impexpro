import type { Metadata } from "next";
import Link from "next/link";
import { AdminChrome } from "@/components/AdminChrome";
import { TeamMemberEditor } from "@/components/TeamMemberEditor";

export const metadata: Metadata = {
  title: "Add Team Member | Impex-Pro CMS",
  robots: { index: false, follow: false }
};

export default function NewTeamMemberPage() {
  return (
    <AdminChrome>
      <div className="admin-page-head">
        <div><span>Team Editor</span><h1>Add Team Member</h1></div>
        <Link href="/admin/team" className="btn btn-outline-gold">Back to Team</Link>
      </div>
      <TeamMemberEditor />
    </AdminChrome>
  );
}
