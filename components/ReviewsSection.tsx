 "use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { Review } from "@/lib/review-shared";
import { reviewerInitials } from "@/lib/review-shared";

function ReviewAvatar({ review }: { review: Review }) {
  if (!review.avatarImage) return <div className="testi-avatar">{reviewerInitials(review.name)}</div>;

  return (
    <div className="testi-avatar testi-avatar-image">
      {/* Supports migrated local assets and new Cloudinary secure URLs. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={review.avatarImage} alt={review.name} />
    </div>
  );
}

function ReviewText({ text }: { text: string }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const measure = () => {
      if (!expanded) setTruncated(content.scrollHeight > content.clientHeight + 1);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [expanded, text]);

  return (
    <>
      <div ref={contentRef} className={`testi-text-wrap${expanded ? " expanded" : ""}`}>
        <p className="testi-text">&ldquo;{text}&rdquo;</p>
      </div>
      {(truncated || expanded) ? (
        <button
          type="button"
          className="testi-more"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "See less" : "See more"}
        </button>
      ) : null}
    </>
  );
}

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;

  return (
    <section className="section section-dark fade-in testimonials-section">
      <div className="dark-grid-bg" />
      <div className="testimonials-inner">
        <div className="testi-header">
          <div>
            <div className="section-tag testimonials-tag">Client Testimonials</div>
            <h2 className="section-title light">What Our <em>Clients Say</em></h2>
          </div>
          <div className="testi-nav">
            <button className="testi-btn" id="testiPrev" type="button" aria-label="Previous testimonial">←</button>
            <button className="testi-btn" id="testiNext" type="button" aria-label="Next testimonial">→</button>
          </div>
        </div>
        <div className="testi-track-wrap">
          <div className="testi-track">
            {reviews.map((review) => (
              <article className="testi-card" key={review.id}>
                <div className="testi-quote">“</div>
                <div className="testi-stars" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <span key={index} className={index < review.rating ? "filled" : "empty"} aria-hidden="true">★</span>
                  ))}
                </div>
                <ReviewText text={review.reviewText} />
                <div className="testi-author">
                  <ReviewAvatar review={review} />
                  <div>
                    <div className="testi-name">{review.name}</div>
                    <div className="testi-role">{review.designation}</div>
                    <div className="testi-company">
                      {review.company}{review.location ? `, ${review.location}` : ""}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="testi-dots" />
      </div>
    </section>
  );
}
