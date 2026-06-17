import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityEditor } from "@/components/ActivityEditor";
import { AdminChrome } from "@/components/AdminChrome";
import { getActivityById } from "@/lib/activities";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Activity | Impex-Pro CMS",
  robots: { index: false, follow: false }
};

type EditActivityPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditActivityPage({ params }: EditActivityPageProps) {
  const { id } = await params;
  const activity = await getActivityById(id);
  if (!activity) notFound();

  return (
    <AdminChrome>
      <div className="admin-page-head">
        <div>
          <span>Editor</span>
          <h1>Edit Activity</h1>
        </div>
        <Link href="/admin/activities" className="btn btn-outline-gold">Back to Activities</Link>
      </div>
      <ActivityEditor activity={activity} />
    </AdminChrome>
  );
}
