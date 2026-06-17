import type { Metadata } from "next";
import Link from "next/link";
import { ActivityEditor } from "@/components/ActivityEditor";
import { AdminChrome } from "@/components/AdminChrome";

export const metadata: Metadata = {
  title: "Create Activity | Impex-Pro CMS",
  robots: { index: false, follow: false }
};

export default function NewActivityPage() {
  return (
    <AdminChrome>
      <div className="admin-page-head">
        <div>
          <span>Editor</span>
          <h1>Create Activity</h1>
        </div>
        <Link href="/admin/activities" className="btn btn-outline-gold">Back to Activities</Link>
      </div>
      <ActivityEditor />
    </AdminChrome>
  );
}
