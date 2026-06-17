"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { SiteSettings } from "@/lib/site-settings";
import type { TeamMember } from "@/lib/team-shared";
import { teamMemberInitials } from "@/lib/team-shared";

function ContactIcon({ kind }: { kind: "email" | "phone" | "linkedin" | "facebook" | "instagram" | "x" }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  if (kind === "email") {
    return <svg aria-hidden="true" {...common}><path d="M4 6h16v12H4z" /><path d="m4 8 8 6 8-6" /></svg>;
  }
  if (kind === "phone") {
    return <svg aria-hidden="true" {...common}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a16 16 0 0 0 6.4 6.4l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 2Z" /></svg>;
  }
  if (kind === "linkedin") {
    return <svg aria-hidden="true" {...common}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" /><path d="M2 9h4v12H2z" /><path d="M4 4h.01" /></svg>;
  }
  if (kind === "facebook") {
    return <svg aria-hidden="true" {...common}><path d="M14 8h3V4h-3a5 5 0 0 0-5 5v3H6v4h3v4h4v-4h3l1-4h-4V9a1 1 0 0 1 1-1Z" /></svg>;
  }
  if (kind === "instagram") {
    return <svg aria-hidden="true" {...common}><rect x="3" y="3" width="18" height="18" rx="5" /><path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" /><path d="M16.5 7.5h.01" /></svg>;
  }
  return <svg aria-hidden="true" {...common}><path d="M4 4 20 20" /><path d="M20 4 4 20" /></svg>;
}

function expertiseTags(member: TeamMember) {
  return (member.expertise?.length ? member.expertise : member.shortBio.split(",")).map((item) => item.trim()).filter(Boolean);
}

function ProfileVisual({ member, primary = false }: { member: TeamMember; primary?: boolean }) {
  if (member.profileImage) {
    return (
      <div className={primary ? "ceo-photo-frame" : undefined}>
        {/* Local migrated assets and Cloudinary secure URLs are both supported. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={primary ? undefined : "tcard-img"} src={member.profileImage} alt={member.name} />
      </div>
    );
  }

  return <div className={primary ? "ceo-initials" : "tcard-initials"}>{teamMemberInitials(member.name)}</div>;
}

function phoneHref(phone?: string) {
  if (!phone) return "";
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : "";
}

function ContactLink({ href, children, external = false }: { href: string; children: ReactNode; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </a>
  );
}

function TeamContactMeta({ member, primary = false, modal = false }: { member: TeamMember; primary?: boolean; modal?: boolean }) {
  const socialLinks = [
    member.linkedinUrl ? { href: member.linkedinUrl, label: "LinkedIn", kind: "linkedin" as const } : null,
    member.facebookUrl ? { href: member.facebookUrl, label: "Facebook", kind: "facebook" as const } : null,
    member.instagramUrl ? { href: member.instagramUrl, label: "Instagram", kind: "instagram" as const } : null,
    member.xUrl ? { href: member.xUrl, label: "X", kind: "x" as const } : null
  ].filter(Boolean) as Array<{ href: string; label: string; kind: "linkedin" | "facebook" | "instagram" | "x" }>;

  if (!member.email && !member.phone && !socialLinks.length) return null;

  const contactClass = modal ? "team-modal-contact" : primary ? "ceo-contact" : "tcard-contact";
  const socialClass = modal ? "team-modal-socials" : primary ? "ceo-socials" : "tcard-socials";

  return (
    <div className={contactClass}>
      {member.email ? <ContactLink href={`mailto:${member.email}`}><ContactIcon kind="email" /><span>{member.email}</span></ContactLink> : null}
      {member.phone ? <ContactLink href={phoneHref(member.phone)}><ContactIcon kind="phone" /><span>{member.phone}</span></ContactLink> : null}
      {socialLinks.length ? (
        <div className={socialClass}>
          {socialLinks.map((social) => (
            <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} onClick={(event) => event.stopPropagation()}>
              <ContactIcon kind={social.kind} />
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TeamCard({ member, number, onOpen }: { member: TeamMember; number: number; onOpen: (member: TeamMember) => void }) {
  return (
    <article
      className="tcard"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(member)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(member);
        }
      }}
    >
      <div className="tcard-photo">
        <div className="tcard-photo-bg bg-haris" />
        <div className="tcard-photo-pattern" />
        <div className="tcard-photo-lines" />
        <div className="tcard-photo-arc" />
        <div className="tcard-photo-arc2" />
        <ProfileVisual member={member} />
        <div className="tcard-photo-fade" />
        <div className="tcard-num">{String(number).padStart(2, "0")}</div>
      </div>
      <div className="tcard-info">
        <div className="tcard-name">{member.name}</div>
        <div className="tcard-role">{member.designation}</div>
        <div className="tcard-divider" />
        <div className="tcard-expertise">
          {expertiseTags(member).map((tag) => <span className="tcard-tag" key={tag}>{tag}</span>)}
        </div>
        <TeamContactMeta member={member} />
      </div>
    </article>
  );
}

function TeamProfileModal({ member, onClose }: { member: TeamMember | null; onClose: () => void }) {
  useEffect(() => {
    if (!member) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [member, onClose]);

  if (!member) return null;

  const tags = expertiseTags(member);
  const bio = member.fullBio || "";

  return (
    <div className="team-modal-backdrop" role="presentation" onClick={onClose}>
      <section className="team-modal" role="dialog" aria-modal="true" aria-labelledby="team-modal-title" onClick={(event) => event.stopPropagation()}>
        <button className="team-modal-close" type="button" aria-label="Close profile" onClick={onClose}>x</button>
        <div className="team-modal-media">
          <div className="team-modal-image">
            <ProfileVisual member={member} />
          </div>
        </div>
        <div className="team-modal-body">
          <div className="ceo-label">Team Profile</div>
          <h2 id="team-modal-title">{member.name}</h2>
          <p className="team-modal-role">{member.designation}</p>
          {tags.length ? (
            <div className="team-modal-tags">
              {tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          ) : null}
          {bio ? (
            <div className="team-modal-section">
              <h3>Full Bio</h3>
              <p>{bio}</p>
            </div>
          ) : null}
          <TeamContactMeta member={member} modal />
        </div>
      </section>
    </div>
  );
}

export function TeamContent({ members, settings }: { members: TeamMember[]; settings: SiteSettings }) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [leader, ...team] = members;
  const mainTeam = team.slice(0, 4);
  const lowerTeam = team.slice(4);

  return (
    <>
      <section className="team-hero">
        <div className="team-hero-grid-bg" />
        <div className="team-hero-orb team-hero-orb-1" />
        <div className="team-hero-orb team-hero-orb-2" />
        <div className="team-hero-content">
          <nav className="breadcrumb team-breadcrumb">
            <Link href="/">Home</Link><span className="breadcrumb-sep">›</span><span>Our Team</span>
          </nav>
          <div className="team-hero-eyebrow">Leadership &amp; Experts</div>
          <h1>The People Behind<br /><em>Impex-Pro</em></h1>
          <p className="team-hero-desc">A distinguished team of trade consultants, logistics specialists, legal experts, and business strategists - united by one goal: your global success.</p>
          <div className="team-hero-stats">
            <div className="team-hero-stat"><div className="n">{members.length}+</div><div className="l">Team Members</div></div>
            <div className="team-hero-stat"><div className="n">15+</div><div className="l">Years Experience</div></div>
            <div className="team-hero-stat"><div className="n">400+</div><div className="l">Clients Served</div></div>
          </div>
        </div>
      </section>

      <section className="team-section">
        <div className="team-intro fade-in">
          <div className="eyebrow">Our Leadership</div>
          <h2>Experts Driving <em>Global Trade</em></h2>
          <p>From customs and compliance to freight and finance - our leadership brings deep domain expertise and a shared passion for helping businesses reach their full global potential.</p>
        </div>

        {leader ? (
          <div className="team-ceo-wrap fade-in">
            <article
              className="team-ceo-card"
              role="button"
              tabIndex={0}
              onClick={() => setSelectedMember(leader)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedMember(leader);
                }
              }}
            >
              <div className="ceo-photo-side">
                <div className="ceo-photo-bg" />
                <div className="ceo-photo-pattern" />
                <ProfileVisual member={leader} primary />
                <div className="ceo-photo-badge">CEO &amp; Founder</div>
              </div>
              <div className="ceo-info-side">
                <div className="ceo-label">Leadership</div>
                <div className="ceo-name">{leader.name}</div>
                <div className="ceo-title">{leader.designation}</div>
                <div className="ceo-divider" />
                <p className="ceo-bio">{leader.fullBio || leader.shortBio}</p>
                <div className="ceo-tags">
                  {expertiseTags(leader).map((tag) => <span className="ceo-tag" key={tag}>{tag}</span>)}
                </div>
                <TeamContactMeta member={leader} primary />
              </div>
            </article>
          </div>
        ) : null}

        {mainTeam.length ? (
          <div className="team-grid-main fade-in">
            {mainTeam.map((member, index) => <TeamCard key={member.id} member={member} number={index + 1} onOpen={setSelectedMember} />)}
          </div>
        ) : null}

        <div className="team-grid-bottom fade-in">
          {lowerTeam.map((member, index) => <TeamCard key={member.id} member={member} number={index + 5} onOpen={setSelectedMember} />)}
        </div>

        <div className="team-join-banner fade-in">
          <div className="team-join-bg" />
          <div className="join-text">
            <div className="join-tag">Career Opportunities</div>
            <div className="join-title">Want to <em>Join Our Team?</em></div>
            <p className="join-desc">We are always looking for passionate trade professionals, logistics specialists, and business consultants to join our growing team. Bring your expertise - we&apos;ll build something great together.</p>
          </div>
          <div className="join-actions">
            <Link href="/contact" className="btn-join-primary">Get in Touch</Link>
            <a href={`mailto:${settings.primaryEmail}`} className="btn-join-secondary">Send Your CV</a>
          </div>
        </div>
      </section>
      <TeamProfileModal member={selectedMember} onClose={() => setSelectedMember(null)} />
    </>
  );
}
