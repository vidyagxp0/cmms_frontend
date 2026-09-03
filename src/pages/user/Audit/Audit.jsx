import React, { useEffect, useState } from "react";
import { Activity, ArrowUpDown, Search, X } from "lucide-react";
import { useParams,useNavigate } from "react-router-dom";

import { getCalibrationAuditRecord } from "../../../services/usersApi/calibrationApi";

import Skeleton from "../../../components/common/Skeleton/Skeleton";

const Audit = () => {
  const navigate = useNavigate();
  const { recordId } = useParams();

  const [audits, setAudits] = useState([]);
  const [record, setRecord] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* pagnations */
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0,
  });

  /* filters */
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    if (!recordId) {
      return;
    }

    fetchAudits(pagination.current_page, search, fromDate, toDate);
  }, [recordId, pagination.current_page, search, fromDate, toDate]);

  const fetchAudits = async (
    page = 1,
    searchValue = search,
    fromDateValue = fromDate,
    toDateValue = toDate,
  ) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: page,
        per_page: 10,
      };

      if (searchValue.trim()) {
        params.search = searchValue.trim();
      }

      if (fromDateValue) {
        params.from_date = fromDateValue;
      }

      if (toDateValue) {
        params.to_date = toDateValue;
      }

      console.log("AUDIT REQUEST PARAMS:", params);

      const response = await getCalibrationAuditRecord(recordId, params);

      const apiData = response?.data?.data;

      console.log("AUDIT API DATA:", apiData);

      /* record data */
      if (apiData?.record) {
        setRecord(apiData.record);
      } else {
        setRecord(null);
      }

      /* audits */
      if (Array.isArray(apiData?.audits)) {
        setAudits(apiData.audits);
      } else {
        setAudits([]);
      }

      /* paginations */
      if (apiData?.pagination) {
        setPagination({
          current_page: Number(apiData.pagination.current_page) || 1,

          per_page: Number(apiData.pagination.per_page) || 10,

          total: Number(apiData.pagination.total) || 0,

          last_page: Number(apiData.pagination.last_page) || 1,

          from: Number(apiData.pagination.from) || 0,

          to: Number(apiData.pagination.to) || 0,
        });
      } else {
        setPagination({
          current_page: page,
          per_page: 10,
          total: apiData?.audits?.length || 0,
          last_page: 1,
          from: apiData?.audits?.length ? 1 : 0,
          to: apiData?.audits?.length || 0,
        });
      }
    } catch (err) {
      console.error("USER AUDIT ERROR:", err);
      console.error("USER AUDIT ERROR RESPONSE:", err?.response?.data);

      setError("Failed to load audit history.");
      setAudits([]);
    } finally {
      setLoading(false);
    }
  };

  /* clear filters */
  const handleClearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");

    setPagination((prev) => ({
      ...prev,
      current_page: 1,
    }));
  };

  const goToPage = (page) => {
    if (loading) {
      return;
    }

    if (
      page < 1 ||
      page > pagination.last_page ||
      page === pagination.current_page
    ) {
      return;
    }

    setPagination((prev) => ({
      ...prev,
      current_page: page,
    }));
  };

  const goToPreviousPage = () => {
    if (pagination.current_page > 1) {
      goToPage(pagination.current_page - 1);
    }
  };

  const goToNextPage = () => {
    if (pagination.current_page < pagination.last_page) {
      goToPage(pagination.current_page + 1);
    }
  };

  const getPageNumbers = () => {
    const totalPages = pagination.last_page;
    const currentPage = pagination.current_page;

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = [];

    pages.push(1);

    if (currentPage > 4) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);

    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    if (currentPage < totalPages - 3) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  const getActionStyle = (action) => {
    switch (action) {
      case "Created":
        return "border-[#BBE5C8] bg-[#EAFBF0] text-[#1F8A55]";

      case "Updated":
        return "border-[#F0DFA8] bg-[#FDF7E7] text-[#B4860B]";

      case "Deleted":
        return "border-[#F3C6C6] bg-[#FDEEEE] text-[#C23B3B]";

      case "Activity Performed":
        return "border-[#C7DBF2] bg-[#EEF4FC] text-[#2F6FB0]";

      case "Cancelled":
        return "border-[#F3C6C6] bg-[#FDEEEE] text-[#C23B3B]";

      default:
        return "border-[#DCE3EA] bg-[#F5F7FA] text-[#5A6472]";
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (typeof value === "object") {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }

    return String(value);
  };

  const isMultiline = (value) => {
    return typeof value === "object" && value !== null;
  };

  const columns = [
    {
      label: "Action",
      width: "w-[150px]",
    },

    {
      label: "Module / Field",
      width: "w-[190px]",
    },

    {
      label: "Old Value",
      width: "w-[270px]",
    },

    {
      label: "New Value",
      width: "w-[270px]",
    },

    {
      label: "Comment / Reason",
      width: "w-[230px]",
    },

    {
      label: "Responsible Person",
      width: "w-[170px]",
    },

    {
      label: "Date & Time",
      width: "w-[170px]",
    },
  ];

  const recordInfo = record || {};

  return (
    <div className="w-full">

      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#D8E1EA] bg-[#F0F5FA]">
              <Activity size={18} strokeWidth={2} className="text-[#2F6FB0]" />
            </span>

            <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-[#1D2939]">
              Audit History
            </h2>
          </div>

          <p className="pl-[46px] text-[12.5px] text-[#66707C]">
            View and track all changes made to this record.
          </p> 
        </div>
         {/* Exit Button */}
           <button
           onClick={() => navigate(-1)} 
           type="button" className="inline-flex h-9 items-center justify-center rounded-lg border border-[#D0D5DD] bg-white px-4 text-[12px] font-semibold text-[#475467] shadow-sm transition-all duration-200 hover:border-[#2F6FB0] hover:bg-[#F5F9FD] hover:text-[#2F6FB0] active:scale-95" > 
            Exit
             </button>
      </div>

      <div className="w-full">
        {loading ? (
          <div className="w-full overflow-hidden rounded-2xl border border-[#E3E8EF] bg-white p-4">
            <Skeleton variant="table" rows={6} columns={7} />
          </div>
        ) : error ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-[#F3C6C6] bg-[#FDEEEE] px-6 py-12 text-center">
            <p className="text-[12px] font-medium text-[#C43D3D]">{error}</p>
          </div>
        ) : (
          <>

            {record && (
              <div className="mb-5 grid grid-cols-1 gap-3 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)] sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-[#EDF0F4] bg-[#F9FAFC] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#8A94A3]">
                    Process
                  </p>

                  <p className="mt-1 text-[12px] font-semibold text-[#1D2939]">
                    {recordInfo.process || "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-[#EDF0F4] bg-[#F9FAFC] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#8A94A3]">
                    Department
                  </p>

                  <p className="mt-1 text-[12px] font-semibold text-[#1D2939]">
                    {recordInfo.department || "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-[#EDF0F4] bg-[#F9FAFC] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#8A94A3]">
                    Initiator
                  </p>

                  <p className="mt-1 text-[12px] font-semibold text-[#1D2939]">
                    {recordInfo.initiator || "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-[#EDF0F4] bg-[#F9FAFC] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#8A94A3]">
                    Initiation Date
                  </p>

                  <p className="mt-1 text-[12px] font-semibold text-[#1D2939]">
                    {recordInfo.initiation_date || "-"}
                  </p>
                </div>
              </div>
            )}

            <div className="mb-5 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                {/* SEARCH */}

                <div className="lg:col-span-2">
                  <label className="mb-1.5 block text-[11px] font-semibold text-[#475467]">
                    Search
                  </label>

                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);

                        setPagination((prev) => ({
                          ...prev,
                          current_page: 1,
                        }));
                      }}
                      placeholder="Search module, field or username..."
                      className="h-10 w-full rounded-lg border border-[#D0D5DD] bg-white pl-9 pr-3 text-[12px] text-[#344054] outline-none transition focus:border-[#2F6FB0] focus:ring-1 focus:ring-[#2F6FB0]"
                    />
                  </div>
                </div>

                {/* from date */}

                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-[#475467]">
                    From Date
                  </label>

                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);

                      setPagination((prev) => ({
                        ...prev,
                        current_page: 1,
                      }));
                    }}
                    className="h-10 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 text-[12px] text-[#344054] outline-none transition focus:border-[#2F6FB0] focus:ring-1 focus:ring-[#2F6FB0]"
                  />
                </div>

                {/* to date */}

                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-[#475467]">
                    To Date
                  </label>

                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);

                      setPagination((prev) => ({
                        ...prev,
                        current_page: 1,
                      }));
                    }}
                    className="h-10 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 text-[12px] text-[#344054] outline-none transition focus:border-[#2F6FB0] focus:ring-1 focus:ring-[#2F6FB0]"
                  />
                </div>
              </div>

              {/* FILTER BUTTONS */}

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#D0D5DD] bg-white px-4 text-[11.5px] font-semibold text-[#475467] transition hover:bg-[#F9FAFB]"
                >
                  <X size={14} />
                  Clear
                </button>
              </div>
            </div>

            <div className="w-full overflow-hidden rounded-2xl border border-[#E3E8EF] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
              <div className="w-full overflow-x-auto">
                <div className="max-h-[640px] overflow-y-auto">
                  <table className="w-full min-w-[1300px] border-collapse">
                    {/* HEADER */}

                    <thead className="sticky top-0 z-10">
                      <tr className="border-b border-[#D7E3EE] bg-[#EAF1F8]">
                        {columns.map((col) => (
                          <th
                            key={col.label}
                            className={`${col.width} px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.04em] text-[#1B3A5C]`}
                          >
                            <span className="inline-flex items-center gap-1.5">
                              {col.label}

                              <ArrowUpDown
                                size={11}
                                strokeWidth={2.25}
                                className="text-[#8FA6BE]"
                              />
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#EEF1F5]">
                      {audits.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center">
                            <p className="text-[12px] text-[#8A94A3]">
                              No audit records found.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        audits.map((audit, index) => (
                          <tr
                            key={`${audit.id}-${audit.module}-${index}`}
                            className="group border-l-4 border-l-transparent bg-white transition-colors hover:border-l-[#2F6FB0] hover:bg-[#EDF4FC]"
                          >

                            <td className="px-4 py-3.5 align-top">
                              <span
                                className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10.5px] font-semibold ${getActionStyle(
                                  audit.action,
                                )}`}
                              >
                                {audit.action || "-"}
                              </span>
                            </td>

                            <td className="px-4 py-3.5 align-top">
                              <span className="inline-flex w-fit max-w-full rounded-full border border-[#DCE3EA] bg-[#F5F7FA] px-2.5 py-1 text-[10.5px] font-semibold text-[#5A6472]">
                                {audit.module || "-"}
                              </span>
                            </td>

                            <td className="px-4 py-3.5 align-top">
                              <div
                                className={`max-w-[270px] whitespace-pre-wrap break-words text-[#66707C] ${
                                  isMultiline(audit.old_value)
                                    ? "rounded-md bg-[#F9FAFC] px-2 py-1.5 font-mono text-[10.5px] leading-4"
                                    : "text-[12px] leading-5"
                                }`}
                              >
                                {formatValue(audit.old_value)}
                              </div>
                            </td>

                            <td className="px-4 py-3.5 align-top">
                              <div
                                className={`max-w-[270px] whitespace-pre-wrap break-words text-[#1D2939] ${
                                  isMultiline(audit.new_value)
                                    ? "rounded-md bg-[#F9FAFC] px-2 py-1.5 font-mono text-[10.5px] leading-4"
                                    : "text-[12px] font-medium leading-5"
                                }`}
                              >
                                {formatValue(audit.new_value)}
                              </div>
                            </td>

                            {/* COMMENT / REASON */}

                            <td className="px-4 py-3.5 align-top">
                              <div className="max-w-[230px] whitespace-pre-wrap break-words text-[12px] leading-5 text-[#66707C]">
                                {formatValue(audit.comment)}
                              </div>
                            </td>

                            <td className="px-4 py-3.5 align-top">
                              <div className="whitespace-nowrap text-[12px] font-semibold text-[#1D2939]">
                                {audit.responsible_person || "-"}
                              </div>
                            </td>

                            {/* DATE */}

                            <td className="px-4 py-3.5 align-top">
                              <div className="whitespace-nowrap text-[11.5px] text-[#66707C]">
                                {audit.created_at || "-"}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-[#E3E8EF] bg-[#F9FAFC] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-[11.5px] text-[#66707C]">
                  Showing{" "}
                  <span className="font-semibold text-[#1D2939]">
                    {pagination.from || 0}
                  </span>
                  {" - "}
                  <span className="font-semibold text-[#1D2939]">
                    {pagination.to || 0}
                  </span>
                  {" of "}
                  <span className="font-semibold text-[#1D2939]">
                    {pagination.total || 0}
                  </span>
                  {" results"}
                </p>

                {pagination.last_page > 1 && (
                  <div className="flex items-center gap-1">

                    <button
                      type="button"
                      disabled={pagination.current_page === 1 || loading}
                      onClick={goToPreviousPage}
                      className="h-8 rounded-md border border-[#D0D5DD] bg-white px-3 text-[11px] font-medium text-[#475467] transition hover:bg-[#F2F4F7] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    {getPageNumbers().map((page, index) => {
                      if (page === "...") {
                        return (
                          <span
                            key={`dots-${index}`}
                            className="flex h-8 w-8 items-center justify-center text-[11px] text-[#667085]"
                          >
                            ...
                          </span>
                        );
                      }

                      return (
                        <button
                          key={page}
                          type="button"
                          disabled={loading}
                          onClick={() => goToPage(page)}
                          className={`h-8 min-w-8 rounded-md border px-2 text-[11px] font-semibold transition ${
                            pagination.current_page === page
                              ? "border-[#2F6FB0] bg-[#2F6FB0] text-white"
                              : "border-[#D0D5DD] bg-white text-[#475467] hover:bg-[#F2F4F7]"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      disabled={
                        pagination.current_page === pagination.last_page ||
                        loading
                      }
                      onClick={goToNextPage}
                      className="h-8 rounded-md border border-[#D0D5DD] bg-white px-3 text-[11px] font-medium text-[#475467] transition hover:bg-[#F2F4F7] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Audit;
