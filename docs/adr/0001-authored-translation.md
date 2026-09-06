# ADR 0001 — Authored translation, not generic 3D replacement

## Decision

The armor drawing is never replaced by a stock helmet or robot model. Depth, panels, and the interior nave are derived from the photograph: UV-mapped geometry, luminance depth, sampled graphite points, and authored semantic polygons.

## Why

The thesis is: a hand-drawn line already contains a world. A generic GLB would break recognizability and authorship.

## Consequences

Hero geometry is lighter and more faithful, but less “model-like.” High-resolution original scans will immediately improve the same pipeline.
