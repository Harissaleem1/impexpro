"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  { href: "/admin/submissions", label: "Submissions", icon: "inbox" },
  { href: "/admin/blogs", label: "Blogs", icon: "doc" },
  { href: "/admin/activities", label: "Activities", icon: "calendar" },
  { href: "/admin/team", label: "Team", icon: "team" },
  { href: "/admin/reviews", label: "Reviews", icon: "star" },
  { href: "/admin/settings", label: "Settings", icon: "settings" }
];

function AdminIcon({ name }: { name: string }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "inbox") return <svg aria-hidden="true" {...common}><path d="M4 4h16v16H4z" /><path d="M4 14h4l2 3h4l2-3h4" /></svg>;
  if (name === "doc") return <svg aria-hidden="true" {...common}><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h5" /><path d="M9 13h6" /><path d="M9 17h6" /></svg>;
  if (name === "calendar") return <svg aria-hidden="true" {...common}><path d="M5 5h14v15H5z" /><path d="M8 3v4" /><path d="M16 3v4" /><path d="M5 10h14" /></svg>;
  if (name === "team") return <svg aria-hidden="true" {...common}><path d="M16 11a4 4 0 1 0-8 0" /><path d="M4 20a8 8 0 0 1 16 0" /><path d="M18 8a3 3 0 0 1 3 3" /><path d="M3 11a3 3 0 0 1 3-3" /></svg>;
  if (name === "star") return <svg aria-hidden="true" {...common}><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2 7.5 14 3 9.6l6.2-.9z" /></svg>;
  if (name === "settings") return <svg aria-hidden="true" {...common}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-2 3.4-.2-.1a1.8 1.8 0 0 0-2 .4l-.3.3a1.8 1.8 0 0 0-.5 1.4V23h-4v-.5a1.8 1.8 0 0 0-.5-1.4l-.3-.3a1.8 1.8 0 0 0-2-.4l-.2.1-2-3.4.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.5-1H5v-4h.3a1.8 1.8 0 0 0 1.5-1 1.8 1.8 0 0 0-.4-2l-.1-.1 2-3.4.2.1a1.8 1.8 0 0 0 2-.4l.3-.3a1.8 1.8 0 0 0 .5-1.4V1h4v.5a1.8 1.8 0 0 0 .5 1.4l.3.3a1.8 1.8 0 0 0 2 .4l.2-.1 2 3.4-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.5 1h.3v4h-.3a1.8 1.8 0 0 0-1.5 1Z" /></svg>;
  if (name === "logout") return <svg aria-hidden="true" {...common}><path d="M10 17 15 12l-5-5" /><path d="M15 12H3" /><path d="M14 4h5v16h-5" /></svg>;
  return <svg aria-hidden="true" {...common}><path d="M4 4h7v7H4z" /><path d="M13 4h7v7h-7z" /><path d="M4 13h7v7H4z" /><path d="M13 13h7v7h-7z" /></svg>;
}

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-brand">
          <span><Image src="/images/logo.png" alt="" width={42} height={42} /></span>
          <strong>Impex-Pro</strong>
        </Link>
        <div className="admin-sidebar-kicker">Management Suite</div>
        <nav>
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={item.href === "/admin" ? pathname === item.href ? "active" : "" : pathname.startsWith(item.href) ? "active" : ""}
            >
              <AdminIcon name={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>
        <button type="button" onClick={logout} disabled={loading}>
          <AdminIcon name="logout" />
          {loading ? "Signing out..." : "Logout"}
        </button>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
