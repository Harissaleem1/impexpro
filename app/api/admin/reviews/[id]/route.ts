import { NextResponse } from "next/server";
import { deleteReview, getReviewById, updateReview } from "@/lib/reviews";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const review = await getReviewById((await params).id);
  return review ? NextResponse.json({ review }) : NextResponse.json({ error: "Review not found." }, { status: 404 });
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const result = await updateReview((await params).id, await request.json().catch(() => ({})));
    if (!result.ok) {
      if ("errors" in result) return NextResponse.json({ errors: result.errors }, { status: 400 });
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }
    return NextResponse.json({ review: result.review });
  } catch (error) {
    console.error("[api-admin-review-put]", error);
    return NextResponse.json({ error: "Unable to update review." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    return await deleteReview((await params).id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Review not found." }, { status: 404 });
  } catch (error) {
    console.error("[api-admin-review-delete]", error);
    return NextResponse.json({ error: "Unable to delete review." }, { status: 500 });
  }
}
