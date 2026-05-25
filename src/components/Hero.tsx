import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-end overflow-hidden bg-neutral-950 text-white">
      <Image
        src="/exhibitions/hero.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/65" />
      <div className="relative w-full px-5 pb-9 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20">
        <div className="max-w-4xl">
          <p className="mb-10 text-[10px] uppercase tracking-[0.28em] text-white/72 sm:mb-14 sm:text-[11px] sm:tracking-[0.3em]">
            FindArt Platform / Est. 2026
          </p>
          <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-white/75 sm:mb-5 sm:text-[11px] sm:tracking-[0.32em]">
            Currently
          </p>
          <h1 className="editorial-serif text-[clamp(3.05rem,9vw,8.25rem)] leading-[0.9] tracking-[-0.055em]">
            FindArt Platform
          </h1>
          <p className="mt-6 max-w-[19rem] text-[0.95rem] leading-6 text-white/78 sm:mt-7 sm:max-w-md sm:text-lg sm:leading-7">
            International exhibition archive and open submission platform
          </p>
          <Link
            href="/submit"
            className="mt-8 inline-block border-b border-white/70 pb-2 text-[10px] uppercase tracking-[0.26em] transition-opacity hover:opacity-55 sm:mt-10 sm:text-[11px] sm:tracking-[0.3em]"
          >
            Submit your exhibition
          </Link>
        </div>
      </div>
    </section>
  );
}
