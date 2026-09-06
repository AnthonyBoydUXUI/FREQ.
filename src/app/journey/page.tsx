import type { Metadata } from "next";
import Link from "next/link";
import { artworks, regionsFor, portalFor } from "@/content/artworks";
import { worldGraph, worldTitle } from "@/content/worldGraph";

export const metadata: Metadata = {
  title: "Accessible journey",
  description:
    "An accessible path through FREQ.: three source drawings, three transformations, and the worlds inside the marks.",
};

export default function JourneyPage() {
  return (
    <main className="journey">
      <header>
        <p className="kicker">Accessible journey</p>
        <h1>FREQ.</h1>
        <p className="lede">
          The artwork is the interface. This path keeps the same meaning without
          requiring motion, spatial audio, or a 3D field. Armor, Facet, and Signal
          are the three original drawings. Each has a door in a mark. Touching
          that door opens a world unfolded from the same photograph.
        </p>
        <nav className="journey-nav" aria-label="Journey">
          <Link href="/">Open Armor</Link>
          <Link href="/t/facet">Open Facet</Link>
          <Link href="/t/signal">Open Signal</Link>
          <a href="#territories">Territories</a>
          <a href="#graph">Graph</a>
          <a href="#sound">Sound</a>
        </nav>
      </header>

      <section id="territories" className="territories">
        {artworks.map((artwork) => {
          const portal = portalFor(artwork.id);
          const regions = regionsFor(artwork.id);
          return (
            <article className="territory" key={artwork.id} id={artwork.id}>
              <h2>{artwork.title}</h2>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artwork.paths.archival}
                alt={artwork.alt}
                width={artwork.width}
                height={artwork.height}
              />
              <p>
                The door is the {portal.label.toLowerCase()}. Inside is the{" "}
                {worldTitle(artwork.id)}, unfolded from this sheet.{" "}
                <Link href={artwork.id === "armor" ? "/" : `/t/${artwork.id}`}>
                  Open {artwork.title}
                </Link>
                .
              </p>
              <ul>
                {regions.map((region) => (
                  <li key={region.id}>
                    <strong>{region.label}.</strong> {region.meaning} {region.sonic}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      <section id="transformation">
        <h2>A mark opens</h2>
        <p>
          Touch a drawing. The portal region lifts from the paper. A wound opens
          in the sheet. The camera enters that mark. Floor, walls, and vault are
          unfolded strips of the same photograph — wrinkles, graphite, tape, and
          unfinished lines at architectural scale. The original mark waits at the
          far end. Touching it travels to the next drawing. Returning collapses
          the world back into this sheet.
        </p>
        <ol className="sequence">
          <li>Still drawing</li>
          <li>A mark responds</li>
          <li>Graphite separates from paper</li>
          <li>The portal lifts</li>
          <li>The sheet opens</li>
          <li>The visitor is inside the drawing</li>
          <li>The far mark leads onward, or the world returns</li>
        </ol>
      </section>

      <section id="graph">
        <h2>Experience graph</h2>
        <p>
          Three territories, each with an encounter and a world. Armor opens to
          Facet. Facet opens to Signal. Signal returns to Armor.
        </p>
        <ul>
          {worldGraph.edges
            .filter((edge) => edge.transition !== "collapse")
            .map((edge) => (
              <li key={`${edge.from}-${edge.to}`}>
                {edge.from} → {edge.to} via {edge.via}
              </li>
            ))}
        </ul>
      </section>

      <section id="sound">
        <h2>Sound as architecture</h2>
        <p>
          Sound is not a soundtrack. Graphite friction belongs to the paper.
          A low drone belongs to the interior. Metallic tension belongs to the
          opening of the portal. Silence is also part of the work. Every control
          that appears — mute, volume, captions — is functional.
        </p>
        <p className="journey-more">
          <Link href="/ar">Paper in the room (AR)</Link>
          <Link href="/vr">Seated world (VR)</Link>
          <Link href="/studio">Curator desk</Link>
          <Link href="/">Return to Armor</Link>
        </p>
      </section>
    </main>
  );
}
