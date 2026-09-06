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
          requiring motion, spatial audio, or a 3D field. You can still meet the
          drawings, follow the helmet into architecture, and return to the original
          mark.
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
          <article className="territory" key={artwork.id}>
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
                ? "The first public territory. An armored form on wrinkled tracing paper. The vaulted cowl is the portal. The plates are structure. The forward node is a threshold."
                : "A related territory in the same universe. Present, not yet opened as a world."}
            </p>
          </article>
        ))}
      </section>

      <section id="transformation">
        <h2>The cowl opens</h2>
        <p>
          In the installation, attention on the vaulted upper form makes graphite
          gain a little depth. Selecting it lifts the helmet from the paper. The
          panels separate. The camera enters. Seams become a nave. Bolts become
          towers. The original drawing remains on the far wall, and returning
          collapses the world back into the mark.
        </p>
        <ol className="sequence">
          <li>Still drawing</li>
          <li>Helmet responds</li>
          <li>Graphite gains depth</li>
          <li>Helmet separates</li>
          <li>Panels open into architecture</li>
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
