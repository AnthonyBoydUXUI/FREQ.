import type { Metadata } from "next";
import Link from "next/link";
import { artworks, regions } from "@/content/artworks";

export const metadata: Metadata = {
  title: "Accessible journey",
  description:
    "An accessible path through FREQ.: the three source drawings, the cowl transformation, and the world inside the mark.",
};

export default function JourneyPage() {
  return (
    <main className="journey">
      <header>
        <p className="kicker">Accessible journey</p>
        <h1>FREQ.</h1>
        <p className="lede">
          The artwork is the interface. This path keeps the same meaning without
          requiring motion, spatial audio, or a 3D field. Armor is the drawing
          you meet on the installation. Facet and Signal, the other two original
          drawings, wait here as related territories. You can still follow the
          helmet into architecture and return to the original mark.
        </p>
        <nav className="journey-nav" aria-label="Journey">
          <Link href="/">Open the installation</Link>
          <a href="#territories">Territories</a>
          <a href="#transformation">Transformation</a>
          <a href="#sound">Sound</a>
        </nav>
      </header>

      <section id="territories" className="territories">
        {artworks.map((artwork) => (
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
              {artwork.hero
                ? "The first public territory, and the drawing on the installation. An armored form on wrinkled tracing paper. Touch that sheet to open the world inside the vaulted cowl. The plates are structure. The forward node is a threshold."
                : "The other original drawing in this universe. Present here as a related territory. It is not yet opened as a world. Return to the installation to enter through Armor."}
            </p>
          </article>
        ))}
      </section>

      <section id="transformation">
        <h2>The cowl opens</h2>
        <p>
          In the installation, touch the Armor drawing. The vaulted cowl lifts
          from the paper. A wound opens in the sheet. The camera enters that
          mark. Floor, walls, and vault are unfolded strips of the same
          photograph — wrinkles, graphite, tape, and unfinished lines at
          architectural scale. The original cowl waits at the far end.
          Returning collapses the world back into the drawing.
        </p>
        <ol className="sequence">
          <li>Still drawing</li>
          <li>A mark responds</li>
          <li>Graphite separates from paper</li>
          <li>The helmet lifts</li>
          <li>The sheet opens</li>
          <li>The visitor is inside the drawing</li>
          <li>The world returns to the mark</li>
        </ol>
        <h3>Regions</h3>
        <ul>
          {regions.map((region) => (
            <li key={region.id}>
              <strong>{region.label}.</strong> {region.meaning} {region.sonic}
            </li>
          ))}
        </ul>
      </section>

      <section id="sound">
        <h2>Sound as architecture</h2>
        <p>
          Sound is not a soundtrack. Graphite friction belongs to the paper.
          A low drone belongs to the interior. Metallic tension belongs to the
          opening of the helmet. Silence is also part of the work. Every control
          that appears — mute, volume, captions — is functional.
        </p>
        <p>
          <Link href="/">Return to the drawing</Link>
        </p>
      </section>
    </main>
  );
}
