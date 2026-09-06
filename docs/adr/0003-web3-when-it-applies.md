# ADR 0003 — Devices now, Web3 when it applies

## Decision

FREQ. is one installation on phone, tablet, and desktop. Touch, safe areas, and camera distance adapt so the whole drawing stays in frame.

Web3 is reserved as provenance of the three source drawings. It does not apply as a wallet, a token gate, or an NFT gallery. `GET /api/provenance` publishes hashes. No wallet chrome ships until an approved authorship attestation exists.

## Why

The drawing is the interface on every device. A wallet would make the encounter about technology. On-chain record, if it ever happens, is to say these marks are the origin — not to sell them.

## Consequences

- Phone, tablet, and desktop share the same authored loop.
- Feature flag `web3` stays false.
- Connecting a chain, wallet, or marketplace needs a separate approval.
