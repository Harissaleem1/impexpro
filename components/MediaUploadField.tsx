"use client";

import { ChangeEvent, useState } from "react";

type MediaUploadFieldProps = {
  name: string;
  label: string;
  defaultValue?: string | string[];
  folder: "blogs" | "activities" | "general";
  resourceType?: "image" | "video";
  multiple?: boolean;
  helperText?: string;
};

function toValues(value?: string | string[]) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

export function MediaUploadField({
  name,
  label,
  defaultValue,
  folder,
  resourceType = "image",
  multiple = false,
  helperText
}: MediaUploadFieldProps) {
  const [values, setValues] = useState<string[]>(toValues(defaultValue));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError("");

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const body = new FormData();
        body.append("file", file);
        body.append("folder", folder);
        body.append("resourceType", resourceType);

        const response = await fetch("/api/admin/media/upload", {
          method: "POST",
          body
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || "Unable to upload media.");
        }

        uploadedUrls.push(data.url);
      }

      setValues((current) => {
        const next = multiple ? [...current, ...uploadedUrls].slice(0, 10) : uploadedUrls.slice(-1);
        return next.filter(Boolean);
      });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload media.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function remove(url: string) {
    setValues((current) => current.filter((item) => item !== url));
  }

  return (
    <div className="media-upload-field" data-uploading={uploading ? "true" : "false"}>
      <label>{label}</label>
      <input type="hidden" name={name} value={multiple ? values.join("\n") : values[0] || ""} />
      {values.length ? (
        <div className={multiple ? "media-preview-grid" : "media-preview-list"}>
          {values.map((url) => (
            <div key={url} className="media-preview-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" />
              <button type="button" onClick={() => remove(url)} aria-label="Remove image">×</button>
            </div>
          ))}
        </div>
      ) : null}
      <input
        type="file"
        accept={resourceType === "image" ? "image/jpeg,image/png,image/webp" : "video/mp4,video/quicktime,video/webm,video/x-msvideo"}
        multiple={multiple}
        onChange={upload}
        disabled={uploading || (multiple && values.length >= 10)}
      />
      <small>
        {uploading
          ? "Uploading to Cloudinary..."
          : helperText || (multiple ? "Upload up to 10 gallery images" : "Upload image")}
      </small>
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
}
