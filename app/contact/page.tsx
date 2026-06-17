import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/PageHero";
import { getSiteSettings } from "@/lib/site-settings";
import { pageMetadata, site } from "@/lib/site";

export const metadata: Metadata = pageMetadata.contact;

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const officeAddress = [settings.address, settings.country].filter(Boolean).join(", ");
  const mapUrl = settings.googleMapsEmbedUrl || settings.googleMapsUrl;

  return (
    <>
      <PageHero
        page="Contact"
        title={<>Let&apos;s Start Your <em>Journey</em></>}
        description="Reach out to discuss your import-export needs, business registration, customs clearance, freight forwarding, or training requirements."
      />
      <section className="section fade-in" style={{ background: "var(--off-white)" }}>
        <div className="contact-grid">
          <div className="contact-info">
            <div className="section-tag">Contact Impex-Pro</div>
            <h2 className="section-title">Reach Us <em>Anytime</em></h2>
            <p>
              Whether you are starting your first import-export business or need expert
              support for customs, logistics, registration, tax, legal, or training,
              our team is ready to help.
            </p>
            <div className="contact-items">
              <div className="contact-item">
                <div className="contact-icon">✉️</div>
                <div>
                  <div className="contact-label">Email</div>
                  <div className="contact-val">
                    <a href={`mailto:${settings.primaryEmail}`}>{settings.primaryEmail}</a>
                  </div>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <div>
                  <div className="contact-label">Phone / WhatsApp</div>
                  <div className="contact-val">
                    <a href={settings.phoneHref}>{settings.phone}</a>
                  </div>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">🌐</div>
                <div>
                  <div className="contact-label">Website</div>
                  <div className="contact-val">
                    <a href={site.url} target="_blank" rel="noreferrer">
                      impexalliancegroup.com
                    </a>
                  </div>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">📍</div>
                <div>
                  <div className="contact-label">Office</div>
                  <div className="contact-val">
                    {settings.googleMapsUrl ? (
                      <a href={settings.googleMapsUrl} target="_blank" rel="noreferrer">{officeAddress}</a>
                    ) : officeAddress}
                  </div>
                </div>
              </div>
              {settings.businessHours ? (
                <div className="contact-item">
                  <div className="contact-icon">🕒</div>
                  <div>
                    <div className="contact-label">Business Hours</div>
                    <div className="contact-val">{settings.businessHours}</div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
      {mapUrl ? (
        <iframe
          className="map-embed"
          src={mapUrl}
          allowFullScreen
          loading="lazy"
          title={`${settings.businessName} Office - ${officeAddress}`}
        />
      ) : null}
    </>
  );
}
