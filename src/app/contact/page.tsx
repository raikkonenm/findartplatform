import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Header } from "@/components/Header";

const PAGE_URL = "https://www.findartplatform.com/contact";
const PAGE_TITLE = "Contact FindArt Platform";
const PAGE_DESCRIPTION =
  "Get in touch with FindArt Platform — general inquiries, editorial questions, partnerships, advertising or press.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white pt-[95px] text-neutral-900 md:pt-[105px]">
      <Header />
      <section className="px-5 pb-20 md:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">Get in touch</p>
            <h1 className="editorial-serif mt-3 text-[clamp(1.5rem,3.4vw,2.2rem)] uppercase leading-[1.02] tracking-[-0.02em] text-neutral-900">
              CONTACT US
            </h1>
          </div>

          <p className="text-[15px] leading-[1.65] text-neutral-700 md:text-[16px]">
            For general inquiries, partnerships, press or advertising — use the form
            below and we&rsquo;ll reply within a few working days.
            <br />
            <br />
            For submissions of exhibitions, artist portfolios, opportunities, websites
            or editorial pitches, please use the dedicated forms on the{" "}
            <a
              href="/submit"
              className="text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition-opacity hover:opacity-55"
            >
              Submit
            </a>{" "}
            page.
          </p>

          <ContactForm />
        </div>
      </section>
    </main>
  );
}
