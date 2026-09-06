import type { Metadata } from "next";
import { VrStage } from "@/vr/VrStage";

export const metadata: Metadata = {
  title: "VR",
  description: "Enter the world inside the drawing, seated or in WebXR.",
};

export default function VrPage() {
  return <VrStage />;
}
