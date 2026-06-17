"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type Activity, activityTypes } from "@/lib/activity-shared";
import { slugify } from "@/lib/blog-shared";
import { MediaUploadField } from "@/components/MediaUploadField";

type ActivityEditorProps = {
  activity?: Activity;
};

type Errors = Record<string, string>;

export function ActivityEditor({ activity }: ActivityEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(activity?.title || "");
  const [slug, setSlug] = useState(activity?.slug || "");
  const [manualSlug, setManualSlug] = useState(Boolean(activity?.slug));
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const previewSlug = useMemo(() => slug || slugify(title), [slug, title]);

  function updateTitle(value: string) {
    setTitle(value);
    if (!manualSlug) setSlug(slugify(value));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const targetForm = event.currentTarget;
    if (targetForm.querySelector('[data-uploading="true"]')) {
      setErrors({ form: "Please wait for media uploads to finish before saving." });
      return;
    }
    setLoading(true);
    setErrors({});
    setMessage("");

    const form = new FormData(targetForm);

    const payload = {
      title,
      slug: previewSlug,
      activityType: form.get("activityType"),
      shortDescription: form.get("shortDescription"),
      fullDescription: form.get("fullDescription"),
      date: form.get("date"),
      location: form.get("location"),
      status: "published",
      coverImage: form.get("coverImage"),
      galleryImages: form.get("galleryImages"),
      videoUrl: form.get("videoUrl")
    };

    const response = await fetch(activity ? `/api/admin/activities/${activity.id}` : "/api/admin/activities", {
      method: activity ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setErrors(data.errors || { form: data.error || "Unable to save activity." });
      return;
    }

    setMessage("Activity saved successfully.");
    router.push("/admin/activities");
    router.refresh();
  }

  return (
    <form className="admin-editor" onSubmit={submit}>
      {message ? <div className="form-msg success">{message}</div> : null}
      {errors.form ? <div className="form-msg error">{errors.form}</div> : null}
      <div className="admin-editor-grid">
        <div className="admin-panel">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input id="title" value={title} onChange={(event) => updateTitle(event.target.value)} required />
            {errors.title ? <span className="field-error">{errors.title}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="slug">Slug</label>
            <input
              id="slug"
              value={previewSlug}
              onChange={(event) => {
                setManualSlug(true);
                setSlug(slugify(event.target.value));
              }}
            />
            {errors.slug ? <span className="field-error">{errors.slug}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="shortDescription">Short Description</label>
            <textarea id="shortDescription" name="shortDescription" defaultValue={activity?.shortDescription || ""} />
            {errors.shortDescription ? <span className="field-error">{errors.shortDescription}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="fullDescription">Full Description</label>
            <textarea
              id="fullDescription"
              name="fullDescription"
              className="content-editor"
              defaultValue={activity?.fullDescription || ""}
            />
          </div>
        </div>
        <aside className="admin-panel">
          <div className="form-group">
            <label htmlFor="activityType">Activity Type</label>
            <select id="activityType" name="activityType" defaultValue={activity?.activityType || "Other"}>
              {activityTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input id="date" name="date" type="date" defaultValue={activity?.date || ""} />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input id="location" name="location" defaultValue={activity?.location || ""} />
          </div>
          <div className="form-group">
            <MediaUploadField
              name="coverImage"
              label="Cover Image"
              defaultValue={activity?.coverImage || ""}
              folder="activities"
            />
            {errors.coverImage ? <span className="field-error">{errors.coverImage}</span> : null}
          </div>
          <div className="form-group">
            <MediaUploadField
              name="galleryImages"
              label="Gallery Images"
              defaultValue={activity?.galleryImages || []}
              folder="activities"
              multiple
              helperText="Upload up to 10 gallery images"
            />
            {errors.galleryImages ? <span className="field-error">{errors.galleryImages}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="videoUrl">Video URL</label>
            <input id="videoUrl" name="videoUrl" defaultValue={activity?.videoUrl || ""} placeholder="YouTube, Vimeo, or external video URL" />
            {errors.videoUrl ? <span className="field-error">{errors.videoUrl}</span> : null}
          </div>
          <div className="admin-editor-actions">
            <button type="submit" className="form-submit" disabled={loading}>
              {loading ? "Saving..." : activity ? "Update Activity" : "Save Activity"}
            </button>
          </div>
        </aside>
      </div>
    </form>
  );
}
