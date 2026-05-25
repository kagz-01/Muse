# Muse UI Modernization – Full Implementation Plan

## Goal
Modernize the Muse platform UI by refactoring the dropdown menu, expanding the theme system to four named themes with a full custom HSL color picker, making the bottom navigation independent/sticky, and auditing all Settings tabs for ghost items.

---

## User Decisions (Confirmed)

| Decision | Choice |
|----------|--------|
| Theme names | Rename to: **Solar** (light), **Midnight** (dark), **Slate** (dim), **Glow** (tint) |
| Custom tab | Full HSL picker (hue strip + saturation + lightness sliders), matching room/thread creation |
| Navigation | Stays at **bottom** – made independent and sticky, not cutting content |
| Avatar | **Responsive** sizing (96px mobile → 128px desktop), **rounded** shape (visually appealing, not sharp-edged) |
| Dropdown items | Remove **Security & Ledger** and **Export Data** (already in Settings) |
| Profile display | Single display name only below avatar (no username/double names) |
| Settings audit | Full sweep – remove ghosts or make them functional |
| Styling stack | Pure Tailwind (no component library) |
| Accessibility | `prefers-reduced-motion` support for all new animations |

---

## Proposed Changes

---

### 1. Signal Layer – Theme & Custom Accent

#### [MODIFY] [ui.ts](file:///home/kagz03/VS%20Code/Muse/frontend-gateway/signals/ui.ts)

**Changes:**
- Add `customAccentHex` signal (string, default `""`) for arbitrary hex storage
- Add `setCustomAccentHex(hex: string)` function that:
  - Parses hex → RGB triplet
  - Sets `--muse-accent-rgb` CSS variable with the computed RGB
  - Persists to `muse-fresh-settings.appearance.customAccentHex`
- Update `initializeTheme()` to load saved `customAccentHex` and apply it if present
- Add `hslToHex()` utility (same as `CreateRoomModal.tsx`) for reuse
- Keep the existing `AppAccentColor` preset palette unchanged – custom hex is an **alternative** channel

---

### 2. Dropdown Menu Refactor

#### [MODIFY] [AppMenu.tsx](file:///home/kagz03/VS%20Code/Muse/frontend-gateway/islands/layout/AppMenu.tsx)

**Profile Head (lines 136–151):**
- Change avatar from `w-12 h-12` → responsive `w-24 h-24 md:w-32 md:h-32`
- Add rounded shape with subtle border glow: `rounded-2xl` with gradient border
- Remove username line (line 147–149) – show **only** display name
- Center the avatar block above the name instead of side-by-side layout

**Menu Items (lines 153–225):**
- **Delete** the `Security & Ledger` button (lines 188–205)
- **Delete** the `Export Data` button (lines 207–224)
- Keep `Profile` and `Settings` links

**System Resonance section (lines 227–258):**
- Replace the existing theme names in the dropdown with the four new labels:
  - Solar, Midnight, Slate, Glow
- Add a **"Custom +"** button that reveals a compact inline HSL picker (same pattern as `CreateRoomModal.tsx` lines 612–720):
  - Hue strip with gradient
  - Saturation slider
  - Lightness slider
  - Color preview swatch with hex code
- When custom color is active, apply via `setCustomAccentHex(hex)` from ui.ts
- When a preset swatch is clicked, clear custom hex and use `setAccentColor(color)` as before

---

### 3. Navigation Bar Independence

#### [MODIFY] [AppMenu.tsx](file:///home/kagz03/VS%20Code/Muse/frontend-gateway/islands/layout/AppMenu.tsx) – Bottom Nav (lines 59–102)

**Problem:** The fixed bottom nav overlaps scrollable content at the bottom of pages.

**Fix:**
- Add `pb-safe` to nav (already present) and ensure the nav has a solid `z-[60]` with no content bleeding
- The nav itself stays at bottom, fixed position – no structural change needed
- Update parent layout to add bottom padding equal to nav height (`pb-24 md:pb-20`) so content is never cut off

#### [MODIFY] Layout files

- Verify that all page containers have `pb-24` bottom padding to account for the 80px (`h-20`) nav bar
- Grep for `pb-24` usage and ensure consistency across all routes

---

### 4. Settings – Theme Expansion & Custom Color Picker

#### [MODIFY] [Settings.tsx](file:///home/kagz03/VS%20Code/Muse/frontend-gateway/islands/settings/Settings.tsx)

**AppearanceSettings type (lines 47–62):**
- Change `theme` type from `"dark" | "light" | "system"` → `"dark" | "light" | "dim" | "tint"`
- Add `customAccentHex?: string` field

**DEFAULT_APPEARANCE (lines 81–88):**
- Set `theme: "dark"` (no more `"system"` default)
- Add `customAccentHex: ""`

**THEME_OPTIONS (lines 164–174):**
- Replace the 3-option array with 4 themed options:
  ```tsx
  const THEME_OPTIONS = [
    { value: "dark", label: "Midnight", icon: SafeIcons.Moon },
    { value: "dim", label: "Slate", icon: SafeIcons.CloudMoon },
    { value: "tint", label: "Glow", icon: SafeIcons.Sparkles },
    { value: "light", label: "Solar", icon: SafeIcons.Sun },
  ];
  ```

**Theme application effect (lines 996–1004):**
- Remove the `system` → media-query resolution branch
- Simply pass `appearance.theme` directly to `setTheme()`

**Accent section (lines 1882–1907):**
- Keep the preset swatches as-is
- Add a **"Custom"** toggle button below the swatches
- When active, reveal the same HSL picker UI used in `CreateRoomModal.tsx`:
  - Hue gradient strip + range input (0–360)
  - Saturation slider (0–100)
  - Lightness slider (0–100)
  - Live color preview swatch with hex code
- On change, call `setCustomAccentHex(hex)` from the signal layer
- When a preset swatch is clicked, deactivate custom mode

---

### 5. Settings Ghost-Item Audit

#### [MODIFY] [Settings.tsx](file:///home/kagz03/VS%20Code/Muse/frontend-gateway/islands/settings/Settings.tsx)

**Appearance tab (lines 1937–1976) – Toggle audit:**
| Toggle | Status | Action |
|--------|--------|--------|
| Compact Mode | **Ghost** – no implementation reads this value | Wire it: add `compactMode` to signal layer, apply `data-compact` attribute on `<html>` for CSS to consume, or **remove** |
| Animations | **Ghost** – not consumed anywhere | Wire it: respect in all animation classes via a CSS class toggle, or **remove** |
| Reduce Motion | **Ghost** – not consumed anywhere | Wire it: if enabled, add `[data-reduce-motion]` on `<html>` and respect in CSS, or **remove** |

> [!IMPORTANT]
> **Recommendation:** Keep these three toggles but wire them to work. They represent real UX features. We'll add CSS-level support:
> - `Compact Mode`: add `data-compact="true"` on `<html>`, define CSS rules that tighten padding/margins
> - `Animations`: toggle a `data-animations="false"` attribute that disables all `transition` and `animation` via CSS
> - `Reduce Motion`: same as browser `prefers-reduced-motion`, applied via `data-reduce-motion="true"`

**Notifications tab (lines 1980–2098):**
| Item | Status | Action |
|------|--------|--------|
| Email Notifications | Ghost – no backend | Keep toggle, add tooltip "Coming soon" |
| Push Notifications | Ghost – no backend | Keep toggle, add tooltip "Coming soon" |
| In-App Notifications | **Works** (NotificationContainer exists) | ✅ Keep |
| Notify on Reply/Like/Follow/Achievement | Ghost – no backend events | Keep toggles, add "Coming soon" badge |
| Weekly Digest | Ghost | Keep toggle, badge |
| Product Updates | Ghost | Keep toggle, badge |

**Privacy tab (lines 2101–2290):**
| Item | Status | Action |
|------|--------|--------|
| Account Visibility | Works (persisted to signal) | ✅ Keep |
| Show email on profile | Works | ✅ Keep |
| Allow search indexing | Works (persisted) | ✅ Keep |
| Two-Factor Auth | Ghost – no real 2FA | Keep, add "Coming soon" badge |
| Show profile/location/rooms/threads/insights | Works (togglePublicSetting) | ✅ Keep |
| Solo Mode | Works | ✅ Keep |

**Data tab (lines 2292–2384):**
| Item | Status | Action |
|------|--------|--------|
| Total data stored | Works | ✅ Keep |
| Export Format (JSON/CSV) | Works | ✅ Keep |
| Export Data | Works | ✅ Keep |
| Reset Preferences | Works | ✅ Keep |
| Delete All Data | Works | ✅ Keep |

**Timezone list (lines 186–870):**
- The timezone list contains hundreds of bogus entries (e.g., "America/Limyth", "America/Ludmillisinae"). 
- **Replace** with a clean, curated list of ~80 major IANA timezones using `Intl.supportedValuesOf('timeZone')` if available, with a fallback to a hardcoded clean list.

---

### 6. CSS Updates

#### [MODIFY] Global CSS

Add utility rules for the new data attributes:
```css
/* Compact mode */
[data-compact="true"] { --muse-spacing-scale: 0.75; }

/* Disable animations */
[data-animations="false"] * {
  animation-duration: 0s !important;
  transition-duration: 0s !important;
}

/* Reduce motion */
[data-reduce-motion="true"] *,
@media (prefers-reduced-motion: reduce) * {
  animation-duration: 0s !important;
  transition-duration: 0.01s !important;
}
```

---

## Verification Plan

### Automated
1. `deno task build` – must succeed with no type errors
2. Grep for remaining `"system"` theme references and eliminate
3. Grep for `Security & Ledger` / `Export Data` in AppMenu to confirm removal

### Manual
1. Open AppMenu drawer → verify avatar is large and responsive, only display name shown
2. Verify Security/Export Data entries are gone
3. Open Settings → Appearance → confirm 4 theme buttons (Midnight, Slate, Glow, Solar)
4. Click each theme → verify CSS `data-theme` changes and UI updates
5. Open custom color picker → slide HSL → verify accent updates live
6. Reload page → verify custom accent persists
7. Check bottom nav doesn't cut off content on any page
8. Toggle Compact Mode / Animations / Reduce Motion → verify CSS effect
9. Check notification/privacy items for "Coming soon" badges on ghost items
