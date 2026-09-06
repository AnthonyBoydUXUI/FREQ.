import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FreqStage } from "@/ui/FreqStage";
import { artworkById } from "@/content/artworks";
import { parseArtworkParam } from "@/content/worldGraph";

type Props = { params: Promise<{ artworkId: string }> };

export async function generateStaticParams() {
  return [{ artworkId: "armor" }, { artworkId: "facet" }, { artworkId: "signal" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { artworkId } = await params;
  const id = parseArtworkParam(artworkId);
  if (!id) return { title: "Territory" };
  return {
    title: artworkById[id].title,
    description: `Open the ${artworkById[id].title} drawing. The drawing is the interface.`,
  };
}

export default async function TerritoryPage({ params }: Props) {
  const { artworkId } = await params;
  const id = parseArtworkParam(artworkId);
  if (!id) notFound();
  return <FreqStage artworkId={id} />;
}
