#!/usr/bin/env python3
"""Preserve source drawings and derive authored digital states.

Does not replace the drawings with generated imagery. Outputs:
  - archival JPEG (faithful copy)
  - display WebP
  - luminance / depth / linework / paper layers
  - semantic region masks
  - sampled graphite stroke points for the interior world
"""

from __future__ import annotations

import json
import math
import wave
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "source"
PUBLIC = ROOT / "public" / "artworks"
GENERATED = ROOT / "src" / "content" / "generated"

ARTWORKS = {
    "armor": {
        "source": "614e0edf-c713-426c-9465-3c11919fd218.jpg",
        "title": "Armor",
        "hero": True,
    },
    "facet": {
        "source": "d39e45db-e775-420e-8bac-91e1526f6232.jpg",
        "title": "Facet",
        "hero": False,
    },
    "signal": {
        "source": "28d0ab8a-1f8a-41ce-adbb-4c53295da71e.jpg",
        "title": "Signal",
        "hero": False,
    },
}

def rot90cw_uv(polygon: list[tuple[float, float]]) -> list[tuple[float, float]]:
    """Map landscape UVs into EXIF orientation-6 space: (u, v) -> (1 - v, u)."""
    return [(1.0 - v, u) for u, v in polygon]


# Authored against the sideways camera pixels, then rotated with the drawing.
# After EXIF-6 (90° CW), the landscape "forward" (rounded left form) is the helmet at the top.
LANDSCAPE_FORWARD = [
    (0.04, 0.38),
    (0.28, 0.32),
    (0.36, 0.48),
    (0.30, 0.72),
    (0.08, 0.78),
    (0.02, 0.58),
]
LANDSCAPE_PLATES = [
    (0.28, 0.28),
    (0.48, 0.22),
    (0.62, 0.32),
    (0.58, 0.58),
    (0.38, 0.68),
    (0.24, 0.52),
]
LANDSCAPE_VAULT = [
    (0.42, 0.08),
    (0.62, 0.06),
    (0.78, 0.14),
    (0.86, 0.28),
    (0.74, 0.42),
    (0.52, 0.40),
    (0.40, 0.26),
]

ARMOR_REGIONS = {
    "cowl": {
        "label": "Cowl",
        "role": "helmet",
        "polygon": rot90cw_uv(LANDSCAPE_FORWARD),
        "color": (214, 196, 164, 90),
    },
    "plates": {
        "label": "Plates",
        "role": "structure",
        "polygon": rot90cw_uv(LANDSCAPE_PLATES),
        "color": (160, 150, 138, 90),
    },
    "forward": {
        "label": "Forward node",
        "role": "threshold",
        "polygon": rot90cw_uv(LANDSCAPE_VAULT),
        "color": (120, 118, 112, 90),
    },
}

# Facet and Signal photographs are already upright. Authored against portrait pixels.
FACET_REGIONS = {
    "visor": {
        "label": "Visor",
        "role": "helmet",
        "polygon": [
            (0.40, 0.18),
            (0.68, 0.16),
            (0.80, 0.28),
            (0.76, 0.46),
            (0.52, 0.50),
            (0.36, 0.34),
        ],
        "color": (214, 196, 164, 90),
    },
    "horns": {
        "label": "Horns",
        "role": "structure",
        "polygon": [
            (0.34, 0.06),
            (0.58, 0.04),
            (0.70, 0.14),
            (0.62, 0.22),
            (0.40, 0.22),
            (0.30, 0.12),
        ],
        "color": (160, 150, 138, 90),
    },
    "harness": {
        "label": "Harness",
        "role": "threshold",
        "polygon": [
            (0.16, 0.50),
            (0.50, 0.46),
            (0.64, 0.58),
            (0.58, 0.88),
            (0.20, 0.90),
            (0.10, 0.68),
        ],
        "color": (120, 118, 112, 90),
    },
}

SIGNAL_REGIONS = {
    "crown": {
        "label": "Crown",
        "role": "helmet",
        "polygon": [
            (0.10, 0.02),
            (0.36, 0.00),
            (0.40, 0.14),
            (0.28, 0.24),
            (0.08, 0.20),
            (0.06, 0.08),
        ],
        "color": (214, 196, 164, 90),
    },
    "mask": {
        "label": "Mask",
        "role": "structure",
        "polygon": [
            (0.30, 0.26),
            (0.62, 0.24),
            (0.78, 0.38),
            (0.74, 0.56),
            (0.44, 0.58),
            (0.26, 0.42),
        ],
        "color": (160, 150, 138, 90),
    },
    "strap": {
        "label": "Strap",
        "role": "threshold",
        "polygon": [
            (0.20, 0.54),
            (0.70, 0.50),
            (0.86, 0.64),
            (0.76, 0.86),
            (0.30, 0.88),
            (0.14, 0.70),
        ],
        "color": (120, 118, 112, 90),
    },
}

REGIONS_BY_ARTWORK = {
    "armor": ARMOR_REGIONS,
    "facet": FACET_REGIONS,
    "signal": SIGNAL_REGIONS,
}


def ensure_dirs() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    GENERATED.mkdir(parents=True, exist_ok=True)
    (ROOT / "public" / "audio").mkdir(parents=True, exist_ok=True)


def load_upright(path: Path) -> Image.Image:
    """Honor camera EXIF so drawings are stored and displayed right-side up."""
    with Image.open(path) as src:
        orientation = src.getexif().get(274, 1) if src.getexif() else 1
        transposed = ImageOps.exif_transpose(src)
        image = (transposed or src).convert("RGB")
    if orientation not in (0, 1, None):
        image.save(path, quality=95, subsampling=0)
    return image


def luminance(arr: np.ndarray) -> np.ndarray:
    return (
        0.2126 * arr[:, :, 0] + 0.7152 * arr[:, :, 1] + 0.0722 * arr[:, :, 2]
    )


def save_gray(path: Path, gray: np.ndarray) -> None:
    Image.fromarray(np.clip(gray, 0, 255).astype(np.uint8), mode="L").save(path)


def process_drawing(artwork_id: str, meta: dict) -> dict:
    src_path = ASSETS / meta["source"]
    if not src_path.exists():
        raise FileNotFoundError(src_path)

    out_dir = PUBLIC / artwork_id
    out_dir.mkdir(parents=True, exist_ok=True)

    original = load_upright(src_path)
    original.save(out_dir / "archival.jpg", quality=95, subsampling=0)
    original.save(out_dir / "display.webp", quality=88, method=6)

    arr = np.array(original).astype(np.float32)
    lum = luminance(arr)

    # Depth: darker graphite recedes; paper stays near the surface.
    depth = 255.0 - lum
    depth = Image.fromarray(depth.astype(np.uint8), mode="L")
    depth = depth.filter(ImageFilter.GaussianBlur(radius=1.2))
    depth.save(out_dir / "depth.png")

    # Paper: low-frequency substrate, drawing suppressed.
    paper = Image.fromarray(arr.astype(np.uint8)).filter(
        ImageFilter.GaussianBlur(radius=8)
    )
    paper_arr = np.array(paper).astype(np.float32)
    paper_mix = paper_arr * 0.72 + 210.0 * 0.28
    Image.fromarray(np.clip(paper_mix, 0, 255).astype(np.uint8)).save(
        out_dir / "paper.jpg", quality=90
    )

    # Linework: high-pass isolation of marks.
    blurred = Image.fromarray(lum.astype(np.uint8), mode="L").filter(
        ImageFilter.GaussianBlur(radius=2.4)
    )
    highpass = lum - np.array(blurred).astype(np.float32)
    line = np.clip(128 - highpass * 2.6, 0, 255)
    save_gray(out_dir / "linework.png", line)

    # Shadow plate: denser graphite as a separate layer.
    shadow = np.clip((140.0 - lum) * 2.2, 0, 255)
    save_gray(out_dir / "shadows.png", shadow)

    strokes = sample_strokes(lum)

    result = {
        "id": artwork_id,
        "title": meta["title"],
        "hero": meta["hero"],
        "sourceFile": meta["source"],
        "width": original.width,
        "height": original.height,
        "paths": {
            "archival": f"/artworks/{artwork_id}/archival.jpg",
            "display": f"/artworks/{artwork_id}/display.webp",
            "depth": f"/artworks/{artwork_id}/depth.png",
            "paper": f"/artworks/{artwork_id}/paper.jpg",
            "linework": f"/artworks/{artwork_id}/linework.png",
            "shadows": f"/artworks/{artwork_id}/shadows.png",
        },
        "strokeCount": len(strokes),
    }

    (out_dir / "strokes.json").write_text(json.dumps(strokes))
    return result, strokes


def sample_strokes(lum: np.ndarray, count: int = 360) -> list[dict]:
    h, w = lum.shape
    dark = lum < 118
    ys, xs = np.where(dark)
    if len(xs) == 0:
        return []
    rng = np.random.default_rng(19)
    idx = rng.choice(len(xs), size=min(count, len(xs)), replace=False)
    points = []
    for i in idx:
        x = xs[i] / (w - 1)
        y = ys[i] / (h - 1)
        density = 1.0 - float(lum[ys[i], xs[i]] / 255.0)
        points.append(
            {
                "x": round(float(x), 4),
                "y": round(float(y), 4),
                "d": round(density, 3),
            }
        )
    return points


def draw_region_masks(artwork_id: str, width: int, height: int) -> dict:
    out_dir = PUBLIC / artwork_id
    atlas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    atlas_draw = ImageDraw.Draw(atlas, "RGBA")
    masks = {}

    for region_id, region in REGIONS_BY_ARTWORK[artwork_id].items():
        mask = Image.new("L", (width, height), 0)
        draw = ImageDraw.Draw(mask)
        pts = [(x * (width - 1), y * (height - 1)) for x, y in region["polygon"]]
        draw.polygon(pts, fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(radius=1.4))
        mask.save(out_dir / f"mask-{region_id}.png")
        atlas_draw.polygon(pts, fill=region["color"])
        masks[region_id] = {
            "id": region_id,
            "label": region["label"],
            "role": region["role"],
            "polygon": region["polygon"],
            "mask": f"/artworks/{artwork_id}/mask-{region_id}.png",
        }

    atlas.convert("RGB").save(out_dir / "regions-preview.jpg", quality=88)
    return masks


def write_wav(path: Path, samples: np.ndarray, rate: int = 44100) -> None:
    samples = np.clip(samples, -1.0, 1.0)
    pcm = (samples * 32767.0).astype(np.int16)
    with wave.open(str(path), "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(rate)
        wf.writeframes(pcm.tobytes())


def generate_audio() -> dict:
    rate = 44100
    out = ROOT / "public" / "audio"
    rng = np.random.default_rng(7)

    t = np.linspace(0, 6.0, int(rate * 6.0), endpoint=False)

    # Graphite friction: dry granular noise, band-limited.
    noise = rng.normal(0, 1, t.shape)
    kernel = np.exp(-np.linspace(0, 8, 240))
    graphite = np.convolve(noise, kernel, mode="same")
    graphite *= 0.18 * (0.7 + 0.3 * np.sin(2 * math.pi * 3.1 * t))
    write_wav(out / "graphite.wav", fade(graphite, rate))

    # Paper: slower rustle.
    rustle = np.convolve(rng.normal(0, 1, t.shape), np.ones(900) / 900, mode="same")
    rustle *= 0.12
    write_wav(out / "paper.wav", fade(rustle, rate))

    # Low architectural drone from stacked sines (not a trailer hit).
    drone = (
        0.18 * np.sin(2 * math.pi * 55 * t)
        + 0.08 * np.sin(2 * math.pi * 82.5 * t)
        + 0.04 * np.sin(2 * math.pi * 110 * t + 0.4)
    )
    drone *= 0.55 + 0.45 * np.sin(2 * math.pi * 0.07 * t)
    write_wav(out / "drone.wav", fade(drone, rate))

    # Metallic tension: inharmonic partials.
    metal = (
        0.08 * np.sin(2 * math.pi * 311 * t)
        + 0.05 * np.sin(2 * math.pi * 523 * t + 0.2)
        + 0.03 * np.sin(2 * math.pi * 739 * t + 1.1)
    )
    metal *= np.exp(-0.15 * (t % 2.5))
    write_wav(out / "metal.wav", fade(metal, rate, 0.08))

    # Air / space: very quiet high dust.
    air = np.convolve(rng.normal(0, 1, t.shape), np.ones(60) / 60, mode="same")
    air *= 0.04
    write_wav(out / "air.wav", fade(air, rate))

    return {
        "graphite": "/audio/graphite.wav",
        "paper": "/audio/paper.wav",
        "drone": "/audio/drone.wav",
        "metal": "/audio/metal.wav",
        "air": "/audio/air.wav",
    }


def fade(samples: np.ndarray, rate: int, seconds: float = 0.12) -> np.ndarray:
    n = int(rate * seconds)
    if n <= 0 or n * 2 >= len(samples):
        return samples
    ramp = np.linspace(0, 1, n)
    samples = samples.copy()
    samples[:n] *= ramp
    samples[-n:] *= ramp[::-1]
    return samples


def main() -> None:
    ensure_dirs()
    catalog = []

    for artwork_id, meta in ARTWORKS.items():
        info, strokes = process_drawing(artwork_id, meta)
        info["regions"] = draw_region_masks(artwork_id, info["width"], info["height"])
        catalog.append(info)
        (GENERATED / f"{artwork_id}-strokes.json").write_text(json.dumps(strokes))

    audio = generate_audio()
    payload = {
        "version": 2,
        "heroArtworkId": "armor",
        "artworks": catalog,
        "audio": audio,
        "notes": "Source photographs are camera captures with EXIF rotation baked so pixels are upright. Replace archival sources with original scans (same filenames) and re-run this script.",
    }
    (GENERATED / "catalog.json").write_text(json.dumps(payload, indent=2))
    print(json.dumps({k: v for k, v in payload.items() if k != "artworks"}, indent=2))
    print("artworks", [a["id"] for a in catalog])
    print("regions", {a["id"]: list(a["regions"].keys()) for a in catalog})


if __name__ == "__main__":
    main()
