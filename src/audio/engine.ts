import type { Phase } from "@/engine/types";

type StemGains = {
  paper: number;
  graphite: number;
  drone: number;
  metal: number;
  air: number;
};

const SILENCE: StemGains = {
  paper: 0,
  graphite: 0,
  drone: 0,
  metal: 0,
  air: 0,
};

export function stemGainsFor(
  phase: Phase,
  hover: boolean,
  pointerActive: boolean,
  transformation: number,
): StemGains {
  if (phase === "boot") return SILENCE;

  const base: StemGains = {
    paper: phase === "explore" ? 0.02 : 0.08,
    graphite: hover ? 0.12 : 0.03,
    drone: 0.02 + transformation * 0.28,
    metal: 0,
    air: transformation * 0.12,
  };

  if (pointerActive) {
    base.graphite += 0.05;
  }

  if (phase === "touch" || phase === "transform") {
    base.metal = 0.08 + transformation * 0.12;
    base.drone = 0.12 + transformation * 0.22;
    base.paper = 0.04;
  }

  if (phase === "enter" || phase === "explore") {
    base.air = 0.16;
    base.drone = 0.22;
    base.metal = 0.06;
    base.graphite = 0.04;
    base.paper = 0.03;
  }

  if (phase === "return") {
    base.metal = 0.1 * (1 - transformation);
    base.drone = 0.16;
    base.air = 0.08;
  }

  return base;
}

export function captionFor(
  phase: Phase,
  regionLabel: string | null,
  muted: boolean,
): string {
  if (muted) return "Sound is silent.";
  if (phase === "explore") {
    return "A low architectural tone. Air moving through paper space.";
  }
  if (phase === "transform" || phase === "enter" || phase === "touch") {
    return "Graphite gains weight. A metallic tension under the paper.";
  }
  if (regionLabel) {
    return `Near the ${regionLabel.toLowerCase()}. Dry graphite on paper.`;
  }
  return "Quiet. Paper. A faint grain of graphite.";
}

type StemName = keyof StemGains;

export class SpatialAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private stems = new Map<
    StemName,
    { source: AudioBufferSourceNode; gain: GainNode; panner: StereoPannerNode }
  >();
  private buffers = new Map<string, AudioBuffer>();
  private paths: Record<StemName, string>;
  private ready = false;

  constructor(paths: Record<StemName, string>) {
    this.paths = paths;
  }

  get context(): AudioContext | null {
    return this.ctx;
  }

  async unlock(): Promise<void> {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -18;
      this.compressor.ratio.value = 2.2;
      this.master.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
    if (!this.ready) {
      await this.loadAndStart();
      this.ready = true;
    }
  }

  setMaster(muted: boolean, volume: number) {
    if (!this.master) return;
    this.master.gain.setTargetAtTime(muted ? 0 : volume, this.ctx!.currentTime, 0.08);
  }

  setStems(gains: StemGains, panX: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    (Object.keys(gains) as StemName[]).forEach((name) => {
      const stem = this.stems.get(name);
      if (!stem) return;
      stem.gain.gain.setTargetAtTime(gains[name], now, 0.18);
      stem.panner.pan.setTargetAtTime(Math.max(-0.7, Math.min(0.7, panX)), now, 0.2);
    });
  }

  dispose() {
    this.stems.forEach((stem) => {
      try {
        stem.source.stop();
      } catch {
        // already stopped
      }
    });
    this.stems.clear();
    void this.ctx?.close();
    this.ctx = null;
    this.ready = false;
  }

  private async loadAndStart() {
    if (!this.ctx || !this.master) return;
    await Promise.all(
      (Object.keys(this.paths) as StemName[]).map(async (name) => {
        const buffer = await this.load(this.paths[name]);
        const source = this.ctx!.createBufferSource();
        const gain = this.ctx!.createGain();
        const panner = this.ctx!.createStereoPanner();
        gain.gain.value = 0;
        source.buffer = buffer;
        source.loop = true;
        source.connect(panner);
        panner.connect(gain);
        gain.connect(this.master!);
        source.start();
        this.stems.set(name, { source, gain, panner });
      }),
    );
  }

  private async load(url: string): Promise<AudioBuffer> {
    const cached = this.buffers.get(url);
    if (cached) return cached;
    const response = await fetch(url);
    const raw = await response.arrayBuffer();
    const buffer = await this.ctx!.decodeAudioData(raw.slice(0));
    this.buffers.set(url, buffer);
    return buffer;
  }
}
