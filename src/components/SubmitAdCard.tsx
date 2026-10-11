import Image from "next/image";
import Link from "next/link";

/**
 * Static pinned ad card that drops into the homepage masonry at
 * row 2 position 2 (flat index 6 in the dense 5-column grid). Mirrors
 * the visual language of `EditorialPromoCard` (aspect-[3/4] portrait,
 * image behind, centred white uppercase label, dark hover overlay),
 * but links to /submit and uses `/promo/submit-exhibition-bg.webp`
 * as the background.
 */
export function SubmitAdCard() {
  return (
    <article>
      <Link
        href="/submit"
        aria-label="Submit an exhibition"
        className="group relative block aspect-[3/4] overflow-hidden bg-neutral-100"
      >
        <Image
          src="/promo/submit-exhibition-bg.webp"
          alt=""
          fill
          loading="lazy"
          sizes="(min-width: 1024px) 31vw, (min-width: 768px) 47vw, 100vw"
          className="object-cover"
        />
        <span className="absolute inset-0 bg-black/15 transition-colors duration-300 group-hover:bg-black/25" />
        <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-[22px] font-bold uppercase tracking-[0.18em] text-white md:px-4 md:text-[28px] md:tracking-[0.2em]">
          Submit Exhibition
        </span>
      </Link>
    </article>
  );
}
