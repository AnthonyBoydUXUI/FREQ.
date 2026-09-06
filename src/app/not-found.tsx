import Link from "next/link";

export default function NotFound() {
  return (
    <main className="journey">
      <p className="kicker">Missing</p>
      <h1>This mark is not here.</h1>
      <p className="lede">
        <Link href="/">Back to the picture</Link>
      </p>
    </main>
  );
}
