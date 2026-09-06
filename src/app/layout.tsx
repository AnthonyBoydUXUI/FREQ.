import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans",
});

const serif = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-serif",
});

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://freq-two.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "FREQ.",
    template: "%s — FREQ.",
  },
  description:
    "A living spatial digital installation born from three original hand drawings. The drawing is the interface.",
  applicationName: "FREQ.",
  openGraph: {
    title: "FREQ.",
    description:
      "A living spatial digital installation born from three original hand drawings.",
    images: ["/artworks/armor/display.webp"],
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#e8e0d4",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <a className="skip-link" href="/journey">
          Skip to accessible journey
        </a>
        {children}
      </body>
    </html>
  );
}
