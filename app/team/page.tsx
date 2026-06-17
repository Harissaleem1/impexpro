import type { Metadata } from "next";
import { TeamContent } from "@/components/TeamContent";
import { pageMetadata } from "@/lib/site";
import { getSiteSettings } from "@/lib/site-settings";
import { getActiveTeamMembers } from "@/lib/team";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata.team;

export default async function TeamPage() {
  const [members, settings] = await Promise.all([getActiveTeamMembers(), getSiteSettings()]);
  return <TeamContent members={members} settings={settings} />;
}
