import { computed, signal } from "@preact/signals";

export type SystemStatus =
  | "Idle"
  | "Analyzing"
  | "Synthesizing"
  | "Broadcasting"
  | "Calibrating";

export interface IntelligenceState {
  status: SystemStatus;
  nodeCount: number;
  uptime: string;
  activeNeurons: number;
  lastPatternFound?: string;
  ledgerConnection: "Connected" | "Disconnected" | "Syncing";
}

export const intelligenceSignal = signal<IntelligenceState>({
  status: "Idle",
  nodeCount: 12,
  uptime: "99.9%",
  activeNeurons: 1240,
  ledgerConnection: "Connected",
});

export const systemPulse = computed(() => {
  const status = intelligenceSignal.value.status;
  if (status === "Idle") return "bg-gray-500";
  if (status === "Analyzing") return "bg-cyan-500 animate-pulse";
  if (status === "Synthesizing") return "bg-indigo-500 animate-pulse";
  if (status === "Broadcasting") return "bg-emerald-500 animate-pulse";
  return "bg-amber-500 animate-bounce";
});

export function setSystemStatus(status: SystemStatus) {
  intelligenceSignal.value = { ...intelligenceSignal.value, status };
}

export function updateActiveNeurons(count: number) {
  intelligenceSignal.value = {
    ...intelligenceSignal.value,
    activeNeurons: count,
  };
}
