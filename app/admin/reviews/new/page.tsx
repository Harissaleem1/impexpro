import type { Metadata } from "next";
import Link from "next/link";
import { AdminChrome } from "@/components/AdminChrome";
import { ReviewEditor } from "@/components/ReviewEditor";

export const metadata: Metadata = { title: "Add Review | Impex-Pro CMS", robots: { index: false, follow: false } };

export default function NewReviewPage() {
  return (
    <AdminChrome>
      <div className="admin-page-head">
        <div><span>Review Editor</span><h1>Add Review</h1></div>
        <Link href="/admin/reviews" className="btn btn-outline-gold">Back to Reviews</Link>
      </div>
      <ReviewEditor />
    </AdminChrome>
  );
}
