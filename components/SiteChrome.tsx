"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { ClientEffects } from "@/components/ClientEffects";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import type { SiteSettings } from "@/lib/site-settings";

export function SiteChrome({ children, settings }: { children: React.ReactNode; settings: SiteSettings }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer settings={settings} />
      <WhatsAppFab url={settings.whatsappUrl} />
      <ClientEffects />
    </>
  );
}
