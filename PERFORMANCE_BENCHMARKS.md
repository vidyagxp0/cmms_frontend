# CMMS Frontend — Performance Benchmarks

All numbers come from `vite build` (Vite 8) on this repository. Gzip sizes were
measured with .NET GZip at optimal level, which is close to typical server
gzip. Request counts come from reading the code, not from network traces:
**no browser or backend was available**, so runtime timings (TTI, LCP,
request latency) were **not measured**.

## Bundle

| Metric | Before | After |
|---|---|---|
| JS downloaded before the first screen | 3,519 kB raw / 905 kB gzip (1 file) | **363 kB raw / 115 kB gzip** (4 files) |
| CSS before first screen | 204 kB / 32 kB gzip | 198 kB / 31 kB gzip |
| Total JS (all pages) | 3,519 kB | 3,087 kB across 198 chunks |
| `lucide-react` on the entry path | 462 kB (all 1,768 icons) | 0 kB; only used icons, split per page |
| Login page chunk (only for logged-out users) | in main bundle | 14 kB / 4 kB gzip |
| User routes table | in main bundle | 33 kB / 7 kB gzip |
| Admin routes table | in main bundle | 13 kB / 4 kB gzip |
| Typical record panel (e.g. `EquipmentPanel`) | in main bundle | 21 kB / 6 kB gzip |
| Typical record dashboard (e.g. `EquipDashboard`) | in main bundle | 10 kB / 4 kB gzip |
| CMMS dashboard (Recharts) | in main bundle | 409 kB / 113 kB gzip, loaded only when opened |

## API requests (per user action, derived from code)

| Action | Before | After |
|---|---|---|
| Open any record panel, 2nd time or later within 5 min | profile + departments + stages + activities + detail + permissions + logs | detail + permissions + logs (4 lookups served from cache) |
| Several components asking for departments at once | one request each | one shared request |
| Save on a record panel | 1 mutation, then 3 refreshes **one after another** | 1 mutation, then detail, then **permissions and logs together** (3 waits become 2) |
| Fast typing / filter change on a list | stale responses could overwrite newer results | only the latest response is applied |
| Header notification poll, tab hidden | every 60 s | paused (refetches on focus) |
| Transient network/5xx error on a GET | fails immediately | one automatic retry after 600 ms (GET only) |

## Rendering

| Screen | Before | After |
|---|---|---|
| CMMS dashboard, idle | whole page and all charts re-render every 1 s (live clock) | only the two clock text nodes re-render |
| Dashboard aggregate memos (`totalRecords`, etc.) | recomputed every render when data is empty | stable while data is unchanged |
