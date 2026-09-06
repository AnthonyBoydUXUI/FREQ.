import type { Metadata } from "next";
import Link from "next/link";
import { artworks, regionsFor, portalFor } from "@/content/artworks";
import { worldTitle } from "@/content/worldGraph";

export const metadata: Metadata = {
  title: "Read it instead",
  description:
    "A still path through FREQ.: three drawings you can look at, and what happens when you touch them.",
};

export default function JourneyPage() {
  return (
    <main className="journey">
      <header>
        <p className="kicker">Read this as a page</p>
        <h1>FREQ.</h1>
        <p className="lede">
          There are three pictures. Touch a picture and you go inside it. Slide to
          look around. Press Go back when you want the picture again. The small
          pictures on the sides are two more drawings — touch those too. Sound,
          captions, and this page live in the corners of the picture. You do not
          need a headset, and you do not need to know anything about art. If the
          moving picture is too much, stay here and look with your eyes.
        </p>
        <nav className="journey-nav" aria-label="Pictures">
          <Link href="/">Touch Armor</Link>
          <Link href="/t/facet">Touch Facet</Link>
          <Link href="/t/signal">Touch Signal</Link>
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
                Touch this picture. The {portal.label.toLowerCase()} is the part
                that opens. Inside is the {worldTitle(artwork.id)} — still this
                same sheet of paper, only larger.{" "}
                <Link href={artwork.id === "armor" ? "/" : `/t/${artwork.id}`}>
                  Touch {artwork.title}
                </Link>
                .
              </p>
              <ul>
                {regions.map((region) => (
                  <li key={region.id}>
                    <strong>{region.label}.</strong> {region.meaning}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      <section id="how">
        <h2>What you can do</h2>
        <ol className="sequence">
          <li>Touch the big picture to go inside.</li>
          <li>The picture opens. Wait for it.</li>
          <li>Slide to look around.</li>
          <li>Press Go back to see the picture again.</li>
          <li>Press Next picture when you are inside if you want another drawing.</li>
          <li>The small pictures on the sides are two more drawings. Touch those too.</li>
          <li>Turn sound on if you want to hear the paper. Show captions if you want the words.</li>
        </ol>
        <p>
          Sound is optional. Captions tell you what you would hear. Nothing here
          needs a wallet, a login, or a headset.
        </p>
      </section>

      <section id="more">
        <h2>If you want more</h2>
        <p className="journey-more">
          <Link href="/ar">Put the paper in the room</Link>
          <Link href="/vr">Sit and look around</Link>
          <Link href="/studio">For the person who looks after the work</Link>
          <Link href="/">Back to the picture</Link>
        </p>
      </section>
    </main>
  );
}
