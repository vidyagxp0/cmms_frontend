import React, { useEffect, useState } from "react";
import { Activity, ArrowUpDown, Search, X, FileText } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

import Skeleton from "../../../components/common/Skeleton/Skeleton";
import CustomScrollContainer from "../../../components/common/CustomScrollbar/CustomScrollContainer";
import { getPreventiveAuditListing } from "../../../services/usersApi/preventive";
import { getCalibrationAuditReport } from "../../../services/usersApi/calibrationApi";

const Audit = () => {
  const navigate = useNavigate();
  const { recordId } = useParams();

  const [audits, setAudits] = useState([]);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0,
  });

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    if (!recordId) {
      setLoading(false);
      setError("Record ID is missing.");
      return;
    }

    fetchAudits(pagination.current_page, search, fromDate, toDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId, pagination.current_page, search, fromDate, toDate]);

  const fetchAudits = async (
    page = 1,
    searchValue = search,
    fromDateValue = fromDate,
    toDateValue = toDate
  ) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
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

      const response = await getPreventiveAuditListing(recordId, params);
      const apiData = response?.data?.data;

      setRecord(apiData?.record || null);
      setAudits(Array.isArray(apiData?.audits) ? apiData.audits : []);

      if (apiData?.pagination) {
        setPagination((previous) => ({
          ...previous,
          current_page: Number(apiData.pagination.current_page) || page,
          per_page: Number(apiData.pagination.per_page) || 10,
          total: Number(apiData.pagination.total) || 0,
          last_page: Number(apiData.pagination.last_page) || 1,
          from: Number(apiData.pagination.from) || 0,
          to: Number(apiData.pagination.to) || 0,
        }));
      } else {
        const count = apiData?.audits?.length || 0;

        setPagination((previous) => ({
          ...previous,
          current_page: page,
          per_page: 10,
          total: count,
          last_page: 1,
          from: count ? 1 : 0,
          to: count,
        }));
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

  const handleViewReport = async (recordId) => {
    if (!recordId) {
        alert("Process record ID is missing.");
        return;
    }

    // Open the tab immediately to avoid popup blocking.
    const reportWindow = window.open("", "_blank");

    if (!reportWindow) {
        alert("Please allow pop-ups to view the report.");
        return;
    }

    try {
        reportWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Loading Audit Report...</title>
                <style>
                    body {
                        margin: 0;
                        height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-family: Arial, sans-serif;
                        color: #475569;
                    }
                    .loader {
                        text-align: center;
                    }
                    .spinner {
                        width: 32px;
                        height: 32px;
                        margin: 0 auto 16px;
                        border: 3px solid #e2e8f0;
                        border-top-color: #F28C00;
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                </style>
            </head>
            <body>
                <div class="loader">
                    <div class="spinner"></div>
                    <p>Generating Audit Report...</p>
                </div>
            </body>
            </html>
        `);

        reportWindow.document.close();

        const response = await getCalibrationAuditReport(recordId);

        const blob = new Blob([response.data], {
            type: "application/pdf",
        });

        const pdfUrl = window.URL.createObjectURL(blob);

        reportWindow.location.href = pdfUrl;

        // Keep the URL available while the PDF is being viewed.
        reportWindow.addEventListener("beforeunload", () => {
            window.URL.revokeObjectURL(pdfUrl);
        }, { once: true });

    } catch (error) {
        console.error("Failed to generate Audit Report:", error);

        if (!reportWindow.closed) {
            reportWindow.document.open();
            reportWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Audit Report Error</title>
                </head>
                <body style="font-family:Arial,sans-serif;text-align:center;padding:60px;">
                    <h3 style="color:#b91c1c;">Failed to generate Audit Report</h3>
                    <p>Please close this tab and try again.</p>
                </body>
                </html>
            `);
            reportWindow.document.close();
        }
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");

    setPagination((previous) => ({
      ...previous,
      current_page: 1,
    }));
  };

  const goToPage = (page) => {
    if (
      loading ||
      page < 1 ||
      page > pagination.last_page ||
      page === pagination.current_page
    ) {
      return;
    }

    setPagination((previous) => ({
      ...previous,
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
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    const pages = [1];

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

  const MONTH_NAMES = {
    Jan: "January",
    Feb: "February",
    Mar: "March",
    Apr: "April",
    May: "May",
    Jun: "June",
    Jul: "July",
    Aug: "August",
    Sep: "September",
    Oct: "October",
    Nov: "November",
    Dec: "December",
  };

  const formatWeeklyPreventiveAudit = (value) => {
    if (
      typeof value !== "string" ||
      !value.toLowerCase().includes("weekly preventive")
    ) {
      return null;
    }

    const result = [];
    const lines = value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    lines.forEach((rawLine, index) => {
      const line = rawLine
        .replace(/^Weekly Preventive(?: Schedule)?\s*:\s*/i, "")
        .trim();

      const readableMatch = line.match(
        /^(.+?)\s+[—-]\s+Week\s+(\d+)\s+[—-]\s+Date:\s*(.*?)\s+[—-]\s+Planned\s*\(P\):\s*(.*?)\s+[—-]\s+Actual\s*\(A\):\s*(.*)$/i
      );

      if (readableMatch) {
        result.push({
          id: `weekly-${index}-${readableMatch[1]}-${readableMatch[2]}`,
          month: readableMatch[1].trim(),
          weekNumber: Number(readableMatch[2]),
          date: readableMatch[3].trim() || "-",
          planned: readableMatch[4].trim() || "-",
          actual: readableMatch[5].trim() || "-",
        });

        return;
      }

      const legacyMatch = line.match(
        /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*:\s*(\d+)\s*:\s*Planned\s*:\s*(.*?)(?:\s+Actual\s*:\s*(.*))?$/i
      );

      if (legacyMatch) {
        result.push({
          id: `legacy-${index}-${legacyMatch[1]}-${legacyMatch[2]}`,
          month: MONTH_NAMES[legacyMatch[1]] || legacyMatch[1],
          weekNumber: Number(legacyMatch[2]) + 1,
          date: "",
          planned: legacyMatch[3]?.trim() || "-",
          actual: legacyMatch[4]?.trim() || "-",
        });
      }
    });

    return result.length ? result : null;
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return value.length ? JSON.stringify(value, null, 2) : "-";
      }

      return JSON.stringify(value, null, 2);
    }

    return String(value);
  };

  const renderAuditValue = (value) => {
    const weeklyData = formatWeeklyPreventiveAudit(value);

    if (weeklyData) {
      return (
        <div className="space-y-2">
          {weeklyData.map((item) => (
            <div
              key={item.id}
              className="rounded-md border border-[#E3E8EF] bg-[#F9FAFC] p-2"
            >
              <div className="mb-1 text-[11px] font-semibold text-[#2F6FB0]">
                {item.month} — Week {item.weekNumber}
                {item.date ? ` — ${item.date}` : ""}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="font-semibold text-[#66707C]">
                    Planned (P):
                  </span>{" "}
                  <span className="font-semibold text-[#1D2939]">
                    {item.planned}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-[#66707C]">
                    Actual (A):
                  </span>{" "}
                  <span className="font-semibold text-[#1D2939]">
                    {item.actual}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return formatValue(value);
  };

  const parseAttachmentValue = (value) => {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      try {
        const parsedValue = JSON.parse(value);

        if (Array.isArray(parsedValue)) {
          return parsedValue;
        }

        if (Array.isArray(parsedValue?.attachments)) {
          return parsedValue.attachments;
        }
      } catch {
        return [];
      }
    }

    return [];
  };

  const isAttachmentValue = (value) => {
    const attachments = parseAttachmentValue(value);

    return (
      Array.isArray(attachments) &&
      attachments.length > 0 &&
      attachments.some(
        (item) =>
          item &&
          typeof item === "object" &&
          (item.name ||
            item.Name ||
            item.path ||
            item.Path ||
            item.url ||
            item.Url)
      )
    );
  };

  const getAttachmentUrl = (attachment) => {
    const path = attachment?.path || attachment?.Path || "";
    const backendUrl = "http://cmms-api.mydemosoftware.com";

    if (path) {
      if (/^https?:\/\//i.test(path)) {
        return path;
      }

      return `${backendUrl}/${path.replace(/^\/+/, "")}`;
    }

    return attachment?.url || attachment?.Url || "";
  };

  const renderAttachmentValue = (value) => {
    const attachments = parseAttachmentValue(value);

    if (!attachments.length) {
      return "-";
    }

    return (
      <div className="flex flex-col gap-1.5">
        {attachments.map((attachment, index) => {
          const attachmentName =
            attachment?.name ||
            attachment?.Name ||
            attachment?.file_name ||
            attachment?.["File Name"] ||
            "Attachment";

          const attachmentUrl = getAttachmentUrl(attachment);

          return (
            <a
              key={`${attachmentName}-${index}`}
              href={attachmentUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => {
                if (!attachmentUrl) {
                  event.preventDefault();
                }
              }}
              className="block break-words text-[12px] font-medium text-[#2F6FB0] underline decoration-[#B8CCE0] underline-offset-2 hover:text-[#1D4F80] hover:decoration-[#2F6FB0]"
            >
              {attachmentName}
            </a>
          );
        })}
      </div>
    );
  };

  const isMultiline = (value) => {
    return typeof value === "object" && value !== null;
  };

  const columns = [
    { label: "Action", width: "w-[150px]" },
    { label: "Module / Field", width: "w-[190px]" },
    { label: "Old Value", width: "w-[270px]" },
    { label: "New Value", width: "w-[270px]" },
    { label: "Comment / Reason", width: "w-[230px]" },
    { label: "Responsible Person", width: "w-[170px]" },
    { label: "Date & Time", width: "w-[170px]" },
  ];

  const recordInfo = record || {};

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#D8E1EA] bg-[#F0F5FA]">
              <Activity
                size={18}
                strokeWidth={2}
                className="text-[#2F6FB0]"
              />
            </span>

            <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-[#1D2939]">
              {recordInfo.process} Audit History
            </h2>
          </div>

          <p className="pl-[46px] text-[12.5px] text-[#66707C]">
            View and track all changes made to this record.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* AUDIT REPORT BUTTON */}
          <button
              type="button"
              onClick={() => handleViewReport(recordId)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#C9D9D3] bg-[#EEF4F1] px-4 text-sm font-semibold text-[#56766D] transition hover:bg-[#E2ECE8]"
          >
              {/* <Eye size={15} /> */}
              <span>Audit Report</span>
          </button>

          {/* EXIT BUTTON */}
          <button
            onClick={() => navigate(-1)}
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[#D0D5DD] bg-white px-4 text-[12px] font-semibold text-[#475467] shadow-sm transition-all duration-200 hover:border-[#2F6FB0] hover:bg-[#F5F9FD] hover:text-[#2F6FB0] active:scale-95"
          >
            Exit
          </button>
        </div>
      </div>

      <div className="w-full">
        {loading ? (
          <div className="w-full overflow-hidden rounded-2xl border border-[#E3E8EF] bg-white p-4">
            <Skeleton variant="table" rows={6} columns={7} />
          </div>
        ) : error ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-[#F3C6C6] bg-[#FDEEEE] px-6 py-12 text-center">
            <p className="text-[12px] font-medium text-[#C43D3D]">
              {error}
            </p>
          </div>
        ) : (
          <>
            {/* RECORD INFORMATION */}
            {record && (
              <div className="mb-5 grid grid-cols-1 gap-3 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)] sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Process", recordInfo.process],
                  ["Department", recordInfo.department],
                  ["Initiator", recordInfo.initiator],
                  ["Initiation Date", recordInfo.initiation_date],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-[#EDF0F4] bg-[#F9FAFC] px-4 py-3"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#8A94A3]">
                      {label}
                    </p>

                    <p className="mt-1 text-[12px] font-semibold text-[#1D2939]">
                      {value || "-"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* FILTERS */}
            <div className="mb-5 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
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
                      onChange={(event) => {
                        setSearch(event.target.value);

                        setPagination((previous) => ({
                          ...previous,
                          current_page: 1,
                        }));
                      }}
                      placeholder="Search module, field or username..."
                      className="h-10 w-full rounded-lg border border-[#D0D5DD] bg-white pl-9 pr-3 text-[12px] text-[#344054] outline-none transition focus:border-[#2F6FB0] focus:ring-1 focus:ring-[#2F6FB0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-[#475467]">
                    From Date
                  </label>

                  <input
                    type="date"
                    value={fromDate}
                    onChange={(event) => {
                      setFromDate(event.target.value);

                      setPagination((previous) => ({
                        ...previous,
                        current_page: 1,
                      }));
                    }}
                    className="h-10 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 text-[12px] text-[#344054] outline-none transition focus:border-[#2F6FB0] focus:ring-1 focus:ring-[#2F6FB0]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-[#475467]">
                    To Date
                  </label>

                  <input
                    type="date"
                    value={toDate}
                    onChange={(event) => {
                      setToDate(event.target.value);

                      setPagination((previous) => ({
                        ...previous,
                        current_page: 1,
                      }));
                    }}
                    className="h-10 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 text-[12px] text-[#344054] outline-none transition focus:border-[#2F6FB0] focus:ring-1 focus:ring-[#2F6FB0]"
                  />
                </div>
              </div>

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

            {/* AUDIT TABLE */}
            <div className="w-full overflow-hidden rounded-2xl border border-[#E3E8EF] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
              <CustomScrollContainer
                maxHeight="640px"
                direction="both"
                className="w-full"
              >
                <table className="w-full min-w-[1300px] border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-[#D7E3EE] bg-[#EAF1F8]">
                      {columns.map((column) => (
                        <th
                          key={column.label}
                          className={`${column.width} px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.04em] text-[#1B3A5C]`}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {column.label}
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
                                audit.action
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
                              {isAttachmentValue(audit.old_value)
                                ? renderAttachmentValue(audit.old_value)
                                : renderAuditValue(audit.old_value)}
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
                              {isAttachmentValue(audit.new_value)
                                ? renderAttachmentValue(audit.new_value)
                                : renderAuditValue(audit.new_value)}
                            </div>
                          </td>

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
              </CustomScrollContainer>

              {/* PAGINATION */}
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