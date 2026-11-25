import { signal } from "@preact/signals";

export interface LinkMetadata {
  title: string;
  description: string;
  image?: string;
  url: string;
  source: string;
  favicon?: string;
  type: "article" | "image" | "video" | "document" | "unknown";
}

export interface SynthesisState {
  parsedLink: LinkMetadata | null;
  isLoading: boolean;
  error: string | null;
  selectedRoom: string | null;
  createNewRoom: boolean;
}

const initialState: SynthesisState = {
  parsedLink: null,
  isLoading: false,
  error: null,
  selectedRoom: null,
  createNewRoom: false,
};

export const synthesisSignal = signal<SynthesisState>(initialState);

export const parseLink = async (url: string) => {
  synthesisSignal.value = {
    ...synthesisSignal.value,
    isLoading: true,
    error: null,
  };

  try {
    const response = await fetch("/api/synthesis/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) throw new Error("Failed to parse link");

    const data: LinkMetadata = await response.json();

    synthesisSignal.value = {
      ...synthesisSignal.value,
      parsedLink: data,
      isLoading: false,
    };
  } catch (err) {
    synthesisSignal.value = {
      ...synthesisSignal.value,
      error: err instanceof Error ? err.message : "Unknown error",
      isLoading: false,
    };
  }
};

export const createArtifactFromLink = async (
  linkMetadata: LinkMetadata,
  roomId?: string,
) => {
  synthesisSignal.value = {
    ...synthesisSignal.value,
    isLoading: true,
    error: null,
  };

  try {
    const response = await fetch("/api/synthesis/create-artifact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metadata: linkMetadata,
        roomId,
      }),
    });

    if (!response.ok) throw new Error("Failed to create artifact");

    const artifact = await response.json();

    synthesisSignal.value = {
      ...synthesisSignal.value,
      parsedLink: null,
      isLoading: false,
    };

    return artifact;
  } catch (err) {
    synthesisSignal.value = {
      ...synthesisSignal.value,
      error: err instanceof Error ? err.message : "Unknown error",
      isLoading: false,
    };
    throw err;
  }
};

export const resetSynthesis = () => {
  synthesisSignal.value = initialState;
};
