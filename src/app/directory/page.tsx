import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { IndexImageCarousel } from "@/components/IndexImageCarousel";

export const metadata: Metadata = {
  title: "Index — FindArt Platform",
  description:
    "Discover how artists, galleries and institutions present their work online.",
};

type IndexEntry = {
  name: string;
  href: string;
  subtitle: string;
};

const ruby: IndexEntry = {
  name: "RUBY CHEN",
  href: "https://www.rubyljchen.com/",
  subtitle: "rubyljchen.com",
};

const ivana: IndexEntry = {
  name: "IVANA BASIC",
  href: "https://www.ivanabasic.com/",
  subtitle: "ivanabasic.com",
};

const ivanaImages = [
  "/directory/ivana.webp",
  "/directory/ivana1.webp",
  "/directory/ivana2.webp",
  "/directory/ivana3.webp",
  "/directory/ivana4.webp",
];

export default function DirectoryPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white pt-[65px]">
      <Header />
      <section className="px-5 pb-24 pt-8 md:px-8 md:pt-12 lg:px-12">
        <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-neutral-500">
          Index
        </p>
        <h1 className="editorial-serif mb-14 max-w-3xl break-words text-[clamp(1.4rem,4.5vw,2.5rem)] leading-[1.15] tracking-[-0.02em] text-neutral-800">
          Discover how artists, galleries and institutions present their work online.
        </h1>
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          <DirectoryCard entry={ruby}>
            <div className="relative aspect-[2/1] overflow-hidden bg-neutral-100">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out md:group-hover:scale-[1.025]"
              >
                <source src="/directory/rubychen.web.mp4" type="video/mp4" />
              </video>
            </div>
          </DirectoryCard>

          <DirectoryCard entry={ivana}>
            <div className="relative aspect-[2/1] overflow-hidden bg-neutral-100">
              <IndexImageCarousel images={ivanaImages} alt="Ivana Basic" />
            </div>
          </DirectoryCard>
        </div>
      </section>
    </main>
  );
}

function DirectoryCard({
  entry,
  children,
}: {
  entry: IndexEntry;
  children: React.ReactNode;
}) {
  return (
    <a
      href={entry.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block min-w-0"
    >
      {children}
      <div className="archive-card-copy pt-5">
        <h2 className="editorial-serif break-words text-[clamp(0.9rem,4vw,1.3rem)] leading-[1.08] tracking-[-0.035em] md:text-[2rem] md:leading-[1.04]">
          {entry.name}
          <span className="ml-2 inline-block align-[0.15em] text-[0.6em]">
            &#8599;
          </span>
        </h2>
        <p className="mt-2 text-[0.85em] uppercase tracking-[0.2em] text-[#888]">
          {entry.subtitle}
        </p>
      </div>
    </a>
  );
}
