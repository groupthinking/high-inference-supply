# High Inference (`highinference.com`) — Drop 01 Interactive Storefront

An interactive **WebGL2** and **kinetic scroll** editorial storefront built for **High Inference** Drop 01, modeled on the 5-act architectural structure of *Remix-Gemini-Supply*.

## Architecture

- **WebGL2 Field (`src/webglField.js`)**: Real-time orbital interference & phosphor-ochre/smoke-blue fragment shader reacting to scroll velocity, chapter progression, and pointer coordinates.
- **5-Act Kinetic Flow**:
  - **Act 01 (`src/act1Hero.js`)**: Full-viewport kinetic hero with live scroll-velocity telemetry.
  - **Act 02 (`src/apparelShowcases.js`)**: Scroll-scrubbed heavyweight garment showcases (Takeoff 6014 LS, Agentic 420GSM Hoodie, Blackhole 6014 LS, Cooked Overload Tee, Special Ops 12oz Chore Coat, Optical Study Tee) with inline `pieceActionBar.js`.
  - **Act 03 (`src/objectShowcases.js`)**: Headwear (`don't Prompt me` Cap) & embroidered Mission Patches (`AGI`, `Super Intelligent`, `S3XY`) + Mission Patch 3-Pack bundle callout.
  - **Act 04 (`src/act4Spread.js`)**: *"Shoppers Go Analog"* editorial flatlay spread and 3-pillar brand manifesto.
  - **Act 05 (`src/act5Lineup.js`)**: Complete 10-piece Drop 01 archive index + one-click **Add Complete Set** and **Overworked Builder Kit** bundles.
- **Interactive Product Stage (`src/productStage.js`)**: Fullscreen multi-angle viewer with 3D pointer tilt, size selection, garment/packaging specs, and keyboard (`Esc`, `←`, `→`) navigation.
- **Slide-out Bag Drawer (`src/bagDrawer.js`)**: Persistent `localStorage` bag, \$125 free-shipping progress bar, automatic bundle discount detection, and `window.Shopify.actions` hooks for WebMCP / Shopify Storefront API integration.
- **Opt-In Haptics (`src/haptics.js`)**: `Haptics [ Off / On ]` toggle in the top HUD (off by default, saved in `localStorage`) triggering distinct `navigator.vibrate()` patterns on bag adds, complete sets, stage/drawer open/close, chapter jumps, and size/angle/quantity changes.

## Local Development & Deployment

```bash
npm install
npm run dev      # Start dev server on http://localhost:5173
npm run build    # Build production bundle into dist/
```

Deploy directly to Vercel and point `highinference.com` (or connect Shopify Storefront GraphQL checkout mutations via `src/store.js`).
