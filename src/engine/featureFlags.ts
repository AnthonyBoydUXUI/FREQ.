export const featureFlags = {
  supabase: false,
  ar: true,
  vr: true,
  web3: false,
  generativePublish: false,
  curator: true,
  crossDrawingPortals: true,
} as const;

export type FeatureFlag = keyof typeof featureFlags;
