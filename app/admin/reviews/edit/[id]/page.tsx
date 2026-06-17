import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminChrome } from "@/components/AdminChrome";
import { ReviewEditor } from "@/components/ReviewEditor";
import { getReviewById } from "@/lib/reviews";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Review | Impex-Pro CMS", robots: { index: false, follow: false } };

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const review = await getReviewById((await params).id);
  if (!review) notFound();
  return (
    <AdminChrome>
      <div className="admin-page-head">
        <div><span>Review Editor</span><h1>Edit Review</h1></div>
        <Link href="/admin/reviews" className="btn btn-outline-gold">Back to Reviews</Link>
      </div>
      <ReviewEditor review={review} />
    </AdminChrome>
  );
}
