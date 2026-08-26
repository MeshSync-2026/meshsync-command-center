# MeshSync Command Center

A web-based command center for disaster response coordination in Sri Lanka. Built as the central dashboard that operators use to monitor incidents, manage responder squads, and coordinate field operations across districts.

## What this is

The Command Center is the operations side of MeshSync — a mesh-network disaster response system designed to work even when internet is unreliable. Field responders use the mobile app over Bluetooth mesh, edge nodes sync data via mules, and this dashboard gives commanders and dispatchers a live view of everything happening on the ground.

This submission is the **frontend only**. It runs entirely on mock data by default, but the API client is wired up to talk to the Edge Sync and Command Center backend services when they're available.

## Tech stack

- **React 19** with Vite 8 for fast dev and builds
- **Tailwind CSS 3.4** for styling (light theme, custom brand colors)
- **react-leaflet** for the map (OpenStreetMap tiles, no API key needed)
- **lucide-react** for icons (tree-shaken, only what we use gets bundled)
- **bcryptjs** for password hashing in demo mode
- **Vitest** for unit tests

No chart library — all charts are hand-built SVG. No icon font — lucide-react handles it. No state management library — React context + hooks do the job.

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### Demo accounts

| Email | Password | Role |
|-------|----------|------|
| anjali@meshsync.lk | demo1234 | Commander (full access) |
| suresh@meshsync.lk | demo1234 | Dispatcher |
| tharindu@meshsync.lk | demo1234 | Dispatcher |

Passwords are stored as bcrypt hashes, not plaintext. When the backend is connected, authentication goes through the Command Center API and returns a JWT token.

### Loading data

The dashboard starts empty (realistic for a fresh deployment). Click **Load Demo Data** on the Dashboard to populate it with AI-generated mock data — 48 incidents across 24 districts, 120 events, squads, devices, and sync sessions. The mock data is deterministic (seeded PRNG), so every load gives the same dataset.

## Connecting a backend

Copy `.env.example` to `.env` and set the URLs for your backend services:

```bash
cp .env.example .env
```

```
VITE_EDGE_SYNC_URL=http://localhost:4001
VITE_CC_URL=http://localhost:4002
```

- **Edge Sync (4001)** — incident ingestion, events, sync batches
- **Command Center (4002)** — auth, users, squads, zones, devices, clusters

When the backend is reachable, the dashboard fetches live data and auto-refreshes every 15 seconds. When it's not, it falls back to demo mode gracefully.

## Features

### Dashboard
KPI cards (active incidents, live pins, resolution rate, squad status), a map of Sri Lanka with severity-colored incident markers, recent activity feed, and a recent incidents table.

### Incidents
Full incident list with search, status/severity filters, bulk squad assignment, and pagination. Click any incident to see the detail view with status timeline, assigned squad, location, and event history.

### Clusters
Group nearby incidents into clusters for easier management. Create, edit, and delete clusters. Each cluster shows member count, radius, and max severity.

### Squads
Build squad hierarchies. Create squads, add or remove members, assign squads to response zones. Each member has a role (medic, comms, logistics, etc.).

### Responders
View all registered field devices. Toggle active/inactive status. See last seen time, role, and app version for each device.

### Sync Sessions
History of data sync batches from edge nodes. Shows mule node ID, events ingested, duplicates rejected, and timing.

### Analytics
Trend line (incidents over time), district bar chart, and donut charts for status/severity/report type breakdowns. All charts are custom SVG — no Recharts or Chart.js dependency.

### Access Requests (Commander only)
Pending user signups that need commander approval. Approve or reject new accounts. Approved users get a default password they can change later.

### Audit Trail (Commander only)
Full activity log — every action taken in the system with timestamp, actor, and target.

### Settings
Configure refresh interval, mule timeout, default district, alert threshold, and map layer preference. Preferences persist in localStorage.

### Profile
View your account details — name, email, role, organization.

## Internationalization

The UI supports three languages: **English, Sinhala, and Tamil**. Sri Lanka has three official languages, and a disaster response system needs to be usable by operators in all three communities. Switch languages from the header dropdown — the UI translates instantly. Language preference persists across sessions.

## Project structure

```
src/
  main.jsx              App entry point
  App.jsx               Routes and auth guards
  api/
    client.js           API client (Edge Sync + Command Center)
  components/
    AppLayout.jsx       Sidebar + header + content layout
    Header.jsx          Top bar with district scope, language, user menu
    Sidebar.jsx         Navigation (collapsible on desktop, overlay on mobile)
    SriLankaMap.jsx     Leaflet map with incident markers and clusters
    Icon.jsx            lucide-react wrapper
    ui.jsx              Reusable UI primitives (Badge, Modal, MetricCard, etc.)
    charts/
      Charts.jsx        Custom SVG charts (Line, Bar, Donut)
  context/
    AppContext.jsx      Auth, i18n, user management
    DataContext.jsx     Live data store with CRUD operations
    PrefsContext.jsx    User preferences (district, thresholds)
    ToastContext.jsx    Toast notifications
  data/
    enums.js            Label/tone maps for codes (severity, status, etc.)
    mockData.js         Deterministic seed data
  i18n/
    translations.js     UI strings in EN/SI/TA
  pages/
    Dashboard.jsx       KPIs + map + activity + recent incidents
    Incidents.jsx       Incident table with filters and bulk actions
    IncidentDetail.jsx  Single incident view with timeline
    Clusters.jsx        Cluster management
    Squads.jsx          Squad hierarchy and member management
    Responders.jsx      Device registry
    SyncSessions.jsx    Sync batch history
    Satellite.jsx       Satellite uplink monitoring (disabled)
    Analytics.jsx       Charts and trends
    AccessRequests.jsx  User approval queue (Commander only)
    AuditTrail.jsx      Activity log (Commander only)
    Profile.jsx         User profile
    Settings.jsx        System settings
    Login.jsx           Login form
    Signup.jsx          Signup form (creates PENDING account)
    ForgotPassword.jsx  Password reset request
  test/
    enums.test.js       Enum label/tone tests
    mockData.test.js    Mock data integrity tests
    setup.js            Vitest jsdom setup
```

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build to dist/
npm run preview    # Preview the production build
npm test           # Run unit tests (17 tests)
npm run lint       # Run oxlint
```

## Design decisions

**Custom SVG charts instead of a library** — Recharts adds ~100KB. Our hand-built charts add nothing and give full control over styling.

**Leaflet instead of Google Maps** — Open-source, uses OpenStreetMap tiles, no API key, no usage limits, no billing account.

**bcrypt for demo passwords** — Even in demo mode, passwords are hashed with bcrypt (cost factor 10). This matches the backend's hashing scheme, so the local fallback verifies passwords the same way the backend would.

**lucide-react for icons** — Tree-shakeable, so only the ~36 icons we use end up in the bundle. Replaces hand-maintained SVG path strings with a consistent, maintained set.

**Seeded PRNG for mock data** — `mulberry32` with a fixed seed means every "Load Demo Data" click produces the exact same dataset. Tests rely on this determinism.

**"Load Demo Data" button instead of auto-loading** — The evaluator sees an empty dashboard first (what a real deployment looks like), then explicitly loads demo data. The label makes clear it's AI-generated.

**Three languages** — Sri Lanka has three official languages. A disaster response system must be usable by operators in all three communities.

## Known limitations

- **No backend in this submission** — all data is AI-generated mock data. The API client is ready for the Edge Sync and Command Center services, configurable via `.env`.
- **Satellite uplink monitoring is disabled** — the page is commented out and hidden from navigation. The code is retained in `src/pages/Satellite.jsx` for re-enablement once the backend integration is ready.
- **Map requires internet** — OpenStreetMap tiles need a connection to load.
- **No real-time updates** — auto-refresh polls every 15 seconds. No WebSocket support yet.
- **17 tests** — covers enums and mock data integrity. No component rendering or end-to-end tests yet.

## License

This project is part of the MeshSync disaster response system.
