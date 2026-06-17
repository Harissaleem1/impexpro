"use client";

import { FormEvent, useState } from "react";
import type { SiteSettings, SocialLink, SocialPlatform } from "@/lib/site-settings";

const platforms: SocialPlatform[] = ["Facebook", "Instagram", "LinkedIn", "YouTube", "TikTok", "X", "WhatsApp", "Website", "Other"];

function newSocialLink(index: number): SocialLink {
  return {
    id: globalThis.crypto?.randomUUID?.() || `social-${Date.now()}-${index}`,
    platform: "Facebook",
    label: "Facebook",
    url: "",
    active: true,
    sortOrder: index
  };
}

function normalizeOrder(links: SocialLink[]) {
  return links.map((link, index) => ({ ...link, sortOrder: index }));
}

export function SiteSettingsEditor({ settings }: { settings: SiteSettings }) {
  const [values, setValues] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateField(name: keyof SiteSettings, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function updateSocial(id: string, patch: Partial<SocialLink>) {
    setValues((current) => ({
      ...current,
      socialLinks: current.socialLinks.map((link) => link.id === id ? { ...link, ...patch } : link)
    }));
  }

  function addSocial() {
    setValues((current) => ({
      ...current,
      socialLinks: normalizeOrder([...current.socialLinks, newSocialLink(current.socialLinks.length)])
    }));
  }

  function removeSocial(id: string) {
    setValues((current) => ({
      ...current,
      socialLinks: normalizeOrder(current.socialLinks.filter((link) => link.id !== id))
    }));
  }

  async function save(nextValues = values, orderOnly = false) {
    if (orderOnly) setSavingOrder(true);
    else setSaving(true);
    setMessage("");
    setErrors({});

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextValues)
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrors(data.errors || { form: data.error || "Unable to save settings." });
        return;
      }

      setValues(data.settings);
      setMessage(orderOnly ? "Social order saved." : "Site settings saved.");
    } catch {
      setErrors({ form: "Unable to connect to the server." });
    } finally {
      setSaving(false);
      setSavingOrder(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await save();
  }

  async function moveSocial(id: string, direction: -1 | 1) {
    const currentIndex = values.socialLinks.findIndex((link) => link.id === id);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= values.socialLinks.length) return;

    const nextLinks = [...values.socialLinks];
    [nextLinks[currentIndex], nextLinks[nextIndex]] = [nextLinks[nextIndex], nextLinks[currentIndex]];
    const nextValues = { ...values, socialLinks: normalizeOrder(nextLinks) };
    setValues(nextValues);
    await save(nextValues, true);
  }

  return (
    <form className="admin-editor settings-editor" onSubmit={submit}>
      {errors.form ? <div className="form-msg error" role="alert">{errors.form}</div> : null}
      {message ? <div className="form-msg success" role="status">{message}</div> : null}
      <div className="admin-editor-grid settings-editor-grid">
        <div className="admin-panel">
          <div className="admin-panel-head">
            <div><span>Business</span><h2>Contact Details</h2></div>
          </div>
          <div className="form-group">
            <label htmlFor="businessName">Business Name</label>
            <input id="businessName" value={values.businessName} onChange={(event) => updateField("businessName", event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="tagline">Tagline</label>
            <input id="tagline" value={values.tagline} onChange={(event) => updateField("tagline", event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="primaryEmail">Primary Email</label>
            <input id="primaryEmail" type="email" value={values.primaryEmail} onChange={(event) => updateField("primaryEmail", event.target.value)} />
            {errors.primaryEmail ? <span className="field-error">{errors.primaryEmail}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="secondaryEmail">Secondary Email</label>
            <input id="secondaryEmail" type="email" value={values.secondaryEmail || ""} onChange={(event) => updateField("secondaryEmail", event.target.value)} />
            {errors.secondaryEmail ? <span className="field-error">{errors.secondaryEmail}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input id="phone" value={values.phone} onChange={(event) => updateField("phone", event.target.value)} />
            {errors.phone ? <span className="field-error">{errors.phone}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="phoneHref">Phone Link</label>
            <input id="phoneHref" value={values.phoneHref} onChange={(event) => updateField("phoneHref", event.target.value)} placeholder="tel:+923001234567" />
            {errors.phoneHref ? <span className="field-error">{errors.phoneHref}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="whatsappNumber">WhatsApp Number</label>
            <input id="whatsappNumber" value={values.whatsappNumber} onChange={(event) => updateField("whatsappNumber", event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="whatsappUrl">WhatsApp URL</label>
            <input id="whatsappUrl" value={values.whatsappUrl} onChange={(event) => updateField("whatsappUrl", event.target.value)} />
            {errors.whatsappUrl ? <span className="field-error">{errors.whatsappUrl}</span> : null}
          </div>
        </div>

        <aside className="admin-panel">
          <div className="admin-panel-head">
            <div><span>Location</span><h2>Office Info</h2></div>
          </div>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea id="address" value={values.address} onChange={(event) => updateField("address", event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input id="city" value={values.city} onChange={(event) => updateField("city", event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input id="country" value={values.country} onChange={(event) => updateField("country", event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="businessHours">Business Hours</label>
            <input id="businessHours" value={values.businessHours || ""} onChange={(event) => updateField("businessHours", event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="googleMapsUrl">Google Maps URL</label>
            <input id="googleMapsUrl" value={values.googleMapsUrl || ""} onChange={(event) => updateField("googleMapsUrl", event.target.value)} />
            {errors.googleMapsUrl ? <span className="field-error">{errors.googleMapsUrl}</span> : null}
          </div>
          <div className="form-group">
            <label htmlFor="googleMapsEmbedUrl">Google Maps Embed URL</label>
            <textarea id="googleMapsEmbedUrl" value={values.googleMapsEmbedUrl || ""} onChange={(event) => updateField("googleMapsEmbedUrl", event.target.value)} />
            {errors.googleMapsEmbedUrl ? <span className="field-error">{errors.googleMapsEmbedUrl}</span> : null}
          </div>
          <div className="admin-editor-actions">
            <button type="submit" className="form-submit" disabled={saving}>
              {saving ? "Saving settings..." : "Save Site Settings"}
            </button>
          </div>
        </aside>
      </div>

      <section className="admin-panel settings-social-panel">
        <div className="admin-panel-head">
          <div><span>Footer</span><h2>Social Links</h2></div>
          <button type="button" className="btn btn-gold" onClick={addSocial}>Add Social Link</button>
        </div>
        {savingOrder ? <div className="admin-order-status">Saving social order...</div> : null}
        <div className="settings-social-list">
          {values.socialLinks.map((link, index) => (
            <div className="settings-social-row" key={link.id}>
              <div className="settings-social-order">
                <button type="button" onClick={() => moveSocial(link.id, -1)} disabled={index === 0 || savingOrder}>Up</button>
                <button type="button" onClick={() => moveSocial(link.id, 1)} disabled={index === values.socialLinks.length - 1 || savingOrder}>Down</button>
              </div>
              <select value={link.platform} onChange={(event) => updateSocial(link.id, { platform: event.target.value as SocialPlatform, label: event.target.value })}>
                {platforms.map((platform) => <option value={platform} key={platform}>{platform}</option>)}
              </select>
              <input value={link.label} onChange={(event) => updateSocial(link.id, { label: event.target.value })} placeholder="Label" />
              <input value={link.url} onChange={(event) => updateSocial(link.id, { url: event.target.value })} placeholder="https://..." />
              <label className="admin-check">
                <input type="checkbox" checked={link.active} onChange={(event) => updateSocial(link.id, { active: event.target.checked })} />
                Active
              </label>
              <button type="button" className="danger-action settings-remove-social" onClick={() => removeSocial(link.id)}>Delete</button>
              {errors[`socialLinks.${index}.url`] ? <span className="field-error">{errors[`socialLinks.${index}.url`]}</span> : null}
            </div>
          ))}
          {!values.socialLinks.length ? <p>No social links yet.</p> : null}
        </div>
      </section>
    </form>
  );
}
