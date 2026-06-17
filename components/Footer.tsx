import Link from "next/link";
import { site } from "@/lib/site";
import type { SiteSettings, SocialLink, SocialPlatform } from "@/lib/site-settings";

function socialIcon(platform: SocialPlatform) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (platform === "Facebook") return <svg aria-hidden="true" {...common}><path d="M14 8h3V4h-3a5 5 0 0 0-5 5v3H6v4h3v4h4v-4h3l1-4h-4V9a1 1 0 0 1 1-1Z" /></svg>;
  if (platform === "Instagram") return <svg aria-hidden="true" {...common}><rect x="3" y="3" width="18" height="18" rx="5" /><path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" /><path d="M16.5 7.5h.01" /></svg>;
  if (platform === "LinkedIn") return <svg aria-hidden="true" {...common}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" /><path d="M2 9h4v12H2z" /><path d="M4 4h.01" /></svg>;
  if (platform === "YouTube") return <svg aria-hidden="true" {...common}><path d="M22 12s0-4-1-5c-.6-.7-1.4-.8-2-.9C16.2 6 12 6 12 6s-4.2 0-7 .1c-.6.1-1.4.2-2 .9-1 1-1 5-1 5s0 4 1 5c.6.7 1.4.8 2 .9 2.8.1 7 .1 7 .1s4.2 0 7-.1c.6-.1 1.4-.2 2-.9 1-1 1-5 1-5Z" /><path d="m10 9 5 3-5 3Z" /></svg>;
  if (platform === "TikTok") return <svg aria-hidden="true" {...common}><path d="M14 3v10.5a4.5 4.5 0 1 1-4.5-4.5" /><path d="M14 5c1 2.6 2.7 4 5 4" /></svg>;
  if (platform === "X") return <svg aria-hidden="true" {...common}><path d="M4 4 20 20" /><path d="M20 4 4 20" /></svg>;
  if (platform === "WhatsApp") return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-1.7-.8-2.8-1.8-3.7-3.3-.3-.4.3-.4.8-1.4.1-.2.1-.4 0-.6-.1-.2-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.8.4-.3.3-1.1 1.1-1.1 2.6 0 1.5 1.1 3 1.3 3.2.2.2 2.2 3.4 5.3 4.7 2 .9 2.8.9 3.8.7.6-.1 1.8-.7 2.1-1.5.3-.7.3-1.4.2-1.5-.2-.1-.4-.2-.7-.4ZM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.7 0-3.3-.5-4.7-1.4l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z" /></svg>;
  return <svg aria-hidden="true" {...common}><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1" /></svg>;
}

function activeSocialLinks(links: SocialLink[]) {
  return [...links].filter((link) => link.active && link.url).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function Footer({ settings }: { settings: SiteSettings }) {
  const socialLinks = activeSocialLinks(settings.socialLinks);
  const address = [settings.address, settings.country].filter(Boolean).join(", ");

  return (
    <footer className="motion-item">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-icon">IP</div>
            <div className="footer-logo-name">{settings.businessName || site.name}</div>
          </div>
          <p>
            {settings.tagline || "Providing One Window Solutions for Import-Export businesses, consultancy, training, customs clearance, freight forwarding, and more."}
          </p>
          {socialLinks.length ? (
            <div className="footer-socials" aria-label="Social links">
              {socialLinks.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.label || link.platform} title={link.label || link.platform}>
                  {socialIcon(link.platform)}
                </a>
              ))}
            </div>
          ) : null}
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/team">Our Team</Link></li>
            <li><Link href="/activities">Activities</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <ul>
            <li><Link href="/services">Customs Clearance</Link></li>
            <li><Link href="/services">Freight Forwarding</Link></li>
            <li><Link href="/services">Business Registration</Link></li>
            <li><Link href="/services">Tax &amp; Legal</Link></li>
            <li><Link href="/training">Training</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li><a href={settings.phoneHref}>{settings.phone}</a></li>
            <li><a href={`mailto:${settings.primaryEmail}`}>{settings.primaryEmail}</a></li>
            {settings.secondaryEmail ? <li><a href={`mailto:${settings.secondaryEmail}`}>{settings.secondaryEmail}</a></li> : null}
            <li><Link href="/contact">{address}</Link></li>
            <li><a href={site.url} target="_blank" rel="noreferrer">impexalliancegroup.com</a></li>
            {settings.businessHours ? <li>{settings.businessHours}</li> : null}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 {settings.businessName || "Impex-Pro Business Consultant"} · Impex Trading Corporation. All rights reserved.</p>
        <p>Built for <Link href="/services">Global Trade Excellence</Link></p>
      </div>
    </footer>
  );
}
