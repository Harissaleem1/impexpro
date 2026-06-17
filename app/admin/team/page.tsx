import type { Metadata } from "next";
import { AdminChrome } from "@/components/AdminChrome";
import { AdminTeamTable } from "@/components/AdminTeamTable";
import { getAllTeamMembers } from "@/lib/team";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage Team | Impex-Pro CMS",
  robots: { index: false, follow: false }
};

export default async function AdminTeamPage() {
  const members = await getAllTeamMembers();

  return (
    <AdminChrome>
      <div className="admin-page-head">
        <div><span>People</span><h1>Manage Team</h1></div>
      </div>
      <AdminTeamTable members={members} />
    </AdminChrome>
  );
}
