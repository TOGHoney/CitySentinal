# plan.md — AI-Powered Mobile Urban Intelligence Platform (CitySentinel)

## Project Overview

A client-side web application that transforms public transport buses into smart sensing units. Used by city transport & traffic authorities to monitor road conditions, track violations, analyse congestion, and support crime investigations via bus-mounted camera data.

**Single user role**: Authority User (transport/traffic department). No separate investigator role; all logged-in users have identical capabilities.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State Management | Zustand |
| Maps | Mapbox GL JS |
| Charts | Recharts |
| Real-Time | native WebSocket |
| HTTP Client | Axios (interceptors for JWT refresh) |
| Forms | React Hook Form + Zod |
| Video Playback | HLS.js + native `<video>` |
| PDF Export | jsPDF + jspdf-autotable |
| CSV Export | csv-writer |
| Icons | Lucide React |
| Dark Mode | next-themes |

---

## 2. Project Structure

```
citysentinal/
├── public/
│   └── mocks/                    # Static mock data JSON files
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── (auth)/               # Auth route group
│   │   │   ├── login/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── (dashboard)/          # Protected route group
│   │   │   ├── layout.tsx        # Sidebar + navbar + notification bell
│   │   │   ├── dashboard/page.tsx       # Real-time GIS dashboard
│   │   │   ├── violations/page.tsx      # Violation feed & e-challan
│   │   │   ├── defects/page.tsx         # Road condition defects map
│   │   │   ├── analytics/page.tsx       # Congestion & traffic analytics
│   │   │   ├── investigation/page.tsx   # Historical footage search
│   │   │   └── profile/page.tsx         # Profile & settings
│   │   ├── layout.tsx            # Root layout (providers, theme)
│   │   └── page.tsx              # Redirect to /dashboard or /login
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives (button, card, dialog, table, etc.)
│   │   ├── auth/                 # LoginForm, ForgotPasswordForm, ResetPasswordForm
│   │   ├── layout/               # Sidebar, Navbar, NotificationBell, ThemeToggle
│   │   ├── maps/                 # FleetMap, BusMarkerPopup, DefectHeatmap, CongestionMap, LayerToggle
│   │   ├── dashboard/            # LiveAlertPanel, BusDetailSidebar
│   │   ├── violations/           # ViolationFeed, ViolationCard, EChallanReferenceButton, ChallanHistoryTable, EvidenceModal
│   │   ├── defects/              # DefectListSidebar, DefectDetailModal, ExportReportButton, DefectFilters
│   │   ├── analytics/            # AnalyticsCharts, ODFlowDiagram, TimeRangePicker, DownloadReportButton
│   │   ├── investigation/        # InvestigationSearchForm, FootageResultsList, MultiCamPlayer, CaseFileBuilder
│   │   ├── notifications/        # NotificationDropdown, NotificationSettingsModal
│   │   └── profile/              # ProfilePage, FineRulesView, AlertConfigView, ChangePasswordForm
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useWebSocket.ts
│   │   ├── useFleet.ts
│   │   ├── useMap.ts
│   │   ├── useViolations.ts
│   │   ├── useDefects.ts
│   │   ├── useAnalytics.ts
│   │   ├── useInvestigation.ts
│   │   └── useNotifications.ts
│   ├── lib/
│   │   ├── api.ts                # Axios instance + interceptors + mock middleware
│   │   ├── auth.ts               # JWT helpers, role guards
│   │   ├── websocket.ts          # WebSocket manager class
│   │   └── utils.ts              # Formatters, validators, debounce
│   ├── store/
│   │   ├── authStore.ts          # Auth state (user, token status, login/logout)
│   │   ├── fleetStore.ts         # Fleet bus positions + alerts
│   │   ├── violationStore.ts     # Live + historical violations
│   │   ├── defectStore.ts        # Defects data + filters
│   │   ├── notificationStore.ts  # Notifications list + unread count
│   │   └── investigationStore.ts # Search params, results, case drafts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── fleet.ts
│   │   ├── violation.ts
│   │   ├── defect.ts
│   │   ├── analytics.ts
│   │   ├── investigation.ts
│   │   └── notification.ts
│   ├── mocks/
│   │   ├── handlers/             # Manual mock API handlers (fetch interceptors)
│   │   │   ├── auth.handlers.ts
│   │   │   ├── fleet.handlers.ts
│   │   │   ├── violation.handlers.ts
│   │   │   ├── defect.handlers.ts
│   │   │   ├── analytics.handlers.ts
│   │   │   └── investigation.handlers.ts
│   │   ├── data/                 # Hardcoded sample JSON data
│   │   │   ├── buses.ts
│   │   │   ├── violations.ts
│   │   │   ├── defects.ts
│   │   │   ├── analytics.ts
│   │   │   └── investigation.ts
│   │   └── index.ts              # Mock middleware router
│   └── middleware.ts             # Next.js middleware — JWT check + redirect
├── .env.local.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 3. Implementation Phases

> Each phase ends with a verification checkpoint (build + typecheck). No real backend needed — all APIs are mocked via manual fetch interceptors.

### Phase 1: Project Scaffolding & Auth ✅

**Tasks:**
1. Initialize Next.js 14 project with TypeScript
2. Install and configure: Tailwind CSS, shadcn/ui, Zustand, Axios, Mapbox GL JS, Recharts, next-themes, Zod, React Hook Form
3. Set up `.env.local.example` with required variables
4. Build TypeScript types for all entities
5. Create Axios instance with interceptors + mock middleware (`src/lib/api.ts`)
6. Implement auth store (Zustand)
7. Build Next.js middleware for route protection
8. Create auth pages:
   - `/login` — username (official ID) + password form
   - `/forgot-password` — enter username → system sends reset link via email (no OTP)
   - `/reset-password` — token-based new password form
9. Create root layout with ThemeProvider (next-themes)
10. Create dashboard layout with Sidebar + Navbar

**Checkpoint:** build succeeds, auth flow works end-to-end with mocks, protected routes redirect properly.

**Env Variables:**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_USE_MOCKS=true
```

---

### Phase 2: Real-Time GIS Dashboard (Live Fleet Monitoring) ✅

**Tasks:**
1. Build `FleetMap` component with Mapbox GL JS integration
2. Create custom colored bus markers (green/orange/red) based on alert status
3. Build `BusMarkerPopup` — camera thumbnails, speed, route, last alert timestamp
4. Implement `LayerToggle` — road defects, traffic density, violations, waterlogging overlays
5. Build `LiveAlertPanel` — sidebar list of real-time alerts
6. Create `useWebSocket` hook connecting to mock fleet stream (fallback polling if WS unavailable)
7. Build `useFleet` hook + `fleetStore`
8. Generate mock fleet data (12 buses across 5 routes)

**WebSocket Mock:**
- Simulate bus GPS updates every 2 seconds
- Random alert injection (minor/critical) every 10–15 seconds

**API Contract (mock):**
```
GET /api/fleet/buses
GET /api/fleet/buses/:id
WS /fleet-stream  → { type, busId, lat, lng, speed, routeId, alert? }
```

---

### Phase 3: Road Condition & Infrastructure Defects Map ✅

**Tasks:**
1. Build `DefectHeatmap` — Mapbox heatmap layer from GeoJSON defect points
2. Build `DefectFilters` — type dropdown, date range, zone/ward selector
3. Build `DefectListSidebar` — scrollable, virtualized list of defects
4. Build `DefectDetailModal` — image snapshot, GPS, timestamp, confidence, "Mark as Resolved"
5. Build `ExportReportButton` — CSV + PDF export
6. Create `useDefects` hook + `defectStore`
7. Mock data: 30–50 defects with varied types, confidence scores, timestamps

**Defect types:** pothole, damaged road, missing signboard, missing zebra crossing, waterlogging.

**API Contract (mock):**
```
GET /api/defects?bbox=...&type=...&from=...&to=...&zone=...
PATCH /api/defects/:id/resolve
```

---

### Phase 4: Traffic Violation & Auto-Challan Reference Module ✅

**Tasks:**
1. Build `ViolationFeed` — real-time scrollable, virtualized list
2. Build `ViolationCard` — snapshot, plate, ANPR confidence badge, location, time, bus ID
3. Build `EChallanReferenceButton` — calls backend, receives Application ID, stores reference
4. Build `ChallanHistoryTable` — filterable table with pagination
5. Build `EvidenceModal` — image lightbox + video clip player (HLS/MP4)
6. Create `useViolations` hook + `violationStore`
7. Mock data: 40–60 violations with ANPR results, confidence scores, bus IDs

**Violation types:** overspeeding, wrong-way driving, no-helmet, red-light jump, rash driving / dangerous overtaking.

**CONSTRAINT — E-Challan Reference Only:**
Frontend NEVER fetches, stores, or displays owner name, address, RC details, or DL details. It ONLY stores and displays:
- Application ID (from e-challan portal, via backend)
- Plate number
- Location (lat/long)
- Detection timestamp
- Violation type
- Bus ID
- Confidence score

**API Contract (mock):**
```
GET /api/violations?type=...&from=...&to=...&zone=...
POST /api/violations/:id/challan  → { applicationId, eChallanUrl }
GET /api/challan/history?date=...&zone=...&type=...&status=...
```

---

### Phase 5: Congestion & Traffic Analytics Dashboard ✅

**Tasks:**
1. Build `TimeRangePicker` with presets (1h, 6h, 24h) + custom range
2. Build `CongestionMap` — Mapbox choropleth layer (green→yellow→red)
3. Build `AnalyticsCharts`:
   - Vehicle count per hour (line chart)
   - Top 5 congested routes (bar chart)
   - Average speed per route (line chart)
4. Build `ODFlowDiagram` — simplified arrow-flow / Sankey visualization
5. Build `DownloadReportButton` — PDF export of analytics
6. Create `useAnalytics` hook

**API Contract (mock):**
```
GET /api/analytics/congestion?from=...&to=...
GET /api/analytics/routes?from=...&to=...
GET /api/analytics/od-matrix?from=...&to=...
```

---

### Phase 6: Crime Investigation & Historical Footage Search ✅

**Tasks:**
1. Build `InvestigationSearchForm` — location autocomplete + map draw (polygon/rectangle) + datetime pickers + optional vehicle number / route ID filters
2. Build map draw tool integration (Mapbox Draw or manual polygon → bbox)
3. Build `FootageResultsList` — buses in area + timeline slider
4. Build `MultiCamPlayer` — 4-camera grid (front/rear/left/right) synced by timestamp via HLS.js
5. Build `CaseFileBuilder` — notes, tagged clips, localStorage draft
6. Build `EvidenceExportButton` — export case clip metadata (not raw video) as PDF/JSON
7. Build "Request Clip" flow — backend returns secure signed URL
8. Create `useInvestigation` hook + `investigationStore`

**API Contract (mock):**
```
POST /api/investigation/search { bbox, from, to, vehicleNumber?, routeId? }
GET /api/investigation/buses/:id/timeline?bbox=...&from=...&to=...
GET /api/investigation/footage/:busId?timestamp=...
POST /api/investigation/request-clip { busId, from, to, cameras[] } → { signedUrl }
```

---

### Phase 7: Alerts & Notifications Center ✅

**Tasks:**
1. Build `NotificationBell` — icon with unread badge count
2. Build `NotificationDropdown` — scrollable list, type icons, click → opens relevant modal/map view
3. Build `NotificationSettingsModal` — toggle categories (critical incidents, violations, defects, investigation)
4. Create `useNotifications` hook + `notificationStore`
5. Persist recent notifications to localStorage for offline display
6. Mock WebSocket notifications (random alerts every 20–30s)

**Notification types:** critical incident (hit-and-run, rash driving), high-confidence violation, defect severity threshold crossed, investigation search completed.

---

### Phase 8: Profile & System Settings ✅

**Tasks:**
1. Build `ProfilePage` — name, role (fixed "Authority User"), department, contact
2. Build `ChangePasswordForm` — current + new + confirm
3. Build `FineRulesView` — read-only violation → fine amount table
4. Build `AlertConfigView` — read-only alert thresholds (e.g., pothole confidence > 85% → critical)
5. Implement `ThemeToggle` in sidebar/navbar

**API Contract (mock):**
```
GET /api/profile
PUT /api/profile/password
GET /api/settings/fine-rules
GET /api/settings/alert-thresholds
```

---

### Phase 9: Mock Data & Service Layer Refinement ✅

**Tasks:**
1. Create comprehensive mock data files for all entities
2. Build mock middleware router (`src/mocks/index.ts`) wired into the Axios layer
3. Simulate WebSocket streams for fleet, violations, notifications
4. Cover edge cases: no data, loading states, error responses
5. Add `.env.local.example`, finalize `package.json` scripts, write `README.md`

**Sample Mock Data:**
- 12 buses across 5 routes with realistic GPS coordinates
- 50 violations with varied types, confidence levels, timestamps
- 40 defects with types, images, confidence scores
- 20 notifications of different categories
- Analytics data for a 24-hour window (hourly)

---

## 4. Key Components Detail

### Map Components (shared across pages)
| Component | Used In | Description |
|---|---|---|
| `FleetMap` | Dashboard | Full-screen Mapbox map with bus markers |
| `DefectHeatmap` | Defects | Heatmap overlay for defect density |
| `CongestionMap` | Analytics | Choropleth layer for traffic density |
| `MapPolygonDraw` | Investigation | Draw search area on map → bbox |
| `BusMarkerPopup` | Dashboard | Popup on bus marker click |
| `LayerToggle` | Dashboard/Defects | Toggle map overlay layers |

### Shared UI Components
| Component | Description |
|---|---|
| `DataTable` | Reusable sortable/filterable table |
| `DateRangePicker` | Calendar picker with presets |
| `ConfidenceBadge` | Color-coded badge: >90% green, 70–90% yellow, <70% red |
| `EvidenceModal` | Image lightbox + video player modal |
| `ExportButton` | Dropdown with CSV/PDF export options |
| `EmptyState` | Placeholder when no data |
| `LoadingSkeleton` | Skeleton loading states |
| `SearchInput` | Debounced search with autocomplete |

---

## 5. State Management Strategy (Zustand)

| Store | Purpose | Key State |
|---|---|---|
| `authStore` | Auth session | `user`, `isAuthenticated`, `login()`, `logout()` |
| `fleetStore` | Live bus positions | `buses[]`, `selectedBus`, `alerts[]` |
| `violationStore` | Violations data | `liveViolations[]`, `history[]`, `filters` |
| `defectStore` | Defects data | `defects[]`, `filters`, `selectedDefect` |
| `notificationStore` | Notifications | `notifications[]`, `unreadCount`, `settings` |
| `investigationStore` | Investigation state | `searchParams`, `results[]`, `caseDraft` |

---

## 6. API & Mock Layer Design

### `src/lib/api.ts` — Axios + Mock Middleware
```
axios instance with baseURL from env
├── Request interceptor: attach credentials
├── Response interceptor:
│   ├── 401 → attempt token refresh via /auth/refresh
│   ├── refresh fails → logout + redirect to /login
│   └── other errors → toast notification
└── When NEXT_PUBLIC_USE_MOCKS=true:
    └── Mock middleware routes requests to src/mocks/handlers/*
```

### Public API Functions
```
├── auth: login(), forgotPassword(), resetPassword(), logout()
├── fleet: getBuses(), getBusDetail()
├── violations: getViolations(), generateChallanReference(), getChallanHistory()
├── defects: getDefects(), markResolved(), exportDefects()
├── analytics: getCongestion(), getRouteStats(), getODMatrix()
├── investigation: searchFootage(), getBusTimeline(), requestClip()
└── profile: getProfile(), updatePassword(), getFineRules(), getAlertThresholds()
```

---

## 7. Middleware & Security

```typescript
// src/middleware.ts
// 1. Check JWT cookie exists
// 2. Decode token, check expiry
// 3. Expired/missing → redirect to /login
// 4. Valid → allow access to /dashboard/*
// 5. Public routes: /login, /forgot-password, /reset-password
```

**Frontend Security Rules:**
- No owner/vehicle registration data stored or displayed
- All API calls through authenticated Axios instance
- WebSocket connections authenticated via token
- E-challan flow: only Application ID + location + time + plate + violation type + bus ID + confidence

---

## 8. Performance Considerations

| Strategy | Implementation |
|---|---|
| Virtualized lists | `react-window` for violation feed, defect list, challan history |
| Lazy loading | `next/dynamic` for map components, video players, charts |
| Debouncing | Map filter changes debounced (300ms) |
| Code splitting | Heavy libs (Mapbox, HLS.js, jsPDF) loaded on demand |
| Memoization | `React.memo` on list items, `useMemo` for filtered data |
| Image optimization | Next.js `Image` component with lazy loading |

---

## 9. Responsive Design

| Breakpoint | Layout |
|---|---|
| Desktop (≥1280px) | Sidebar + content + optional right panel |
| Tablet (≥768px) | Collapsible sidebar + full content |
| Mobile (<768px) | Bottom nav + full-screen map modals (secondary) |

**Priority:** Desktop-first, tablet-compatible for field use by authorities.

---

## 10. Accessibility (WCAG 2.1 AA)

- Full keyboard navigation across all interactive components
- ARIA labels on map controls, table rows, modals, notification bell
- Sufficient color contrast, including for color-coded markers/badges (paired with icons where possible)
- Focus management inside modals and dialogs

---

## 11. Deliverables Checklist

- [x] Complete Next.js project structure
- [x] All pages implemented and routed (login, forgot/reset password, dashboard, violations, defects, analytics, investigation, profile)
- [x] 50+ reusable components
- [x] 9 custom hooks (useAuth, useFleet, useWebSocket, useViolations, useDefects, useAnalytics, useInvestigation, useNotifications, useMap)
- [x] 6 Zustand stores
- [x] Mock API service layer (manual fetch interceptors) with sample data
- [x] Dark/light mode
- [x] Responsive layout (desktop + tablet + mobile bottom nav)
- [x] WebSocket mock simulation
- [x] PDF/CSV export functionality
- [x] README with setup instructions, env vars, feature walkthrough, e-challan integration notes

---

## 12. Notes on E-Challan Integration

- The frontend acts as a **case detective** only: it creates the reference and receives an **Application ID** from the e-challan portal (proxied via backend).
- Owner details (name, address, RC, DL) are managed **entirely by the e-challan portal** using the Application ID.
- The frontend stores only: Application ID, plate number, location, timestamp, violation type, bus ID, confidence.
- Status tracking (pending / issued / disputed) is read back from the backend.
- If the backend provides an e-challan portal URL, the Application ID row links out to it in a new tab.