import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminChrome } from "@/components/AdminChrome";
import { TeamMemberEditor } from "@/components/TeamMemberEditor";
import { getTeamMemberById } from "@/lib/team";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Team Member | Impex-Pro CMS",
  robots: { index: false, follow: false }
};

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getTeamMemberById(id);
  if (!member) notFound();

  return (
    <AdminChrome>
      <div className="admin-page-head">
        <div><span>Team Editor</span><h1>Edit Team Member</h1></div>
        <Link href="/admin/team" className="btn btn-outline-gold">Back to Team</Link>
      </div>
      <TeamMemberEditor member={member} />
    </AdminChrome>
  );
}
