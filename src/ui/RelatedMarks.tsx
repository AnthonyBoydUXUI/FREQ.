"use client";

import Link from "next/link";
import { artworks } from "@/content/artworks";
import { useEngine } from "@/engine/store";
import { isImmersed } from "@/engine/phases";

export function RelatedMarks() {
  const phase = useEngine((s) => s.phase);
  const hidden = isImmersed(phase) || phase === "return" || phase === "touch";
  const related = artworks.filter((artwork) => !artwork.hero);

  return (
    <aside className="related-marks" data-hidden={hidden ? "true" : "false"} aria-label="The other two drawings">
      {related.map((artwork) => (
        <Link
          key={artwork.id}
          className="related-mark"
          href={`/journey#${artwork.id}`}
          data-id={artwork.id}
          aria-label={`${artwork.title}. Another original drawing. Opens on the journey.`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artwork.paths.display}
            alt={artwork.alt}
            width={artwork.width}
            height={artwork.height}
          />
          <span>
            {artwork.title}
            <em>Another drawing</em>
          </span>
        </Link>
      ))}
    </aside>
  );
}
