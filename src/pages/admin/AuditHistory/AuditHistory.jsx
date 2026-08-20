import React, { useEffect, useState } from "react";
import {
  Activity,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import { getAudits } from "../../../services/adminApis/auditApi";
import Dropdown from "../../../components/ui/Dropdown";
import { CalendarDays } from "lucide-react";

const AuditHistory = () => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [module, setModule] = useState("");
  const [action, setAction] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });

  useEffect(() => {
    fetchAudits();
  }, [page, search, module, action, fromDate, toDate]);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        per_page: perPage,
      };

      if (search) {
        params.search = search;
      }

      if (module) {
        params.module = module;
      }

      if (action) {
        params.action = action;
      }

      if (fromDate) {
        params.from_date = fromDate;
      }

      if (toDate) {
        params.to_date = toDate;
      }

      const response = await getAudits(params);

      const data = response?.data?.data;

      setAudits(data?.data || []);

      setPagination({
        current_page: data?.current_page || 1,
        last_page: data?.last_page || 1,
        total: data?.total || 0,
        from: data?.from || 0,
        to: data?.to || 0,
      });
    } catch (err) {
      console.error("Error fetching audits:", err);

      setError("Failed to load audit history.");
      setAudits([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setModule("");
    setAction("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const hasFilters = search || module || action || fromDate || toDate;

  const formatValue = (value) => {
    if (!value) {
      return "-";
    }

    if (typeof value === "object") {
      return Object.entries(value)
        .map(([key, val]) => {
          const formattedKey = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());

          let formattedValue = val;

          if (typeof val === "boolean") {
            formattedValue = val ? "Yes" : "No";
          }

          if (val === null || val === undefined) {
            formattedValue = "-";
          }

          return `${formattedKey}: ${formattedValue}`;
        })
        .join(" • ");
    }

    return String(value);
  };

  const getActionStyle = (action) => {
    switch (action) {
      case "Created":
        return "border-[#BFE0CC] bg-[#EDF8F1] text-[#17734C]";

      case "Updated":
        return "border-[#D8D1B8] bg-[#FCF8EE] text-[#9A7625]";

      case "Deleted":
        return "border-[#E5CCCC] bg-[#FEF3F3] text-[#B33A3A]";

      case "Status Updated":
        return "border-[#C9D9EA] bg-[#F1F6FC] text-[#426B94]";

      default:
        return "border-[#D6E8DE] bg-[#F5FAF7] text-[#3E5A4D]";
    }
  };

  return (
    <div className="w-full">
      {/* PAGE HEADER */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#B8D9C8] bg-[#EEF8F2]">
              <Activity size={18} strokeWidth={2} className="text-[#17734C]" />
            </span>

            <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-[#152C20]">
              Audit History
            </h1>
          </div>

          <p className="pl-[46px] text-[12.5px] text-[#5C7A6C]">
            View and track your activity and system changes.
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="mb-4 w-full rounded-2xl border border-[#CBE3D6] bg-white p-4 shadow-[0_10px_30px_-18px_rgba(21,44,32,0.35)]">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-[#17734C]" />

            <span className="text-[12px] font-semibold text-[#152C20]">
              Filters
            </span>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-[11px] font-medium text-[#B33A3A] transition-colors hover:text-[#8F2E2E]"
            >
              <X size={13} />
              Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">

            {/* SEARCH */}
            <div className="relative">
                <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA79B]"
                />

                <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    placeholder="Search..."
                    className="h-[46px] w-full rounded-[10px] border border-[#CBE3D6] bg-[#F9FCFA] pl-9 pr-3 text-[12px] text-[#152C20] outline-none transition-all placeholder:text-[#94A79E] focus:border-[#79B89A] focus:bg-white focus:ring-2 focus:ring-[#1F8A5F]/[0.07]"
                />
            </div>

            {/* MODULE */}
            <Dropdown
                value={module}
                options={[
                    {
                        value: "Department",
                        label: "Department",
                    },
                    {
                        value: "Role",
                        label: "Role",
                    },
                    {
                        value: "User",
                        label: "User",
                    },
                ]}
                placeholder="All Modules"
                onChange={(value) => {
                    setModule(value);
                    setPage(1);
                }}
            />

            {/* ACTION */}
            <Dropdown
                value={action}
                options={[
                    {
                        value: "Created",
                        label: "Created",
                    },
                    {
                        value: "Updated",
                        label: "Updated",
                    },
                    {
                        value: "Deleted",
                        label: "Deleted",
                    },
                    {
                        value: "Status Updated",
                        label: "Status Updated",
                    },
                ]}
                placeholder="All Actions"
                onChange={(value) => {
                    setAction(value);
                    setPage(1);
                }}
            />

            {/* FROM DATE */}
            <div className="relative">
                <CalendarDays
                    size={15}
                    strokeWidth={1.8}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71877C]"
                />

                <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                        setFromDate(e.target.value);
                        setPage(1);
                    }}
                    className="h-[46px] w-full appearance-none rounded-[10px] border border-[#CBE3D6] bg-[#F9FCFA] pl-10 pr-3.5 text-[12px] text-[#3E5A4D] outline-none transition-all focus:border-[#79B89A] focus:bg-white focus:ring-2 focus:ring-[#1F8A5F]/[0.07]"
                />
            </div>

            {/* TO DATE */}
            <div className="relative">
                <CalendarDays
                    size={15}
                    strokeWidth={1.8}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71877C]"
                />

                <input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                        setToDate(e.target.value);
                        setPage(1);
                    }}
                    className="h-[46px] w-full appearance-none rounded-[10px] border border-[#CBE3D6] bg-[#F9FCFA] pl-10 pr-3.5 text-[12px] text-[#3E5A4D] outline-none transition-all focus:border-[#79B89A] focus:bg-white focus:ring-2 focus:ring-[#1F8A5F]/[0.07]"
                />
            </div>

        </div>
      </div>

      {/* TABLE */}
      <div className="w-full overflow-hidden rounded-2xl border border-[#CBE3D6] bg-white shadow-[0_10px_30px_-18px_rgba(21,44,32,0.35)]">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#F3F9F5]">
                <th className="w-[80px] border-b border-[#E3F0E8] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                  S.No
                </th>

                <th className="border-b border-[#E3F0E8] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                  Module
                </th>

                <th className="border-b border-[#E3F0E8] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                  Action
                </th>

                <th className="border-b border-[#E3F0E8] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                  Old Values
                </th>

                <th className="border-b border-[#E3F0E8] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                  New Values
                </th>

                <th className="border-b border-[#E3F0E8] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                  Responsible Person
                </th>

                <th className="border-b border-[#E3F0E8] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                  Date & Time
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E3F0E8]">
              {/* LOADING */}
              {loading && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-[12px] font-medium text-[#5C7A6C]">
                      <Loader2
                        size={16}
                        className="animate-spin text-[#17734C]"
                      />
                      Loading audit history...
                    </div>
                  </td>
                </tr>
              )}

              {/* ERROR */}
              {!loading && error && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-[12px] font-medium text-[#C43D3D]"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {/* EMPTY */}
              {!loading && !error && audits.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-[12px] text-[#8FA79B]"
                  >
                    No audit records found.
                  </td>
                </tr>
              )}

              {/* AUDITS */}
              {!loading &&
                !error &&
                audits.map((audit, index) => (
                  <tr
                    key={audit.id}
                    className="transition-colors duration-150 hover:bg-[#F6FBF8]"
                  >
                    <td className="px-5 py-4 text-[12.5px] font-medium text-[#5C7A6C]">
                      {String(pagination.from + index).padStart(2, "0")}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full border border-[#D6E8DE] bg-[#F5FAF7] px-2.5 py-1 text-[11px] font-semibold text-[#3E5A4D]">
                        {audit.module}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10.5px] font-semibold ${getActionStyle(
                          audit.action,
                        )}`}
                      >
                        {audit.action}
                      </span>
                    </td>

                    <td className="max-w-[280px] px-5 py-4">
                      {audit.old_value ? (
                        <div className="flex flex-col gap-1">
                          {Object.entries(audit.old_value).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="text-[11px] text-[#8A625F]"
                              >
                                <span className="font-semibold">
                                  {key.replace(/_/g, " ")}:
                                </span>{" "}
                                {typeof value === "boolean"
                                  ? value
                                    ? "Yes"
                                    : "No"
                                  : (value ?? "-")}
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#9AAEA4]">-</span>
                      )}
                    </td>

                    <td className="max-w-[280px] px-5 py-4">
                      {audit.new_value ? (
                        <div className="flex flex-col gap-1">
                          {Object.entries(audit.new_value).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="text-[11px] text-[#3E6B53]"
                              >
                                <span className="font-semibold">
                                  {key.replace(/_/g, " ")}:
                                </span>{" "}
                                {typeof value === "boolean"
                                  ? value
                                    ? "Yes"
                                    : "No"
                                  : (value ?? "-")}
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#9AAEA4]">-</span>
                      )}
                    </td>
                    
                    <td className="whitespace-nowrap px-5 py-4 text-[11.5px] text-[#5C7A6C]">
                      {audit.user_name}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-[11.5px] text-[#5C7A6C]">
                      {audit.created_at}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER / PAGINATION */}
      {!loading && !error && audits.length > 0 && (
        <div className="mt-3 flex items-center justify-between px-1">
          <p className="text-[11.5px] text-[#8FA79B]">
            Showing{" "}
            <span className="font-semibold text-[#5C7A6C]">
              {pagination.from}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-[#5C7A6C]">
              {pagination.to}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#5C7A6C]">
              {pagination.total}
            </span>{" "}
            audits
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.current_page === 1}
              onClick={() => setPage(pagination.current_page - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#CBE3D6] bg-white text-[#5C7A6C] transition-all hover:bg-[#F1F9F4] hover:text-[#17734C] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>

            <div className="flex h-8 min-w-8 items-center justify-center rounded-[8px] border border-[#176B49] bg-[#17734C] px-2 text-[11px] font-semibold text-white">
              {pagination.current_page}
            </div>

            <button
              type="button"
              disabled={pagination.current_page === pagination.last_page}
              onClick={() => setPage(pagination.current_page + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#CBE3D6] bg-white text-[#5C7A6C] transition-all hover:bg-[#F1F9F4] hover:text-[#17734C] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditHistory;
