import { NextResponse } from "next/server";
import { createReview, getAllReviews } from "@/lib/reviews";

export async function GET() {
  try {
    return NextResponse.json({ reviews: await getAllReviews() });
  } catch (error) {
    console.error("[api-admin-reviews-get]", error);
    return NextResponse.json({ error: "Unable to load reviews." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await createReview(await request.json().catch(() => ({})));
    return result.ok
      ? NextResponse.json({ review: result.review }, { status: 201 })
      : NextResponse.json({ errors: result.errors }, { status: 400 });
  } catch (error) {
    console.error("[api-admin-reviews-post]", error);
    return NextResponse.json({ error: "Unable to save review." }, { status: 500 });
  }
}
