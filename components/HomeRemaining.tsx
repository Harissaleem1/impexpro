import { HtmlContent } from "@/components/HtmlContent";
import { ReviewsSection } from "@/components/ReviewsSection";
import { homeHtml } from "@/lib/pageContent";
import { getActiveReviews } from "@/lib/reviews";

const whyMarker = "<!-- ═══ WHY CHOOSE ═══ -->";
const testimonialsMarker = "<!-- ═══ TESTIMONIALS ═══ -->";
const ctaMarker = "<!-- ═══ CTA ═══ -->";

export async function HomeRemaining() {
  const [, rest] = homeHtml.split(whyMarker);
  const [beforeTestimonials, testimonialAndAfter] = rest.split(testimonialsMarker);
  const [, afterTestimonials] = testimonialAndAfter.split(ctaMarker);
  const reviews = await getActiveReviews();

  return (
    <>
      <HtmlContent html={`${whyMarker}${beforeTestimonials}`} />
      <ReviewsSection reviews={reviews} />
      <HtmlContent html={`${ctaMarker}${afterTestimonials}`} />
    </>
  );
}
