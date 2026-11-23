# CMMS Frontend — Performance Optimization Report

Companion documents: [PERFORMANCE_AUDIT.md](PERFORMANCE_AUDIT.md) (all findings)
and [PERFORMANCE_BENCHMARKS.md](PERFORMANCE_BENCHMARKS.md) (numbers).

No API endpoints, payloads, workflow permissions or business rules were changed.

## 1. What was slow, and why

| Symptom | Root cause |
|---|---|
| Slow first load and blank screen after login or refresh | All ~75 pages, Recharts, xlsx and every icon compiled into one 3.5 MB file that had to download and parse before anything rendered |
| Icons alone cost 462 kB | Corrupted `lucide-react` install (ESM files missing), so the bundler used the CommonJS build, which cannot be tree-shaken |
| Every page "waits" a moment before showing data | Each page re-requested profile, departments, workflow stages and stage activities, data that never changes between pages |
| CMMS dashboard feels heavy and janky | A 1-second clock lived in the dashboard's state, re-rendering every chart every second |
| Saving a record takes a while to "settle" | Detail, permissions and logs refreshed one after another |
| Occasionally wrong list results after quick typing or filter changes | No protection against out-of-order responses |
| Possible duplicate records on double-click | Async form validation left a window before the Save button disabled |
| Idle logout did not log out | `SessionTimeout.jsx` referenced undefined variables (`ReferenceError`). Earlier it cleared `localStorage`, but tokens live in `sessionStorage` |

## 2. Optimizations implemented

### Pass 1 (previous session)
- **Route-level code splitting** for all user/admin pages, Login and 404 (`routes/lazyPage.js`). Includes idle-time prefetch, and a one-time reload when a chunk is missing after a deploy.
- **`Suspense` inside the layouts.** Header and nav stay mounted; only the content area shows `PageLoader`.
- **Request cache** (`services/requestCache.js`) for profile, departments, stages and activities:
  - concurrent identical calls share one request;
  - results kept for 5 minutes;
  - failures are not cached;
  - keys are scoped by login type;
  - cleared on login, logout, 401 and `clearAuth`;
  - profile is invalidated after `updateProfile`.
- **Repaired the `lucide-react` install.** Same version, from the lockfile.

### Pass 2 (this session)
1. **Fixed the idle-logout bug** (`components/common/SessionTimeout/SessionTimeout.jsx`).
   - It now follows the same flow as the header Logout button: `logout()` API (best effort), then `clearAuth()` (both tokens, `auth_type`, session timers, request cache), then navigate.
   - A re-entry guard prevents double logout.
2. **Post-save refresh in 15 record panels:** `await detail` → `await Promise.all([permissions, logs])`.
   - Detail stays first because `fetchPermissions`/`fetchActivityLogs` read refs (`isImportedRef`, `requiredValuesRef`) that detail sets.
   - This also corrects pass 1, which had parallelised all three in the 4 equipment panels.
3. **Latest-request-wins guard in 13 record dashboards.** A `requestId` ref; stale responses, errors and `finally` blocks are ignored, so they can't overwrite newer data or end the loading state early.
4. **CMMS dashboard rendering** (`UserDashboard.jsx`):
   - the live clock moved into isolated `<LiveDate/>` / `<LiveTime/>` components;
   - a stable empty-array constant keeps the aggregate `useMemo`s effective.
5. **Double-submit protection** in the shared `FloatingActionButtons`. Save clicks are locked until `isSaving` turns true, or for 1.2 s if validation fails.
6. **GET-only transient retry** in the Axios response interceptor (`services/api.js`):
   - one retry after 600 ms, on network errors or 502/503/504;
   - not on the 30 s timeout, cancellations or blob downloads;
   - **never for POST/PUT/PATCH/DELETE**.
7. **Notification poll pauses while the tab is hidden** (`UserHeader.jsx`). It still refetches on focus.

## 3. Files modified (both passes)

- **Added:**
  - `src/routes/lazyPage.js`
  - `src/services/requestCache.js`
  - `src/components/common/PageLoader/PageLoader.jsx`
- **Routing and layout:**
  - `src/routes/AppRoutes.jsx`, `UserRoutes.jsx`, `AdminRoutes.jsx`
  - `src/components/layout/UserLayout/UserLayout.jsx`, `UserHeader.jsx`
  - `src/components/layout/AdminLayout/AdminLayout.jsx`
- **API, auth and shared components:**
  - `src/services/api.js`, `authApi.js`, `usersApi/workflowCommonApi.js`
  - `src/store/authStore.js`
  - `src/components/common/SessionTimeout/SessionTimeout.jsx`
  - `src/components/ui/FloatingActionButtons.jsx`
- **Dashboard:** `src/pages/user/UserDashboard/UserDashboard.jsx`
- **15 record panels:** Equipment, EquipmentMaster, FieldInstruments, SpareInstrument, Calibration, CalibrationChild, InstrumentsCalibration, FieldInstrumentsPlanner, PreventivePlanner, PreventiveMaintenance, AddendumPreventivePlanner, AddendumCalibrationChild, AddendumPreventiveChild, UnCalibration, UnCalibrationChild.
- **13 record dashboards:** Equip, EquipmentMaster, FieldInstrumets, SpareInstrument, Engineering, Management, InstrumentCalibration, PreventivePlanner, PreventiveMaintenance, AddendumPreventivePlanner, AddendumCalibrationChild, AddendumPreventiveChild, UnCalibration.

Separately from performance, this session also added unsaved-changes guards to the equipment and instrument pages, and fixed a render loop in `SymbolicInput.jsx`.

## 4. Results
See [PERFORMANCE_BENCHMARKS.md](PERFORMANCE_BENCHMARKS.md).
- **First-load JS:** 905 kB → 115 kB gzip (−87%).
- **Lookups:** 4 lookup requests per page open are now served from cache after the first visit.
- **Saves:** 3 sequential refreshes become 2 round trips.
- **Dashboard:** no more full re-render every second.

## 5. Verification

| Check | Result |
|---|---|
| `vite build` | Passes (198 chunks), run after every batch |
| ESLint on the 44 changed files | No parse errors and no new undefined identifiers. Remaining messages are existing categories: unused vars, `set-state-in-effect`, browser globals missing from the ESLint config |
| Automated tests | **None exist** (no `test` script in `package.json`) |
| Encoding / line endings | Diff checked. Existing non-ASCII text untouched; mixed CRLF/LF from scripted edits normalised |
| Imports and routes | All resolve (build succeeds; 73 lazy routes plus 4 top-level) |
| Browser testing (login, modules, save, logout, session expiry) | **Not done.** No browser tooling or backend credentials in this session |

### Manual test checklist before release
1. Log in as a user and as an admin. Open 4–5 modules, then confirm navigation is instant after the first few seconds.
2. Open the CMMS dashboard and leave it for a minute; the clock should tick and the charts stay still.
3. Type quickly in a list search box; the final results should match the final text.
4. Double-click **Create** on a create form; only one record should be created.
5. Save a record panel; detail, permissions and the activity log should update.
6. Leave the app idle 6 minutes; you should land on Login, and Back must not re-enter the app.
7. Log out as one user and in as another; no previous user's name or departments should appear.

## 6. Remaining bottlenecks and recommendations
- **Recharts** makes the CMMS dashboard chunk 113 kB gzip. Lazy-loading below-the-fold charts, or a lighter chart library, needs product sign-off.
- **Three duplicate `ChecklistConfig` copies** (1.6k lines each) should be merged into `components/checklist/ChecklistConfig.jsx`.
- **Initial panel load** still waits for detail before permissions, because `isImportedRef` comes from the detail response. A backend field on the permissions endpoint would allow full parallel loading.
- **Bugs found during the audit, not changed:**
  - the undefined `frequency` in `AddendumPreventivePlannerPanel.jsx:631`;
  - browser globals missing from `eslint.config.js`.
- **Data fetching:** `@tanstack/react-query` is installed but used in only one place. Moving list dashboards onto it later would give cancellation, background refresh and caching in one standard tool, replacing the hand-written guards.
