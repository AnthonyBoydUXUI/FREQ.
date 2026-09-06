import type { Metadata } from "next";
import { StudioDesk } from "@/ui/StudioDesk";

export const metadata: Metadata = {
  title: "Curator desk",
  description: "Inspect provenance, memory, and generative drafts. Nothing auto-publishes.",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return <StudioDesk />;
}
