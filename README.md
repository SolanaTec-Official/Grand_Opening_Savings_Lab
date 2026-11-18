# Solana Tec Savings Lab

Local, modular booth-game version of the Solana Tec solar savings calculator.

## Open for testing

Open `index.html` directly in a current version of Chrome or Edge. No server or build step is required.

V3 has one active page and contains only the runtime files and image assets used by that page.

## Display modes

V3 keeps the approved 1920 × 1080 composition on large landscape displays through an isolated kiosk adapter.

- Automatic: enabled on large, landscape-oriented Full HD/2K/4K-class displays.
- Force kiosk mode: `index.html?kiosk=1`
- Disable kiosk mode: `index.html?kiosk=0`
- Show display and asset diagnostics: `index.html?kiosk=1&diagnostics=1`

The adapter scales the complete interface uniformly. Calculator logic, language controls, vegetation sequences and result calculations are unchanged.

## Runtime structure

- `index.html` — the only page entry point
- `css/base.css` — shared variables and base controls
- `css/scene.css` — landscape, energy and vegetation layers
- `css/savings-lab.css` — Savings Lab interface
- `css/savings-lab-responsive.css` — tablet and smaller-screen layouts
- `css/kiosk.css` — fixed 1920 × 1080 booth composition
- `js/savings-lab-calculator.js` — supplied calculation assumptions and result engine
- `js/savings-lab-scene.js` — scene and vegetation progression
- `js/savings-lab-app.js` — interface state and event wiring
- `js/kiosk-display.js` — display scaling, diagnostics and asset validation
- `assets/` — the four runtime image assets used by the page

## Kiosk behavior

The kiosk adapter calculates one uniform scale from the available viewport. Exact 16:9 displays fill the screen; other aspect ratios are centred with safe background margins rather than stretching or independently moving components.

Every landscape image is decoded and checked at startup. A failed optional vegetation layer is hidden safely, while diagnostics mode reports the asset count.

## Calculation status

The output remains an illustrative booth estimate. Final system design must still be confirmed through a site assessment.

Calculation review documents:

- `CALCULATION-QUICK-REVIEW.md` — short professional review of the major calculations and decisions.
- `CALCULATION-METHODOLOGY.md` — complete formulas, constants, worked example, regression cases and sign-off checklist.
