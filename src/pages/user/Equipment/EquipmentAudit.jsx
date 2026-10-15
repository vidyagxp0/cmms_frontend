import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Activity, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { toast } from "sonner";

import { getInstrumentAuditTrail } from "../../../services/usersApi/equipmentApi";

/* ───────────────────────── Constants ───────────────────────── */

const PER_PAGE = 10;

const EMPTY_PAGINATION = {
  current_page: 1,
  per_page: PER_PAGE,
  total: 0,
  last_page: 1,
  from: 0,
  to: 0,
};

const ACTION_STYLES = {
  created: "border-[#BFE5CD] bg-[#EAF8F0] text-[#2E7D4F]",
  updated: "border-[#BCD6F0] bg-[#EAF3FC] text-[#2F6DA8]",
  deleted: "border-[#F0C4C4] bg-[#FCEDED] text-[#B54A4A]",
};

const DEFAULT_ACTION_STYLE = "border-[#DCE3EA] bg-[#F3F4F6] text-[#526071]";

const TABLE_HEADERS = [
  "Action",
  "Field",
  "Old Value",
  "New Value",
  "Remarks",
  "Changed By",
  "Date & Time",
];

/* ───────────────────────── Helpers ───────────────────────── */

const display = (value) =>
  value === null || value === undefined || value === "" ? "-" : value;

/* e.g. 1 … 4 5 [6] 7 8 … 20 */
const getPageNumbers = (current, last) => {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

  const pages = new Set([1, last, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= last)
    .sort((a, b) => a - b);

  const result = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("…");
    result.push(p);
  });
  return result;
};

/* ───────────────────────── Small pieces ───────────────────────── */

const InfoCard = ({ label, value }) => (
  <div className="min-w-0 rounded-[14px] border border-[#E4ECE8] bg-[#F7FAF8] px-4 py-3">
    <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#8A9992]">
      {label}
    </p>
    <p className="truncate text-[12px] font-semibold text-[#243238]">
      {display(value)}
    </p>
  </div>
);

const Badge = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-[3px] text-[10px] font-semibold ${className}`}
  >
    {children}
  </span>
);

const TableSkeleton = () => (
  <div className="space-y-3 p-5">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-8 animate-pulse rounded-md bg-[#EEF3F0]" />
    ))}
  </div>
);

/* ───────────────────────── Component ───────────────────────── */

const EquipmentAudit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);

  /* filters */
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const requestRef = useRef(0);

  /* debounce search → API, and go back to page 1 when it changes */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchAuditTrail = useCallback(async () => {
    if (!id) return;

    const requestId = ++requestRef.current;

    try {
      setIsLoading(true);

      const params = { page, per_page: PER_PAGE };
      if (search) params.search = search;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;

      const response = await getInstrumentAuditTrail(id, params);

      /* ignore stale responses */
      if (requestId !== requestRef.current) return;

      const payload = response?.data?.data || {};
      const serverPagination = { ...EMPTY_PAGINATION, ...(payload.pagination || {}) };

      setRows(Array.isArray(payload.items) ? payload.items : []);
      setMeta(payload.meta || null);
      setPagination(serverPagination);

      /* only step back when the page no longer exists (e.g. after filtering) */
      if (page > serverPagination.last_page) {
        setPage(serverPagination.last_page);
      }
    } catch (error) {
      if (requestId !== requestRef.current) return;
      console.error("Failed to fetch audit trail:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load audit history."
      );
      /* keep existing pagination so the pager does not reset to page 1 */
      setRows([]);
    } finally {
      if (requestId === requestRef.current) setIsLoading(false);
    }
  }, [id, page, search, fromDate, toDate]);

  useEffect(() => {
    fetchAuditTrail();
  }, [fetchAuditTrail]);

  const hasFilters = Boolean(searchInput || fromDate || toDate);

  const handleClear = () => {
    setSearchInput("");
    setSearch("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const goToPage = (p) => {
    if (p < 1 || p > pagination.last_page || p === page) return;
    setPage(p);
  };

  const inputBase =
    "h-[42px] w-full rounded-[10px] border border-[#DCE3EA] bg-white px-3 text-[13px] text-[#243238] outline-none transition focus:border-[#56766D] focus:ring-2 focus:ring-[#56766D]/15";

  /* ───────── Render ───────── */
  return (
    <div className="min-h-full w-full bg-[var(--color-background)] px-4 pb-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* ═══════════════ HEADER ═══════════════ */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] border border-[#C7D8D2] bg-[#E8F0ED] text-[#56766D]">
              <Activity size={18} strokeWidth={1.9} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[20px] font-bold tracking-[-0.03em] text-[var(--color-text-primary)]">
                Audit History
              </h1>
              <p className="mt-0.5 text-[11px] font-medium text-[var(--color-text-secondary)]">
                View and track all changes made to this record.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/user/equipment-panel/${id}`)}
            className="shrink-0 rounded-[10px] border border-[#DCE3EA] bg-white px-4 py-1.5 text-[13px] font-medium text-[#344A43] shadow-sm transition hover:bg-[#F7FAF8]"
          >
            Exit
          </button>
        </div>

        {/* ═══════════════ RECORD INFO ═══════════════ */}
        <div className="mb-4 grid grid-cols-1 gap-3 rounded-[18px] border border-[#E4ECE8] bg-white p-3 shadow-[0_3px_14px_rgba(21,44,32,0.04)] sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard label="Process" value={meta?.process} />
          <InfoCard label="Instrument Name" value={meta?.instrument_name} />
          <InfoCard label="Instrument ID No." value={meta?.instrument_id_no} />
          <InfoCard label="Created On" value={meta?.created_at} />
        </div>

        {/* ═══════════════ FILTERS ═══════════════ */}
        <div className="mb-4 rounded-[18px] border border-[#E4ECE8] bg-white p-4 shadow-[0_3px_14px_rgba(21,44,32,0.04)]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr_1fr]">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#344A43]">
                Search
              </label>
              <div className="relative">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9992]"
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search action, field or username..."
                  className={`${inputBase} pl-9`}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#344A43]">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className={inputBase}
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#344A43]">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className={inputBase}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            disabled={!hasFilters}
            className="mt-4 inline-flex items-center gap-1.5 rounded-[10px] border border-[#DCE3EA] bg-white px-4 py-1.5 text-[13px] font-medium text-[#344A43] transition hover:bg-[#F7FAF8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={13} />
            Clear
          </button>
        </div>

        {/* ═══════════════ TABLE ═══════════════ */}
        <section className="overflow-hidden rounded-[18px] border border-[#E4ECE8] bg-white shadow-[0_3px_14px_rgba(21,44,32,0.04)]">
          {isLoading ? (
            <TableSkeleton />
          ) : rows.length === 0 ? (
            <div className="px-5 py-14 text-center text-[13px] text-slate-500">
              No audit records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#DCE8E2] bg-[#FAFCFB]">
                    {TABLE_HEADERS.map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#56766D]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[#EEF3F0] align-middle last:border-b-0 hover:bg-[#FAFCFB]"
                    >
                      <td className="px-5 py-3.5">
                        <Badge
                          className={
                            ACTION_STYLES[String(row.action).toLowerCase()] ||
                            DEFAULT_ACTION_STYLE
                          }
                        >
                          {display(row.action)}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge className="border-[#DCE3EA] bg-[#F3F4F6] text-[#526071]">
                          {display(row.field)}
                        </Badge>
                      </td>
                      <td className="max-w-[260px] break-words px-5 py-3.5 text-[12px] text-[#526071]">
                        {display(row.old_value)}
                      </td>
                      <td className="max-w-[260px] break-words px-5 py-3.5 text-[12px] font-semibold text-[#182234]">
                        {display(row.new_value)}
                      </td>
                      <td className="max-w-[220px] break-words px-5 py-3.5 text-[12px] text-[#526071]">
                        {display(row.remarks)}
                      </td>
                      <td className="px-5 py-3.5 text-[12px] font-semibold text-[#182234]">
                        {display(row.performed_by)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-[11.5px] text-[#3B6FA0]">
                        {display(row.performed_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ═══════════════ PAGINATION FOOTER ═══════════════ */}
          <div className="flex flex-col gap-3 border-t border-[#DCE8E2] bg-[#FAFCFB] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-[#6B7A74]">
              Showing{" "}
              <span className="font-bold text-[#243238]">{pagination.from}</span>
              {" - "}
              <span className="font-bold text-[#243238]">{pagination.to}</span>{" "}
              of{" "}
              <span className="font-bold text-[#243238]">{pagination.total}</span>{" "}
              results
            </p>

            {pagination.last_page > 1 && (
              <nav className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1 || isLoading}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[#DCE3EA] bg-white text-[#344A43] transition hover:bg-[#F7FAF8] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={15} />
                </button>

                {getPageNumbers(page, pagination.last_page).map((p, i) =>
                  p === "…" ? (
                    <span
                      key={`gap-${i}`}
                      className="px-1.5 text-[12px] text-[#8A9992]"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => goToPage(p)}
                      disabled={isLoading}
                      className={`h-8 min-w-8 rounded-md border px-2 text-[12px] font-semibold transition ${
                        p === page
                          ? "border-[#56766D] bg-[#56766D] text-white"
                          : "border-[#DCE3EA] bg-white text-[#344A43] hover:bg-[#F7FAF8]"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= pagination.last_page || isLoading}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[#DCE3EA] bg-white text-[#344A43] transition hover:bg-[#F7FAF8] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={15} />
                </button>
              </nav>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EquipmentAudit;