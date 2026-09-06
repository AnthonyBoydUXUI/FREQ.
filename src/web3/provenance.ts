/**
 * Web3 applies only as provenance of the three drawings.
 * It does not apply as a wallet, a token gate, or an NFT gallery.
 */
export const WEB3_APPLIES = false;

export const provenance = {
  version: 1,
  applies: WEB3_APPLIES,
  purpose: "authorship-attestation",
  not: ["wallet-gate", "nft-gallery", "marketplace", "token-gated-entry"],
  chain: null as string | null,
  artworks: [
    {
      id: "armor",
      title: "Armor",
      archival: "/artworks/armor/archival.jpg",
      sha256: "7d5952ca75503f5c9f11020b118451ddf9c7296cca061ed3075f071377a11b0d",
    },
    {
      id: "facet",
      title: "Facet",
      archival: "/artworks/facet/archival.jpg",
      sha256: "da3a0698a6cd629d289f105acc5dbe85d732dca0488a0a95a1c58f8377567be9",
    },
    {
      id: "signal",
      title: "Signal",
      archival: "/artworks/signal/archival.jpg",
      sha256: "60a1dcfc8dafdab0e5cb1091b9c7be3423e69c782a77910a2a084bd08e993d2a",
    },
  ],
} as const;
