import { signal } from "@preact/signals";

export const isMenuOpenSignal = signal(false);
export const isCaptureOpenSignal = signal(false);
export const isProfileOpenSignal = signal(false);

export function toggleMenu() {
  isMenuOpenSignal.value = !isMenuOpenSignal.value;
}

export function closeMenu() {
  isMenuOpenSignal.value = false;
}

export function toggleCapture() {
  isCaptureOpenSignal.value = !isCaptureOpenSignal.value;
}

export function toggleProfile() {
  isProfileOpenSignal.value = !isProfileOpenSignal.value;
}
