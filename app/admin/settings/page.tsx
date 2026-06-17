import type { Metadata } from "next";
import { AdminChrome } from "@/components/AdminChrome";
import { SiteSettingsEditor } from "@/components/SiteSettingsEditor";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Site Settings | Impex-Pro CMS",
  robots: { index: false, follow: false }
};

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <AdminChrome>
      <div className="admin-page-head">
        <div>
          <span>Website Settings</span>
          <h1>Contact &amp; Social</h1>
          <p>Manage public contact details, WhatsApp links, office information, and footer social profiles.</p>
        </div>
      </div>
      <SiteSettingsEditor settings={settings} />
    </AdminChrome>
  );
}
