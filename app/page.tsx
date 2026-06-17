import type { Metadata } from "next";
import { About } from "@/components/About";
import { Hero } from "@/components/Hero";
import { HomeRemaining } from "@/components/HomeRemaining";
import { Services } from "@/components/Services";
import { pageMetadata } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata.home;

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <HomeRemaining />
    </>
  );
}
