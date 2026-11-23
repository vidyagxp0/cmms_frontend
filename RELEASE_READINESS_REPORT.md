# CMMS Frontend — Release Readiness Report

**Recommendation: ready for a staging release, not yet for production.**
The code builds, all 55 automated tests pass, and four crash-level bugs are
fixed. **No browser or backend testing was possible in this session**, so the
manual checklist in §8 must pass on staging before production.

Related reports: `PERFORMANCE_AUDIT.md`, `PERFORMANCE_OPTIMIZATION_REPORT.md`,
`PERFORMANCE_BENCHMARKS.md`.

---

## 1. Bugs fixed

| # | Bug | Impact before fix | Fix |
|---|---|---|---|
| 1 | `AddendumPreventivePlannerPanel.jsx` read an undeclared `frequency` in `handleViewChild` | **Crash** (`ReferenceError`) when opening a child from a planner row with no `frequency` value | Root cause: the grid already passes `getRowBiggestFrequency(row)` (`{code,label}`) as the 3rd argument, and the handler never declared it. `PreventivePlannerPanel` declares it the same way. Now accepted as a parameter. Mapping moved to `addendumChildFrequency.js` with unchanged rules (row frequency → code → label; M/Q/H/Y → monthly/quarterly/half-yearly/yearly). No new defaults. |
| 2 | `CalibrationChild.jsx` "Leave without saving" called non-existent `setCalibrationRows` | **Crash**; user stuck in the unsaved-changes modal | Removed the call (it was copied from `CreateCalibration`; unmounting resets state anyway). Destination now matches this page's Cancel button and its save-success route (`/user/calibration-management-dashboard`). |
| 3 | `UserProfile.jsx` used `toast` without importing it | Profile load failure threw inside `catch`; no error shown to the user | Imported `toast` from `sonner` (project standard) |
| 4 | `SessionTimeout.jsx` used undefined `user_token`/`admin_token` | **Idle logout crashed**; token and user stayed in place | Uses the header Logout flow: `logout()` API, then `clearAuth()`, then `/login`, with a re-entry guard *(previous pass)* |
| 5 | 401 handler removed only the tokens | Previous session's timer, notification flag and in-memory user survived | 401 now calls `clearAuth()`, the same cleanup as manual logout |
| 6 | A slow request from user A returning 401 after user B logged in | Would log out user B | Requests are tagged with the token that sent them; 401s from a superseded session are ignored |
| 7 | Retried or re-sent request after logout | Could carry the previous session's `Authorization` header | Header is removed when no session is active |
| 8 | `logout()` inherited the 30 s timeout | Logout could hang 30 s when the API is down | Logout uses a 5 s timeout; local cleanup always runs |

## 2. Components consolidated

The three `ChecklistConfig` files were compared line by line:

| File | Difference from `components/checklist/ChecklistConfig.jsx` | Live importers |
|---|---|---|
| `pages/user/Equipment/ChecklistConfig.jsx` | 1 line: `SectionHeader` import path | none (only a commented-out import) |
| `pages/user/FieldInstruments/ChecklistConfigField.jsx` | `SectionHeader` path + component name | none |

There were no module-specific endpoints, validation, configuration, save
behaviour or workflow rules. The shared component is the single
implementation. The two module files are now thin re-exports, so every
existing import path, and the `ChecklistConfigField` name, still works.
A test asserts all three paths resolve to the same component.
**About 3,240 duplicate lines removed.**

## 3. Files modified (this phase)

| Area | Files |
|---|---|
| Bug fixes | `pages/user/AddendumPreventivePlanner/AddendumPreventivePlannerPanel.jsx`, **new** `addendumChildFrequency.js`, `pages/user/CalibrationPlanner/CalibrationChild.jsx`, `pages/user/UserProfile/UserProfile.jsx` |
| Consolidation | `pages/user/Equipment/ChecklistConfig.jsx`, `pages/user/FieldInstruments/ChecklistConfigField.jsx` |
| Auth / API | `services/api.js`, `services/authApi.js` |
| Testability | `routes/lazyPage.js` (exported `withChunkRetry`; behaviour unchanged) |
| Test setup | `package.json` (scripts and devDependencies), `package-lock.json`, **new** `vitest.config.js`, **new** `src/test/setup.js` |

The earlier passes in this session are listed in `PERFORMANCE_OPTIMIZATION_REPORT.md`.

## 4. Tests added

Runner: **Vitest 4.1.12 + jsdom 26 + Testing Library 16**. These are dev
dependencies only, pinned exactly; Vitest 5 and jsdom 31 need Node 22, and
this machine runs Node 20.19. Run with `npm test`.

**All APIs are mocked. These tests verify frontend logic only, not real backend behaviour.**

| File | Covers | Tests |
|---|---|---|
| `services/requestCache.test.js` | deduplication, TTL, failures not cached, key isolation, admin/user isolation, invalidation, clear-on-logout, in-flight request not written back after clear | 8 |
| `services/api.test.js` | token attach/strip; GET retried once on network error and 503; no retry on 500 or timeout; **POST/PUT/PATCH/DELETE never retried**; 401 clears the full session; 401 from a superseded session ignored | 12 |
| `services/authApi.test.js` | profile cached and deduplicated; invalidated only after a successful update; login/logout clear the cache; logout timeout | 5 |
| `components/common/SessionTimeout/SessionTimeout.test.jsx` | idle logout clears everything and redirects; works when the logout API fails; double-trigger guarded | 3 |
| `components/ui/FloatingActionButtons.test.jsx` | double-click calls save once; unlocks after save; unlocks after failed validation; stays locked while saving | 4 |
| `pages/user/Equipment/EquipDashboard.test.jsx` | **latest response wins**: a slow stale response does not overwrite newer search results. Mutation-checked: the test fails if the guard is removed | 1 |
| `routes/lazyPage.test.jsx` | lazy render with fallback; no eager download; idle prefetch skips `prefetch:false`; stale-chunk reload happens once with no loop | 6 |
| `components/common/SymbolicInput/SymbolicInput.test.jsx` | no `onChange` on mount or on external value change (render-loop regression); emits on typing | 4 |
| `components/checklist/ChecklistConfig.test.jsx` | all three entry points are the same component; controlled edits; no `onChange` on mount | 4 |
| `pages/user/AddendumPreventivePlanner/addendumChildFrequency.test.js` | row frequency first; M/Q/H/Y mapping; label fallback; empty data (no crash); end-to-end with the grid's `getRowBiggestFrequency` | 8 |

## 5. Tests executed

```
npm test  →  Test Files 10 passed (10) · Tests 55 passed (55)
```

The run prints `Error: Not implemented: navigation`. That is jsdom reporting
the `window.location.reload()` the stale-chunk test triggers on purpose; it is
not a failure.

## 6. Build, lint and dependency results

| Check | Result |
|---|---|
| `vite build` | **Pass**, 198 chunks |
| First-load JS | 363 kB raw / **115 kB gzip** (original baseline: 3,519 kB / 905 kB gzip, −87%) |
| `ChecklistConfig` in build | 1 chunk |
| `npm ls --all` | 0 problems (only platform-specific optional `lightningcss-*` binaries, which is expected) |
| React copies | single `react@19.2.8` / `react-dom@19.2.8` |
| Type checking | not configured (JavaScript project, no `tsconfig.json`) |
| ESLint (whole repo) | **754 problems, all existing categories**: `no-unused-vars` 368; `no-undef` 178 (browser globals missing from `eslint.config.js`); `react-hooks/set-state-in-effect` 127; others under 25 each. **No undefined identifiers remain** apart from browser globals, after fixing `frequency`, `setCalibrationRows` and `toast`. No lint errors in the new test files apart from the same `setTimeout` global. |

## 7. Remaining risks

1. **No browser or backend verification.** Every runtime claim rests on code review plus mocked tests.
2. **Cached lookups can be up to 5 minutes old.** Profile, departments, workflow stages and stage activities are cached. Profile refreshes immediately on update. An admin changing departments or workflow is seen by already logged-in users within 5 minutes, or at their next login.
3. **ESLint config lacks browser globals**, which hides real `no-undef` bugs among 178 false positives. Three were found by hand this time. Recommendation: add `globals.browser` to `eslint.config.js`.
4. **Existing lint findings not changed in this phase:**
   - `return` inside `finally` in 4 Create/Child pages (`no-unsafe-finally`);
   - ref reads during render in `SessionTimeoutModal` / `Networkstatusmodal`;
   - functions called before declaration in 9 audit and list pages (`react-hooks/immutability`).

   None is a confirmed user-facing bug, but each needs review.
5. **Recharts dashboard chunk** is 113 kB gzip and loads only when the dashboard is opened.

## 8. Manual backend testing checklist (staging)

Record pass/fail for each step. *None of these were executed in this session.*

| # | Scenario | Expected |
|---|---|---|
| 1 | Log in as **User** | Lands on the engineering dashboard; header, nav and session timer show |
| 2 | Log in as **Admin** in a fresh tab | Admin dashboard; `/user/*` redirects to login |
| 3 | Open the CMMS dashboard and wait 60 s | Clock ticks; charts don't flicker; numbers correct |
| 4 | Open Equipment, Equipment Master, Field Instruments, Spare Instruments | Lists load; after ~3 s, switching modules is instant |
| 5 | Open Calibration, Preventive Maintenance, Addendum Preventive Planner | Lists load |
| 6 | Filter and paginate each list; type quickly in search | Final results match the final filter and page |
| 7 | Open a record panel | Stages, activities, permissions and log are correct for your role |
| 8 | Equipment Master → Checklist Configuration tab | Builder loads; edits persist after Update |
| 9 | Create a new record; double-click **Create** | Exactly **one** record created; success toast only after the server confirms |
| 10 | Update an existing record | Detail, permissions and activity log refresh |
| 11 | Workflow action as a user **without** permission | Action not allowed (unchanged rules) |
| 12 | Addendum Preventive Planner → **Child** on rows with and without frequency | Child form opens with the right frequency, or empty; **no crash** |
| 13 | Calibration Management create → edit → Cancel → **Leave without saving** | Navigates to the Calibration Management dashboard |
| 14 | Edit a form, then browser Back | Unsaved-changes modal; Stay / Leave / Save & leave all work |
| 15 | Stay idle 6 min | Warning at 5 min, then logged out to `/login`; Back doesn't re-enter |
| 16 | Stop the backend, then Logout | Back on `/login` within ~5 s |
| 17 | Log out user A, log in user B in the same tab | No A data (name, departments) visible anywhere |
| 18 | Expire or revoke the token server-side, then click around | Redirected to login once; state fully cleared |
| 19 | Deploy a new build while a tab is open, then navigate | Page reloads once and works (no blank screen) |

## 9. Release recommendation

- **Go to staging now.** Builds clean, 55/55 tests pass, crash-level bugs fixed, no API contract or workflow-rule changes.
- **Go to production after** checklist §8 passes on staging, especially #9 (single create), #12 (frequency), #13, #15–#18 (auth) and #11 (permissions).
- **Soon after release:** add `globals.browser` to the ESLint config and work through the hidden `no-undef` list, which is the cheapest way to find the next latent crash.
