import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FREQ.",
    short_name: "FREQ.",
    description: "A spatial installation born from three original hand drawings.",
    start_url: "/",
    display: "standalone",
    background_color: "#e8e0d4",
    theme_color: "#e8e0d4",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
