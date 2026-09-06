export const featureFlags = {
  supabase: false,
  ar: false,
  vr: false,
  generativePublish: false,
  curator: false,
  crossDrawingPortals: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;
