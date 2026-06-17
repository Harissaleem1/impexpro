import type { Metadata } from "next";
import { ActivitiesContent } from "@/components/ActivitiesContent";
import { getPublishedActivities } from "@/lib/activities";
import { pageMetadata } from "@/lib/site";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata.activities;

export default async function ActivitiesPage() {
  const [activities, settings] = await Promise.all([getPublishedActivities(), getSiteSettings()]);
  return <ActivitiesContent activities={activities} settings={settings} />;
}
