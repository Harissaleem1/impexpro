import type { Metadata } from "next";
import { AdminChrome } from "@/components/AdminChrome";
import { AdminReviewsTable } from "@/components/AdminReviewsTable";
import { getAllReviews } from "@/lib/reviews";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Manage Reviews | Impex-Pro CMS", robots: { index: false, follow: false } };

export default async function AdminReviewsPage() {
  return (
    <AdminChrome>
      <div className="admin-page-head"><div><span>Social Proof</span><h1>Manage Reviews</h1></div></div>
      <AdminReviewsTable reviews={await getAllReviews()} />
    </AdminChrome>
  );
}
