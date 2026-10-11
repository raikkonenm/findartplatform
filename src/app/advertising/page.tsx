import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/Header";
import { AdvertisingRequestForm } from "@/components/AdvertisingRequestForm";
import { RequestPlacementButton } from "@/components/RequestPlacementButton";

const AD_TITLE = "Advertising — FindArt Platform";
const AD_DESCRIPTION =
  "Promote your exhibition, gallery, art fair, open call or creative project on FindArt Platform. Available placements and pricing.";
const AD_URL = "https://www.findartplatform.com/advertising";

export const metadata: Metadata = {
  title: { absolute: AD_TITLE },
  description: AD_DESCRIPTION,
  alternates: { canonical: AD_URL },
  openGraph: {
    type: "website",
    url: AD_URL,
    title: AD_TITLE,
    description: AD_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: AD_TITLE,
    description: AD_DESCRIPTION,
  },
};

type PlacementCardProps = {
  label: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  lead: string;
  specs: string[];
  pricing: Array<{ term: string; price: string }>;
  requestFormat: "billboard" | "pinned-feed";
};

export default function AdvertisingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white pt-[95px] md:pt-[105px]">
      <Header />
      <section className="px-5 pb-24 md:px-8 lg:px-12">
        {/* Centred intro */}
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">Advertising</p>
          <h1 className="editorial-serif text-[clamp(1.6rem,3.8vw,2.4rem)] uppercase leading-[1.02] tracking-[-0.02em] text-neutral-900">
            Advertise on FindArt Platform
          </h1>
          <div className="space-y-3 text-[15px] leading-[1.65] text-neutral-700 md:text-[16px]">
            <p>
              Connect your project with an international audience engaged in contemporary art. Our
              advertising placements offer dedicated visibility for exhibitions, galleries, art
              fairs, open calls, and independent artistic initiatives.
            </p>
            <p>Explore the available formats below and find the right placement for your project.</p>
          </div>
        </div>

        {/* Two placement cards — full page width (minus the page's own
            horizontal padding) so each mockup renders large enough to
            read as a realistic site preview, not a thumbnail. */}
        <div className="mt-16 grid w-full grid-cols-1 gap-10 md:mt-20 md:grid-cols-2 md:gap-14">
          <PlacementCard
            label="Billboard Ad"
            image="/advertising/billboard-ad.webp"
            imageWidth={1889}
            imageHeight={732}
            lead="A featured advertising placement at the top of the FindArt Platform homepage. Promote your exhibition, gallery, art fair, open call, or creative project with a direct link to your website."
            // Specs match the live homepage featured-banner slot, which
            // uses source images at ~1200×549 (≈ 2.2:1). We don't
            // enforce a strict 16:9 because the real slot is wider.
            specs={[
              "File format: JPG or PNG",
              "Recommended dimensions: 1200 × 549 px (≈ 2.2:1)",
              "Max file size: 2 MB",
              "URL linking to your website or project",
              "Placement: Homepage, featured section",
            ]}
            pricing={[
              { term: "1 month", price: "€179" },
              { term: "3 months", price: "€489" },
              { term: "6 months", price: "€899" },
              { term: "1 year", price: "€1,590" },
            ]}
            requestFormat="billboard"
          />
          <PlacementCard
            label="Pinned Feed Ad"
            image="/advertising/pinned-feed-ad.webp"
            imageWidth={1889}
            imageHeight={738}
            lead="Position your project at the top of the FindArt Platform Explore feed. Your advertisement stays in the first position throughout the selected period, connecting your project with visitors exploring contemporary art."
            // Specs match the pinned feed-card slot, which is a 3:4
            // portrait tile (same aspect as the Submit-Exhibition card
            // that currently occupies the pinned slot).
            specs={[
              "File format: JPG or PNG",
              "Recommended dimensions: 900 × 1200 px (3:4 portrait)",
              "Max file size: 2 MB",
              "URL linking to your website or project",
              "Placement: Pinned position in Explore feed",
            ]}
            pricing={[
              { term: "1 month", price: "€99" },
              { term: "3 months", price: "€269" },
              { term: "6 months", price: "€499" },
              { term: "1 year", price: "€890" },
            ]}
            requestFormat="pinned-feed"
          />
        </div>

        <AdvertisingRequestForm />
      </section>
    </main>
  );
}

function PlacementCard({
  label,
  image,
  imageWidth,
  imageHeight,
  lead,
  specs,
  pricing,
  requestFormat,
}: PlacementCardProps) {
  return (
    <article className="flex flex-col gap-6">
      {/* Mockup displayed at its intrinsic aspect ratio, scaled only to
          column width — never cropped. `h-auto` lets the image honour
          its real proportions instead of being forced into a container
          aspect ratio. */}
      <Image
        src={image}
        alt={`${label} example`}
        width={imageWidth}
        height={imageHeight}
        sizes="(min-width: 768px) 45vw, 100vw"
        className="h-auto w-full"
      />
      <div className="space-y-4">
        <h2 className="editorial-serif text-[clamp(1.1rem,2vw,1.5rem)] uppercase leading-[1.1] tracking-[-0.01em] text-neutral-900">
          {label}
        </h2>
        <p className="text-[14px] leading-[1.65] text-neutral-700 md:text-[15px]">{lead}</p>

        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-neutral-500">Specs</p>
          <ul className="list-disc space-y-1 pl-5 text-[14px] leading-[1.6] text-neutral-700 marker:text-neutral-400">
            {specs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-neutral-500">Pricing</p>
          <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
            {pricing.map(({ term, price }) => (
              <li key={term} className="flex items-baseline justify-between py-2.5 text-[14px] text-neutral-800">
                <span>{term}</span>
                <span className="font-semibold">{price}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Client-side link to the form below. See RequestPlacementButton. */}
        <RequestPlacementButton format={requestFormat} />
      </div>
    </article>
  );
}
