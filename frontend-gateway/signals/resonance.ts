import { signal } from "@preact/signals";

export type ResonanceMode = "light" | "deep" | "cinematic";

export const resonanceModeSignal = signal<ResonanceMode>("light");
export const ambientGlowColorSignal = signal<string | null>(null);

// Global actions to transition resonance
export const setResonanceMode = (mode: ResonanceMode) => {
  resonanceModeSignal.value = mode;
};

export const setAmbientGlow = (hex: string | null) => {
  ambientGlowColorSignal.value = hex;
};
