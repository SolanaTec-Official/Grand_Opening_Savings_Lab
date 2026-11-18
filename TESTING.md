# V3 validation checklist

## Functional flow

1. Open `index.html` in Chrome or Edge.
2. Confirm the welcome screen, language switch and reset control appear.
3. Press **Calculate Savings** and complete all four profile steps.
4. Confirm the monthly bill range ends at RM3,000 and the presets are RM300, RM500, RM700 and RM1,000.
5. Confirm selections persist when moving Back and Next.
6. Confirm all eleven requested locations appear.
7. Press **Show my savings** and verify the summary and all three comparison cards update.
8. Confirm the recommended battery card has a close pulsing orange outline.
9. Press **Keep my result** and confirm the photo-ready result card contains savings, panel count, system size and payback.
10. Test the complete flow in English and Chinese.

## Phase calculation validation

1. Select **Not sure** at both a low and high bill value, then switch to **Three-phase** and confirm the displayed panels, saving, new bill and payback remain identical.
2. Select **Single-phase**, use a bill high enough to request more than 15 panels, and confirm solar-only, hybrid-ready and battery results all stop at 15 panels.
3. With the same high-bill profile, switch to **Three-phase** and confirm the panel count may rise above 15 and the bill/savings recalculate.
4. Confirm the supply hint explains that **Not sure** uses the three-phase assumption in English and Chinese.

## Large-display validation

Use `index.html?kiosk=1&diagnostics=1` and test these viewport sizes in browser device emulation or on available monitors:

- 1920 × 1080
- 2560 × 1440
- 3840 × 2160
- 1920 × 1200
- 2560 × 1600

At every 16:9 size, confirm:

- the profile card retains the same proportion and distance from the left edge;
- the live-estimate card remains aligned with the profile card;
- the house, energy nodes and transparent trees do not shift relative to one another;
- the entire card and all buttons remain inside the visible screen;
- touch or mouse targets respond at their visible positions;
- diagnostics reports all assets ready.

For 16:10 or other aspect ratios, confirm the complete 16:9 composition is centred with safe margins and no content is cropped.

## Display overrides

- `?kiosk=1` always uses the fixed booth composition.
- `?kiosk=0` always uses the ordinary responsive layout.
- `?diagnostics=1` shows viewport, physical screen estimate, pixel ratio, aspect ratio, scale, fullscreen state and asset status.

## Smaller-screen fallback

Open `index.html?kiosk=0` and test tablet landscape and portrait. Confirm cards remain scrollable where necessary and the kiosk adapter does not interfere with the existing responsive layout.
