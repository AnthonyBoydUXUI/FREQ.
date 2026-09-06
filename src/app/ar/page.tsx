import type { Metadata } from "next";
import { ArStage } from "@/ar/ArStage";

export const metadata: Metadata = {
  title: "AR",
  description: "Place the original drawing as paper in the room.",
};

export default function ArPage() {
  return <ArStage />;
}
