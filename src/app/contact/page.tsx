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
    <main className="min-h-screen bg-white pt-[95px] text-neutral-900 md:pt-[105px]">
      <Header />
      <section className="px-5 pb-24 md:px-8 lg:px-12">
        <div className="grid items-start gap-14 lg:grid-cols-[minmax(19rem,0.78fr)_minmax(32rem,1fr)] lg:gap-20 xl:gap-28">
          <div className="lg:sticky lg:top-32">
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Get in touch</p>
            <h1 className="editorial-serif mt-6 break-words text-[clamp(2.75rem,13vw,5.3rem)] leading-[0.94] tracking-[-0.055em] md:text-[clamp(3.1rem,5vw,5.3rem)]">
              Contact us
            </h1>
            <p className="mt-8 max-w-md text-[1.05rem] leading-8 text-neutral-600">
              For general inquiries, partnerships, press or advertising — use the form
              on the right and we&rsquo;ll reply within a few working days.
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
          </div>

          <ContactForm />
        </div>
      </section>
    </main>
  );
}
