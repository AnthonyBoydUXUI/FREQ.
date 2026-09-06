import type { ArtworkId, RegionId } from "@/engine/types";
import { dailySeed, seedUnit } from "@/engine/dailySeed";
import { regionsFor, portalFor } from "@/content/artworks";

export type DailyWeather = "held" | "open" | "grain";

export type DailyState = {
  artworkId: ArtworkId;
  day: string;
  seed: number;
  aliveRegionId: RegionId;
  openness: number;
  weather: DailyWeather;
  caption: string;
};

const WEATHER: DailyWeather[] = ["held", "open", "grain"];

export function dailyState(
  artworkId: ArtworkId,
  date: Date = new Date(),
): DailyState {
  const seed = dailySeed(artworkId, date);
  const regions = regionsFor(artworkId);
  const alive = regions[Math.floor(seedUnit(seed, 0) * regions.length)] ?? portalFor(artworkId);
  const weather = WEATHER[Math.floor(seedUnit(seed, 2) * WEATHER.length)];
  const openness = 0.02 + seedUnit(seed, 1) * 0.07;
  const day = date.toISOString().slice(0, 10);
  return {
    artworkId,
    day,
    seed,
    aliveRegionId: alive.id,
    openness,
    weather,
    caption: captionForDaily(alive.label, weather),
  };
}

export function captionForDaily(label: string, weather: DailyWeather): string {
  const mark = label.toLowerCase();
  if (weather === "open") {
    return `Today a little more open at the ${mark}.`;
  }
  if (weather === "grain") {
    return `Today more grain at the ${mark}.`;
  }
  return `Today the mark that wants attention is the ${mark}.`;
}
