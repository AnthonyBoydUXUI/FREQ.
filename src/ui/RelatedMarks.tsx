"use client";

import Link from "next/link";
import { artworks } from "@/content/artworks";
import type { ArtworkId } from "@/engine/types";
import { useEngine } from "@/engine/store";
import { isImmersed } from "@/engine/phases";

export function RelatedMarks({ currentId }: { currentId?: ArtworkId }) {
  const phase = useEngine((s) => s.phase);
  const storeId = useEngine((s) => s.artworkId);
  const current = currentId ?? storeId;
  const hidden = isImmersed(phase) || phase === "return" || phase === "touch";
  const related = artworks.filter((artwork) => artwork.id !== current);

  return (
    <aside className="related-marks" data-hidden={hidden ? "true" : "false"} aria-label="The other two drawings">
      {related.map((artwork) => (
        <Link
          key={artwork.id}
          className="related-mark"
          href={artwork.id === "armor" ? "/" : `/t/${artwork.id}`}
          data-id={artwork.id}
          aria-label={`${artwork.title}. Another original drawing. Open this territory.`}
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
            <em>Open this drawing</em>
          </span>
        </Link>
      ))}
    </aside>
  );
}
