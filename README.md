# KidSketch — AI Coloring Page Generator

A React Native / Expo MVP that turns a photo into a kid-friendly
coloring page. Designed for parents of 3-10 year-olds.

## Quick start

```bash
npm install
npx expo start
```

Then press `i` for iOS simulator, `a` for Android, or scan the QR with
the Expo Go app (note: the Skia canvas page requires a development
build on Android — Expo Go ships the module on iOS).

### Development build (for Skia + camera)

```bash
npx expo install expo-dev-client
npx expo run:ios        # or: npx expo run:android
```

## Configure AI + payments

Edit `app.json → expo.extra`:

```json
{
  "extra": {
    "replicateApiToken": "r8_xxx",
    "revenueCatApiKey": "appl_xxx",
    "posthogApiKey": "phc_xxx"
  }
}
```

Without keys the app still runs end-to-end in a demo "mock" mode — AI
transformation echoes your source photo, and the paywall grants a
fake entitlement.

## Project layout

```
app/                     Expo Router pages
  _layout.tsx            root stack + splash + providers
  (tabs)/                bottom-tab navigator
    index.tsx            home + daily theme + style picker
    create.tsx           camera / gallery picker
    color.tsx            "your pages" grid
    profile.tsx          plan + parental controls + favorites
  result.tsx             modal: AI preview / save / print / share
  canvas/[id].tsx        Skia coloring canvas
  paywall.tsx            modal: RevenueCat offerings
  parental.tsx           modal: daily limit + safety info

src/
  theme/                 colors · typography · spacing tokens
  components/            Button, Card, Screen, StyleCard, …
  constants/             style presets, daily themes
  services/              ai, storage, export, analytics, revenuecat
  store/                 zustand stores (artworks, settings, sub)
  hooks/                 useQuota
```

## Design tokens

All colors, fonts, and spacing flow through `src/theme/`. Never hard-code
a hex value inside a screen — add it to `colors.ts` first. Touch
targets are floored at `touch.minTouch` (56 pt) for small hands.

## Features (MVP)

- **P0** Photo → coloring page with 5 preset styles (simple lines,
  cartoon doodle, storybook, pixel adventure, color-by-number).
- **P0** Skia coloring canvas with brush, eraser, undo/redo, and a
  12-color kid palette.
- **P0** Save to camera roll, print via AirPrint/Google Print, and
  share via the system share sheet.
- **P1** Local gallery (`Color` tab) + favorites (`Me` tab).
- **P1** Daily theme on the home screen, rotating through seven
  evergreen topics.
- **P1** Parental controls modal — daily time limit + safety copy.
  NSFW filter is hard-coded on.
- **Paywall** — monthly ($4.99) and annual ($29.99) tiers. Free tier
  is 3 transforms/day.

## Roadmap (P2)

- Text prompt → coloring page.
- Multi-page storybooks.
- Family Sharing (5 kid profiles per subscription).
- Local edge-detect fallback for the "mock" path so even offline users
  get a recognisable line-art result.
