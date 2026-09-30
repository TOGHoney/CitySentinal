# CitySentinel

**AI-Powered Urban Intelligence for city fleets** — a client-side web application that turns bus-mounted camera feeds
into actionable urban-intelligence dashboards for a single authority user.

Built with **Next.js 14 (App Router)**, **Tailwind CSS + shadcn/ui**, **Zustand**, **Recharts**, **MapLibre GL + GeoApify** and a
fully mock data layer so every screen works without a backend.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # add a GeoApify API key if you want the interactive map
npm run dev
```

Open http://localhost:3000. Sign in with username `authority.admin` and any password of 6+ characters.

## Environment variables

| Variable                  | Purpose                                                         | Default in mock mode |
| ------------------------- | --------------------------------------------------------------- | -------------------- |
| `NEXT_PUBLIC_API_BASE_URL`| Base URL of the optional real API                               | —                    |
| `NEXT_PUBLIC_WS_URL`      | WebSocket URL for live fleet events                             | —                    |
| `NEXT_PUBLIC_GEOAPIFY_API_KEY`| GeoApify API key for MapLibre basemap tiles (optional)      | —                    |
| `NEXT_PUBLIC_USE_MOCKS`   | Set to `true` to serve UI from the deterministic mock layer     | `true`               |

If `NEXT_PUBLIC_GEOAPIFY_API_KEY` is unset, the map widgets render an explanatory placeholder — all dashboards still
work against the mock data layer. Set it to enable interactive maps, bus markers, defect markers and the congestion
heatmap.

## Features

- **Live fleet dashboard** — bus positions, status (normal / minor / critical), live alert panel, 4-camera feed per bus
  with speed & route analytics.
- **Traffic violations & E-Challan references** — ANPR detections with snapshot + plate crop evidence. Generating a
  reference stores **only** `Application ID, plate, location, time, violation type, bus ID, confidence` — no owner or
  registration data lives in this platform.
- **Road defects module** — geo-tagged potholes / damaged roads / missing signboards / waterlogging with confidence
  scores, resolve flow and CSV/PDF export.
- **Congestion analytics** — zone heatmap, hourly volume + speed charts, route congestion table, origin–destination
  flows, PDF report export.
- **Investigation** — draw a geo-fence on the map, search vehicles within a time window, play dash-cam HLS feeds, and
  build a case file (clip requests return an Application ID immediately).
- **Profile & settings** — authority account, fine structure, AI confidence thresholds, change password.
- Light/dark themes, toast + confirm dialog kit, CSV/PDF export via `jsPDF`.

## Running a production build

```bash
npm run build
npm run start
```

## Scripts

- `npm run dev` — development server
- `npm run build` — production build (type-checks + lints)
- `npm run start` — start the production server
- `npx tsc --noEmit` — full type check

## Project structure

```
src/
  app/            # routes: (auth), (dashboard) + middleware
  components/     # ui primitives, layout, dashboard, maps, per-module widgets
  hooks/          # useAuth, useFleet, useViolations, useDefects, useAnalytics,
                  # useInvestigation, useNotifications, useMap, useWebSocket
  lib/            # api (axios + mock dispatch), auth, websocket, toast, export (PDF/CSV),
                  # geojson, constants, utils
  mocks/          # deterministic mock API + seeded data
  store/          # zustand stores (auth, fleet, violations, defects, notifications, investigation)
  types/          # domain types
```

## License

See `LICENSE` (if present).