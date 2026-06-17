import type { Metadata } from "next";
import { AdminActivitiesTable } from "@/components/AdminActivitiesTable";
import { AdminChrome } from "@/components/AdminChrome";
import { getAllActivities } from "@/lib/activities";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage Activities | Impex-Pro CMS",
  robots: { index: false, follow: false }
};

export default async function AdminActivitiesPage() {
  const activities = await getAllActivities();

  return (
    <AdminChrome>
      <div className="admin-page-head">
        <div>
          <span>Content</span>
          <h1>Manage Activities</h1>
        </div>
      </div>
      <AdminActivitiesTable activities={activities} />
    </AdminChrome>
  );
}
