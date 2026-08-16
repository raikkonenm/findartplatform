import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { IndexImageCarousel } from "@/components/IndexImageCarousel";

export const metadata: Metadata = {
  title: "Index — FindArt Platform",
  description:
    "Index of artists and creative practices archived by FindArt Platform.",
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
  "/index/ivana.webp",
  "/index/ivana1.webp",
  "/index/ivana2.webp",
  "/index/ivana3.webp",
  "/index/ivana4.webp",
];

export default function IndexPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white pt-[65px]">
      <Header />
      <section className="px-5 pb-24 pt-8 md:px-8 md:pt-12 lg:px-12">
        <h1 className="mb-10 text-[11px] uppercase tracking-[0.28em] text-neutral-500">
          Index
        </h1>
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          <IndexCard entry={ruby}>
            <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out md:group-hover:scale-[1.025]"
              >
                <source src="/index/rubychen.web.mp4" type="video/mp4" />
              </video>
            </div>
          </IndexCard>

          <IndexCard entry={ivana}>
            <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
              <div className="transition-transform duration-500 ease-out md:group-hover:scale-[1.025]">
                <IndexImageCarousel images={ivanaImages} alt="Ivana Basic" />
              </div>
            </div>
          </IndexCard>
        </div>
      </section>
    </main>
  );
}

function IndexCard({
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
