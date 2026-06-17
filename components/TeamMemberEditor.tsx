"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { MediaUploadField } from "@/components/MediaUploadField";
import type { TeamMember } from "@/lib/team-shared";

function initialExpertise(member?: TeamMember) {
  const values = member?.expertise?.length ? member.expertise : member?.shortBio?.split(",");
  return values?.map((item) => item.trim()).filter(Boolean) || [""];
}

export function TeamMemberEditor({ member }: { member?: TeamMember }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [expertise, setExpertise] = useState(() => initialExpertise(member));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const targetForm = event.currentTarget;
    if (targetForm.querySelector('[data-uploading="true"]')) {
      setErrors({ form: "Please wait for the profile image upload to finish." });
      return;
    }

    setLoading(true);
    setErrors({});
    const form = new FormData(targetForm);
    const payload = {
      name: form.get("name"),
      designation: form.get("designation"),
      expertise: expertise.map((item) => item.trim()).filter(Boolean),
      fullBio: form.get("fullBio"),
      profileImage: form.get("profileImage"),
      email: form.get("email"),
      phone: form.get("phone"),
      linkedinUrl: form.get("linkedinUrl"),
      facebookUrl: form.get("facebookUrl"),
      instagramUrl: form.get("instagramUrl"),
      xUrl: form.get("xUrl")
    };

    try {
      const response = await fetch(member ? `/api/admin/team/${member.id}` : "/api/admin/team", {
        method: member ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrors(data.errors || { form: data.error || "Unable to save team member." });
        return;
      }

      router.push("/admin/team");
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
            <input id="name" name="name" defaultValue={member?.name || ""} required />
            {errors.name ? <span className="field-error">{errors.name}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="designation">Designation</label>
            <input id="designation" name="designation" defaultValue={member?.designation || ""} required />
            {errors.designation ? <span className="field-error">{errors.designation}</span> : null}
          </div>
          <div className="form-group">
            <label>Expertise</label>
            <div className="expertise-fields">
              {expertise.map((item, index) => (
                <div className="expertise-field" key={index}>
                  <input
                    value={item}
                    onChange={(event) => setExpertise((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.value : value))}
                    placeholder={`Expertise ${index + 1}`}
                    required={index === 0}
                  />
                  {expertise.length > 1 ? (
                    <button type="button" onClick={() => setExpertise((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
              <button type="button" className="btn btn-outline-gold" onClick={() => setExpertise((current) => [...current, ""])}>
                + Add Expertise
              </button>
            </div>
            {errors.expertise ? <span className="field-error">{errors.expertise}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="fullBio">Full Bio</label>
            <textarea id="fullBio" name="fullBio" className="content-editor" defaultValue={member?.fullBio || ""} />
          </div>
        </div>
        <aside className="admin-panel">
          <MediaUploadField
            name="profileImage"
            label="Profile Image"
            defaultValue={member?.profileImage || ""}
            folder="general"
            helperText="Upload JPG, PNG, or WebP"
          />
          {errors.profileImage ? <span className="field-error">{errors.profileImage}</span> : null}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" defaultValue={member?.email || ""} />
            {errors.email ? <span className="field-error">{errors.email}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel" defaultValue={member?.phone || ""} placeholder="+92 300 1234567" />
            {errors.phone ? <span className="field-error">{errors.phone}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="linkedinUrl">LinkedIn URL</label>
            <input id="linkedinUrl" name="linkedinUrl" type="url" defaultValue={member?.linkedinUrl || ""} placeholder="https://linkedin.com/in/..." />
            {errors.linkedinUrl ? <span className="field-error">{errors.linkedinUrl}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="facebookUrl">Facebook URL</label>
            <input id="facebookUrl" name="facebookUrl" type="url" defaultValue={member?.facebookUrl || ""} placeholder="https://facebook.com/..." />
            {errors.facebookUrl ? <span className="field-error">{errors.facebookUrl}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="instagramUrl">Instagram URL</label>
            <input id="instagramUrl" name="instagramUrl" type="url" defaultValue={member?.instagramUrl || ""} placeholder="https://instagram.com/..." />
            {errors.instagramUrl ? <span className="field-error">{errors.instagramUrl}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="xUrl">X URL</label>
            <input id="xUrl" name="xUrl" type="url" defaultValue={member?.xUrl || ""} placeholder="https://x.com/..." />
            {errors.xUrl ? <span className="field-error">{errors.xUrl}</span> : null}
          </div>
          <div className="admin-editor-actions">
            <button type="submit" className="form-submit" disabled={loading}>
              {loading ? "Saving..." : member ? "Update Team Member" : "Add Team Member"}
            </button>
          </div>
        </aside>
      </div>
    </form>
  );
}
