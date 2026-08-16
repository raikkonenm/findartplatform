import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { IndexImageCarousel } from "@/components/IndexImageCarousel";

export const metadata: Metadata = {
  title: "Index",
  description: "FindArt Platform index of artists, projects, and creative practices.",
};

export default function IndexPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white pt-[65px]">
      <Header />
      <section className="px-5 pb-24 pt-8 md:px-8 md:pt-12 lg:px-12">
        <h1 className="mb-8 text-[11px] uppercase tracking-[0.22em] text-neutral-500">
          Index
        </h1>
        <div className="grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
          <a
            href="https://www.rubyljchen.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group block min-w-0"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Ruby Chen"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out md:group-hover:scale-[1.025]"
              >
                <source src="/index/rubychen.web.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="archive-card-copy pt-5">
              <h2 className="editorial-serif break-words text-[clamp(1.2rem,2vw,2rem)] uppercase leading-[1.04] tracking-[-0.035em]">
                Ruby Chen ↗
              </h2>
              <p className="mt-2 text-[0.85em] tracking-[0.12em] text-[#888]">
                rubyljchen.com
              </p>
            </div>
          </a>
          <a
            href="https://www.ivanabasic.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group block min-w-0"
          >
            <IndexImageCarousel />
            <div className="archive-card-copy pt-5">
              <h2 className="editorial-serif break-words text-[clamp(1.2rem,2vw,2rem)] uppercase leading-[1.04] tracking-[-0.035em]">
                Ivana Basic ↗
              </h2>
              <p className="mt-2 text-[0.85em] tracking-[0.12em] text-[#888]">
                ivanabasic.com
              </p>
            </div>
          </a>
        </div>
      </section>
    </main>
  );
}
