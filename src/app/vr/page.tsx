import type { Metadata } from "next";
import { VrStage } from "@/vr/VrStage";

export const metadata: Metadata = {
  title: "Sit and look around",
  description:
    "Go inside the world in the drawing. Slide to look around. A headset is optional.",
};

export default function VrPage() {
  return <VrStage />;
}
