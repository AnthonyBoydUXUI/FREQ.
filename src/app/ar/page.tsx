import type { Metadata } from "next";
import { ArStage } from "@/ar/ArStage";

export const metadata: Metadata = {
  title: "Look around you",
  description:
    "Open the camera so the original drawing sits in the room as a sheet of paper.",
};

export default function ArPage() {
  return <ArStage />;
}
