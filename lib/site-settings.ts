import { getSiteSettingsCollection } from "@/lib/mongodb";
import { serializeMongoDocument } from "@/lib/mongo-serialize";
import { siteConfig } from "@/lib/site-config";

export type SocialPlatform =
  | "Facebook"
  | "Instagram"
  | "LinkedIn"
  | "YouTube"
  | "TikTok"
  | "X"
  | "WhatsApp"
  | "Website"
  | "Other";

export type SocialLink = {
  id: string;
  platform: SocialPlatform;
  label: string;
  url: string;
  active: boolean;
  sortOrder: number;
};

export type SiteSettings = {
  key: "main";
  businessName: string;
  tagline: string;
  primaryEmail: string;
  secondaryEmail?: string;
  phone: string;
  phoneHref: string;
  whatsappNumber: string;
  whatsappUrl: string;
  address: string;
  city: string;
  country: string;
  googleMapsUrl?: string;
  googleMapsEmbedUrl?: string;
  businessHours?: string;
  socialLinks: SocialLink[];
  createdAt: string;
  updatedAt: string;
};

export type SiteSettingsInput = Partial<Omit<SiteSettings, "key" | "createdAt" | "updatedAt">>;

const defaultMapEmbed =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3321.03!2d73.0479!3d33.7038!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sG-9+Markaz%2C+Islamabad!5e0!3m2!1sen!2spk!4v1700000000000";

const socialPlatforms: SocialPlatform[] = ["Facebook", "Instagram", "LinkedIn", "YouTube", "TikTok", "X", "WhatsApp", "Website", "Other"];

function clean(value: unknown, max = 1000) {
  return String(value || "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, max);
}

function cleanUrl(value: unknown) {
  return clean(value, 1500);
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validUrl(value: string) {
  return /^https?:\/\/\S+$/i.test(value);
}

function normalizePhoneHref(phone: string, provided?: string) {
  const href = clean(provided, 120);
  if (href.startsWith("tel:")) return href;
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : siteConfig.phoneHref;
}

function normalizeSocialLinks(value: unknown) {
  const links = Array.isArray(value) ? value : [];
  return links
    .map((item, index) => {
      const record = item as Partial<SocialLink>;
      const platform = socialPlatforms.includes(record.platform as SocialPlatform) ? record.platform as SocialPlatform : "Other";
      const label = clean(record.label || platform, 80);
      const url = cleanUrl(record.url);
      return {
        id: clean(record.id, 120) || `social-${Date.now()}-${index}`,
        platform,
        label: label || platform,
        url,
        active: record.active !== false,
        sortOrder: Number.isFinite(record.sortOrder) ? Number(record.sortOrder) : index
      };
    })
    .filter((link) => link.label || link.url)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getDefaultSiteSettings(): SiteSettings {
  const now = new Date().toISOString();

  return {
    key: "main",
    businessName: "Impex-Pro Business Consultant",
    tagline: "One Window Solutions for Global Trade",
    primaryEmail: siteConfig.email,
    phone: siteConfig.phone,
    phoneHref: siteConfig.phoneHref,
    whatsappNumber: "+923032708008",
    whatsappUrl: siteConfig.whatsapp,
    address: siteConfig.address,
    city: "Islamabad",
    country: "Pakistan",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=G-9%20Markaz%2C%20Islamabad%2C%20Pakistan",
    googleMapsEmbedUrl: defaultMapEmbed,
    businessHours: "Monday to Saturday, 10:00 AM - 6:00 PM",
    socialLinks: [
      {
        id: "whatsapp",
        platform: "WhatsApp",
        label: "WhatsApp",
        url: siteConfig.whatsapp,
        active: true,
        sortOrder: 0
      }
    ],
    createdAt: now,
    updatedAt: now
  };
}

async function ensureSiteSettings() {
  const collection = await getSiteSettingsCollection();
  const existing = await collection.findOne({ key: "main" });
  if (existing) return serializeMongoDocument(existing);

  const defaults = getDefaultSiteSettings();
  await collection.updateOne({ key: "main" }, { $setOnInsert: defaults }, { upsert: true });
  return defaults;
}

export async function getSiteSettings() {
  try {
    const settings = await ensureSiteSettings();
    return {
      ...settings,
      socialLinks: normalizeSocialLinks(settings.socialLinks)
    };
  } catch (error) {
    console.warn("[site-settings] Falling back to default settings.", error);
    return getDefaultSiteSettings();
  }
}

export function getActiveSocialLinks(settings: SiteSettings) {
  return normalizeSocialLinks(settings.socialLinks).filter((link) => link.active && link.url);
}

export function validateSiteSettingsInput(input: SiteSettingsInput) {
  const errors: Record<string, string> = {};
  const current = getDefaultSiteSettings();
  const businessName = clean(input.businessName, 180) || current.businessName;
  const tagline = clean(input.tagline, 240) || current.tagline;
  const primaryEmail = clean(input.primaryEmail, 240) || current.primaryEmail;
  const secondaryEmail = clean(input.secondaryEmail, 240) || undefined;
  const phone = clean(input.phone, 80) || current.phone;
  const phoneHref = normalizePhoneHref(phone, input.phoneHref);
  const whatsappNumber = clean(input.whatsappNumber, 80) || current.whatsappNumber;
  const whatsappUrl = cleanUrl(input.whatsappUrl) || current.whatsappUrl;
  const address = clean(input.address, 300) || current.address;
  const city = clean(input.city, 120) || current.city;
  const country = clean(input.country, 120) || current.country;
  const googleMapsUrl = cleanUrl(input.googleMapsUrl) || undefined;
  const googleMapsEmbedUrl = cleanUrl(input.googleMapsEmbedUrl) || undefined;
  const businessHours = clean(input.businessHours, 180) || undefined;
  const socialLinks = normalizeSocialLinks(input.socialLinks);

  if (!validEmail(primaryEmail)) errors.primaryEmail = "Enter a valid primary email.";
  if (secondaryEmail && !validEmail(secondaryEmail)) errors.secondaryEmail = "Enter a valid secondary email.";
  if (!phone) errors.phone = "Phone number is required.";
  if (!phoneHref.startsWith("tel:")) errors.phoneHref = "Phone href must start with tel:.";
  if (whatsappUrl && !validUrl(whatsappUrl)) errors.whatsappUrl = "WhatsApp URL must start with http:// or https://.";
  if (googleMapsUrl && !validUrl(googleMapsUrl)) errors.googleMapsUrl = "Google Maps URL must start with http:// or https://.";
  if (googleMapsEmbedUrl && !validUrl(googleMapsEmbedUrl)) errors.googleMapsEmbedUrl = "Google Maps embed URL must start with http:// or https://.";

  socialLinks.forEach((link, index) => {
    if (link.url && !validUrl(link.url)) errors[`socialLinks.${index}.url`] = `${link.label || "Social link"} URL must start with http:// or https://.`;
  });

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    data: {
      businessName,
      tagline,
      primaryEmail,
      secondaryEmail,
      phone,
      phoneHref,
      whatsappNumber,
      whatsappUrl,
      address,
      city,
      country,
      googleMapsUrl,
      googleMapsEmbedUrl,
      businessHours,
      socialLinks
    }
  };
}

export async function updateSiteSettings(input: SiteSettingsInput) {
  const result = validateSiteSettingsInput(input);
  if (!result.ok) return { ok: false as const, errors: result.errors };

  const collection = await getSiteSettingsCollection();
  const existing = await ensureSiteSettings();
  const updated: SiteSettings = {
    ...existing,
    ...result.data,
    key: "main",
    updatedAt: new Date().toISOString()
  };

  await collection.updateOne({ key: "main" }, { $set: updated }, { upsert: true });
  return { ok: true as const, settings: updated };
}
