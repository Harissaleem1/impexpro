"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { normalizeGalleryImages, type Activity } from "@/lib/activity-shared";
import { formatDate } from "@/lib/blog-shared";
import type { SiteSettings } from "@/lib/site-settings";

const fallbackIcons: Record<string, string> = {
  Conference: "🏛️",
  Workshop: "🎓",
  Training: "📚",
  Seminar: "🎤",
  Exhibition: "🏢",
  "Trade Mission": "🌍",
  "Networking Event": "🤝",
  Delegation: "✈️",
  Entrepreneurship: "💡",
  Video: "▶️",
  Other: "📌"
};

function mediaLabel(activity: Activity) {
  return [formatDate(activity.date), activity.location].filter(Boolean).join(" · ");
}

function imageForActivity(activity: Activity) {
  return activity.coverImage || normalizeGalleryImages(activity.galleryImages)[0];
}

function galleryForActivity(activity: Activity) {
  return [...new Set([activity.coverImage, ...normalizeGalleryImages(activity.galleryImages)].filter(Boolean) as string[])];
}

function ActivityDescription({ text }: { text: string }) {
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
      <div ref={contentRef} className={`activity-description${expanded ? " expanded" : ""}`}>
        <p>{text}</p>
      </div>
      {(truncated || expanded) ? (
        <button
          type="button"
          className="activity-see-more"
          aria-expanded={expanded}
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((current) => !current);
          }}
        >
          {expanded ? "See less" : "See more"}
        </button>
      ) : null}
    </>
  );
}

export function ActivitiesContent({ activities, settings }: { activities: Activity[]; settings: SiteSettings }) {
  const [gallery, setGallery] = useState<{ title: string; images: string[]; index: number } | null>(null);
  const videoActivities = activities.filter((activity) => activity.videoUrl || activity.activityType === "Video");
  const galleryActivities = activities.filter((activity) => activity.activityType !== "Video" || activity.coverImage || normalizeGalleryImages(activity.galleryImages).length);

  useEffect(() => {
    if (!gallery) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setGallery(null);
      if (event.key === "ArrowLeft") {
        setGallery((current) => current ? { ...current, index: (current.index - 1 + current.images.length) % current.images.length } : null);
      }
      if (event.key === "ArrowRight") {
        setGallery((current) => current ? { ...current, index: (current.index + 1) % current.images.length } : null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [gallery]);

  function openGallery(activity: Activity) {
    const images = galleryForActivity(activity);
    if (images.length) setGallery({ title: activity.title, images, index: 0 });
  }

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-bg-pattern" />
        <div className="page-hero-glow" />
        <div className="page-hero-content">
          <nav className="breadcrumb"><Link href="/">Home</Link><span className="breadcrumb-sep">›</span><span>Activities</span></nav>
          <div className="section-tag">Our Presence</div>
          <h1>Corporate Activities &amp; <em>Official Engagements</em></h1>
          <p className="page-hero-desc">Showcasing our professional meetings, training sessions, conferences, workshops, and strategic collaborations that drive business growth and international trade development.</p>
        </div>
      </div>

      <section className="section fade-in" style={{ background: "#fff" }}>
        <div className="section-tag">Gallery</div>
        <h2 className="section-title">Events &amp; <em>Engagements</em></h2>
        <p style={{ fontSize: 16, color: "var(--text-mid)", marginTop: 16, maxWidth: 640, lineHeight: 1.75 }}>
          A visual record of our active presence across conferences, workshops, government meetings, and industry collaborations.
        </p>

        {galleryActivities.length ? (
          <div className="masonry">
            {galleryActivities.map((activity) => {
              const image = imageForActivity(activity);
              const galleryImages = galleryForActivity(activity);
              return (
                <article
                  key={activity.id}
                  className={`masonry-item${galleryImages.length ? " activity-gallery-card" : ""}`}
                  role={galleryImages.length ? "button" : undefined}
                  tabIndex={galleryImages.length ? 0 : undefined}
                  onClick={() => galleryImages.length && openGallery(activity)}
                  onKeyDown={(event) => {
                    if (galleryImages.length && (event.key === "Enter" || event.key === " ")) openGallery(activity);
                  }}
                >
                  <div className={`masonry-thumb${image ? " has-image" : " activity-icon-thumb"}`}>
                    {image ? <Image src={image} alt={activity.title} fill sizes="(max-width: 900px) 100vw, 33vw" /> : (
                      <span className="activity-type-icon" aria-hidden="true">{fallbackIcons[activity.activityType] || fallbackIcons.Other}</span>
                    )}
                    {galleryImages.length ? (
                      <span className="activity-gallery-badge">{galleryImages.length} Photo{galleryImages.length === 1 ? "" : "s"}</span>
                    ) : null}
                  </div>
                  <div className="masonry-body">
                    <div className="masonry-meta">
                      <span className="masonry-tag">{activity.activityType}</span>
                      <span className="masonry-date">{formatDate(activity.date)}</span>
                    </div>
                    <h3>{activity.title}</h3>
                    <ActivityDescription text={activity.shortDescription} />
                    {activity.location ? <div className="masonry-loc">📍 {activity.location}</div> : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="admin-message-box activity-empty">Activities will appear here soon.</div>
        )}
      </section>

      {videoActivities.length ? (
        <section className="section fade-in" style={{ background: "var(--off-white)" }}>
          <div className="section-tag">Video Highlights</div>
          <h2 className="section-title">Event Highlights &amp; <em>Session Moments</em></h2>
          <p style={{ fontSize: 15, color: "var(--text-mid)", lineHeight: 1.75, marginTop: 16, maxWidth: 640 }}>
            Explore key moments from our conferences, workshops, official meetings, and training programs that reflect our commitment to professional growth and international business development.
          </p>
          <div className="vid-grid">
            {videoActivities.map((activity) => {
              const image = imageForActivity(activity);
              const card = (
                <article className="vid-card motion-item">
                  <div className="vid-thumb">
                    {image ? <Image src={image} alt={activity.title} fill sizes="(max-width: 900px) 100vw, 33vw" /> : (
                      <span className="activity-type-icon" aria-hidden="true">{fallbackIcons.Video}</span>
                    )}
                    <div className="vid-play">▶</div>
                  </div>
                  <div className="vid-info">
                    <div className="vid-tag">{activity.activityType}</div>
                    <h4>{activity.title}</h4>
                    <span>{mediaLabel(activity)}</span>
                  </div>
                </article>
              );

              return activity.videoUrl ? (
                <a key={activity.id} href={activity.videoUrl} target="_blank" rel="noreferrer">
                  {card}
                </a>
              ) : (
                <div key={activity.id}>{card}</div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="section cta-section fade-in">
        <div className="cta-inner">
          <h2>Partner With Us in <em>Your Next</em> Event</h2>
          <p>Invite Impex-Pro to speak, train, or collaborate at your next business event, university workshop, or trade conference.</p>
          <div className="cta-btns"><Link href="/contact" className="btn btn-gold">Get in Touch</Link><a href={settings.phoneHref} className="btn btn-outline-white">Call Us Now</a></div>
        </div>
      </section>

      {gallery ? (
        <div className="activity-lightbox" role="dialog" aria-modal="true" aria-label={`${gallery.title} gallery`} onClick={() => setGallery(null)}>
          <button className="activity-lightbox-close" type="button" onClick={() => setGallery(null)} aria-label="Close gallery">×</button>
          <div className="activity-lightbox-content" onClick={(event) => event.stopPropagation()}>
            <div className="activity-lightbox-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gallery.images[gallery.index]} alt={`${gallery.title} photo ${gallery.index + 1}`} />
            </div>
            <div className="activity-lightbox-meta">
              <strong>{gallery.title}</strong>
              <span>{gallery.index + 1} / {gallery.images.length}</span>
            </div>
            {gallery.images.length > 1 ? (
              <>
                <button
                  type="button"
                  className="activity-lightbox-nav previous"
                  aria-label="Previous photo"
                  onClick={() => setGallery((current) => current ? { ...current, index: (current.index - 1 + current.images.length) % current.images.length } : null)}
                >←</button>
                <button
                  type="button"
                  className="activity-lightbox-nav next"
                  aria-label="Next photo"
                  onClick={() => setGallery((current) => current ? { ...current, index: (current.index + 1) % current.images.length } : null)}
                >→</button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
