"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { MediaUploadField } from "@/components/MediaUploadField";
import type { Review } from "@/lib/review-shared";

export function ReviewEditor({ review }: { review?: Review }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const targetForm = event.currentTarget;
    if (targetForm.querySelector('[data-uploading="true"]')) {
      setErrors({ form: "Please wait for the avatar upload to finish." });
      return;
    }

    setLoading(true);
    setErrors({});
    const form = new FormData(targetForm);
    const payload = {
      name: form.get("name"),
      designation: form.get("designation"),
      company: form.get("company"),
      reviewText: form.get("reviewText"),
      rating: form.get("rating"),
      location: form.get("location"),
      avatarImage: form.get("avatarImage"),
      active: form.get("active") === "on"
    };

    try {
      const response = await fetch(review ? `/api/admin/reviews/${review.id}` : "/api/admin/reviews", {
        method: review ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrors(data.errors || { form: data.error || "Unable to save review." });
        return;
      }
      router.push("/admin/reviews");
      router.refresh();
    } catch {
      setErrors({ form: "Unable to connect to the server." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="admin-editor" onSubmit={submit}>
      {errors.form ? <div className="form-msg error" role="alert">{errors.form}</div> : null}
      <div className="admin-editor-grid">
        <div className="admin-panel">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" defaultValue={review?.name || ""} required />
            {errors.name ? <span className="field-error">{errors.name}</span> : null}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="designation">Designation</label>
              <input id="designation" name="designation" defaultValue={review?.designation || ""} required />
              {errors.designation ? <span className="field-error">{errors.designation}</span> : null}
            </div>
            <div className="form-group">
              <label htmlFor="company">Company</label>
              <input id="company" name="company" defaultValue={review?.company || ""} required />
              {errors.company ? <span className="field-error">{errors.company}</span> : null}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="reviewText">Review Text</label>
            <textarea id="reviewText" name="reviewText" className="content-editor" defaultValue={review?.reviewText || ""} required />
            {errors.reviewText ? <span className="field-error">{errors.reviewText}</span> : null}
          </div>
        </div>
        <aside className="admin-panel">
          <MediaUploadField
            name="avatarImage"
            label="Avatar Image"
            defaultValue={review?.avatarImage || ""}
            folder="general"
            helperText="Upload JPG, PNG, or WebP"
          />
          {errors.avatarImage ? <span className="field-error">{errors.avatarImage}</span> : null}
          <div className="form-group">
            <label htmlFor="rating">Rating</label>
            <select id="rating" name="rating" defaultValue={review?.rating || 5}>
              {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} Star{rating === 1 ? "" : "s"}</option>)}
            </select>
            {errors.rating ? <span className="field-error">{errors.rating}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input id="location" name="location" defaultValue={review?.location || ""} />
          </div>
          <div className="form-group">
            <label className="admin-check">
              <input type="checkbox" name="active" defaultChecked={review?.active ?? true} />
              Active on public website
            </label>
          </div>
          <div className="admin-editor-actions">
            <button type="submit" className="form-submit" disabled={loading}>
              {loading ? "Saving..." : review ? "Update Review" : "Add Review"}
            </button>
          </div>
        </aside>
      </div>
    </form>
  );
}
