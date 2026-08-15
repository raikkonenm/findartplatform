import Image from "next/image";
import Link from "next/link";
import type { EditorialArtist } from "@/data/editorial";

export function EditorialCard({
  artist,
  eager = false,
}: {
  artist: EditorialArtist;
  eager?: boolean;
}) {
  return (
    <article className="group min-w-0">
      <Link href={`/editorial/${artist.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
          <Image
            src={artist.coverImage.src}
            alt={`${artist.artistName} editorial portrait`}
            fill
            className="object-cover"
            priority={eager}
            {...(eager
              ? { fetchPriority: "high" as const }
              : { loading: "lazy" as const })}
            unoptimized
            sizes="(min-width: 1024px) 31vw, (min-width: 768px) 47vw, 100vw"
          />
        </div>
        <div className="pt-5">
          <h2 className="editorial-serif break-words text-[clamp(0.9rem,4vw,1.3rem)] leading-[1.08] tracking-[-0.035em] md:text-[2rem] md:leading-[1.04]">
            {artist.artistName.toUpperCase()}
          </h2>
          <p className="mt-3 truncate text-[0.85em] leading-6 text-neutral-500">
            {artist.excerpt}
          </p>
        </div>
      </Link>
    </article>
  );
}
