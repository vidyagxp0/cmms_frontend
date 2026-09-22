import React, { useState } from "react";
import {
  Checkbox,
  DatePicker,
  Input,
  InputNumber,
  Radio,
  Select,
  TimePicker,
} from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import ESignModal from "../ESignModal/ESignModal";
import CheckboxEsignModal from "../ESignModal/CheckboxEsignModal";

dayjs.extend(customParseFormat);

const { TextArea } = Input;

const DATE_FORMAT = "DD/MM/YYYY";
const TIME_FORMAT = "HH:mm";
const DATETIME_FORMAT = "DD/MM/YYYY HH:mm";
const SIGN_FORMAT = "DD/MM/YYYY HH:mm";

const inputClass =
  "!w-full !rounded-lg !border-[#D1DBD7] !bg-white !text-[12px] !text-[#263B35] !shadow-none hover:!border-[#A8B9B2] focus:!border-[#4E7585] disabled:!bg-[#F3F6F4]";

/* ── Shared option-list shell for radio/checkbox modes ── */
const OptionsShell = ({ children }) => (
  <div className="flex flex-col gap-1.5 rounded-lg border border-[#E1E7E4] bg-white p-2">
    {children}
  </div>
);

/* ── A single option row (radio) ── */
const OptionRow = ({ checked, disabled, onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`flex w-full items-start gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors ${
      checked ? "bg-[#EEF4F1]" : "hover:bg-[#F5F8F6]"
    } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
  >
    <span className="mt-[1px] flex h-[16px] w-[16px] shrink-0 items-center justify-center">
      {checked ? (
        <span className="flex h-[16px] w-[16px] items-center justify-center rounded-full border-[5px] border-[#4E7585] bg-white" />
      ) : (
        <span className="h-[16px] w-[16px] rounded-full border border-[#B9C4BF] bg-white" />
      )}
    </span>
    <span className="text-[12px] font-medium leading-5 text-[#263B35]">
      {label}
    </span>
  </button>
);

/* ── A single option row (checkbox) ── */
const CheckOptionRow = ({ checked, disabled, onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`flex w-full items-start gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors ${
      checked ? "bg-[#EEF4F1]" : "hover:bg-[#F5F8F6]"
    } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
  >
    <span
      className={`mt-[1px] flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
        checked
          ? "border-[#4E7585] bg-[#4E7585]"
          : "border-[#B9C4BF] bg-white"
      }`}
    >
      {checked && (
        <svg
          viewBox="0 0 12 12"
          className="h-[10px] w-[10px] text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M2.5 6.2 L4.8 8.5 L9.5 3.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
    <span className="text-[12px] font-medium leading-5 text-[#263B35]">
      {label}
    </span>
  </button>
);

/* ── Signed display for eSign cells ── */
const SignedDisplay = ({ signedBy, signedAt, authenticated, disabled, onClear }) => (
  <div className="flex flex-col gap-2 rounded-lg border border-[#B7D8C4] bg-[#F0F8F2] p-2.5">
    <div className="flex items-start gap-2">
      <CheckCircle2
        size={16}
        strokeWidth={2}
        className="mt-[1px] shrink-0 text-[#3F8B5C]"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-[#2F6B46]">
          {authenticated ? "Authenticated eSign" : "Signed"}
        </p>
        <p className="mt-0.5 truncate text-[11.5px] font-semibold text-[#1F3B2C]">
          {signedBy}
        </p>
        <p className="mt-0.5 text-[10.5px] font-medium text-[#5C7A69]">
          {signedAt}
        </p>
      </div>
    </div>
    {!disabled && (
      <button
        type="button"
        onClick={onClear}
        className="self-start rounded-md border border-[#B7D8C4] bg-white px-2 py-1 text-[10px] font-semibold text-[#3F8B5C] transition-colors hover:bg-[#E5F3EA]"
      >
        Clear sign
      </button>
    )}
  </div>
);

/* ───────────────────────── Main component ───────────────────────── */

const ChecklistInput = ({
  data,
  value = {},
  onChange,
  disabled = false,
}) => {
  const user = useAuthStore((s) => s.user);

  // { questionId, columnId, esignType } when modal is open
  const [esignModal, setEsignModal] = useState(null);

  if (!data) return null;

  const {
    checklist_name = "",
    include_serial_number = false,
    question_columns = [],
    data_columns = [],
    questions = [],
  } = data;

  const answers = value || {};

  const setAnswer = (questionId, columnId, val) => {
    const next = {
      ...answers,
      [questionId]: {
        ...(answers[questionId] || {}),
        [columnId]: val,
      },
    };
    onChange?.(next);
  };

  // values / data_cells keys may be numeric or string
  const pick = (obj, id) =>
    obj?.[id] !== undefined ? obj[id] : obj?.[String(id)];

  const hasAnyFrequency = questions.some((q) => q.frequency_enabled);

  /* ── eSign helpers ── */
  const buildSignPayload = (authenticated) => ({
    checked: true,
    authenticated,
    signed_by: user?.name || user?.email || "Unknown User",
    signed_at: dayjs().format(SIGN_FORMAT),
  });

  const openAuthenticatedSign = (questionId, columnId) => {
    setEsignModal({ questionId, columnId });
  };

  const handleEsignVerified = ({ signed_by, signed_at }) => {
    if (!esignModal) return;
    const { questionId, columnId } = esignModal;
    setAnswer(questionId, columnId, {
      checked: true,
      authenticated: true,
      signed_by,
      signed_at: dayjs(signed_at).format(SIGN_FORMAT),
    });
    setEsignModal(null);
  };

  const clearSign = (questionId, columnId) => {
    setAnswer(questionId, columnId, null);
  };

  /* ── Cell renderer ── */
  const renderCell = (questionId, columnId, cell) => {
    const fieldType = cell?.field_type || "text";
    const options = cell?.options || [];
    const current = answers?.[questionId]?.[columnId];

    const update = (val) => setAnswer(questionId, columnId, val);

    // Options as { label, value } for antd Select
    const optionList = options.map((o) => ({
      label: o.value,
      value: o.id,
    }));

    switch (fieldType) {
      case "textarea":
        return (
          <TextArea
            rows={3}
            value={current || ""}
            onChange={(e) => update(e.target.value)}
            disabled={disabled}
            placeholder="Enter..."
            className={`${inputClass} !resize-none !px-3 !py-2`}
          />
        );

      case "number":
        return (
          <InputNumber
            value={current ?? null}
            onChange={(val) => update(val)}
            disabled={disabled}
            placeholder="0"
            className={`${inputClass} !h-9 !px-2`}
            style={{ width: "100%" }}
          />
        );

      case "date":
        return (
          <DatePicker
            value={current ? dayjs(current, DATE_FORMAT) : null}
            onChange={(d) => update(d ? d.format(DATE_FORMAT) : "")}
            disabled={disabled}
            format={DATE_FORMAT}
            placeholder="Select date"
            className={`${inputClass} !h-9`}
            style={{ width: "100%" }}
          />
        );

      case "time":
        return (
          <TimePicker
            value={current ? dayjs(current, TIME_FORMAT) : null}
            onChange={(t) => update(t ? t.format(TIME_FORMAT) : "")}
            disabled={disabled}
            format={TIME_FORMAT}
            placeholder="Select time"
            className={`${inputClass} !h-9`}
            style={{ width: "100%" }}
          />
        );

      case "datetime":
        return (
          <DatePicker
            showTime
            value={current ? dayjs(current, DATETIME_FORMAT) : null}
            onChange={(d) => update(d ? d.format(DATETIME_FORMAT) : "")}
            disabled={disabled}
            format={DATETIME_FORMAT}
            placeholder="Select date & time"
            className={`${inputClass} !h-9`}
            style={{ width: "100%" }}
          />
        );

      case "checkbox": {
        const variant = cell?.checkbox_variant || "normal";

        /* Normal checkbox — original behaviour */
        if (variant !== "esign") {
          return (
            <Checkbox
              checked={!!current}
              onChange={(e) => update(e.target.checked)}
              disabled={disabled}
            />
          );
        }

        const esignType = cell?.esign_type || "simple";
        const isAuthenticated = esignType === "authenticated";
        const signed = current && typeof current === "object" && current.checked;

        /* Already signed — show the badge */
        if (signed) {
          return (
            <SignedDisplay
              signedBy={current.signed_by}
              signedAt={current.signed_at}
              authenticated={isAuthenticated}
              disabled={disabled}
              onClear={() => clearSign(questionId, columnId)}
            />
          );
        }

        /* Not yet signed — button */
        return (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (disabled) return;
              if (isAuthenticated) {
                openAuthenticatedSign(questionId, columnId);
              } else {
                update(buildSignPayload(false));
              }
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg border border-[#D1DBD7] bg-white px-3 py-2.5 text-left transition-all ${
              disabled
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:border-[#4E7585] hover:bg-[#F5F8F6]"
            }`}
          >
            <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border border-[#B9C4BF] bg-white" />
            <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#263B35]">
              <ShieldCheck size={13} strokeWidth={1.9} className="text-[#4E7585]" />
              {isAuthenticated ? "Authenticate & Sign" : "Sign"}
            </span>
          </button>
        );
      }

      case "single_select":
        return (
          <Select
            value={current ?? undefined}
            onChange={(val) => update(val)}
            options={optionList}
            disabled={disabled}
            placeholder="Select..."
            allowClear
            className={`${inputClass} !h-9`}
            style={{ width: "100%" }}
          />
        );

      case "multi_select":
        return (
          <Select
            mode="multiple"
            value={Array.isArray(current) ? current : []}
            onChange={(val) => update(val)}
            options={optionList}
            disabled={disabled}
            placeholder="Select..."
            allowClear
            className={inputClass}
            style={{ width: "100%" }}
          />
        );

      case "single_select_checkbox": {
        if (options.length === 0) {
          return (
            <p className="rounded-md border border-dashed border-[#E0E6E3] bg-[#FAFBFA] px-3 py-2 text-[10.5px] font-medium italic text-[#9AA5A1]">
              No options configured
            </p>
          );
        }
        return (
          <OptionsShell>
            {options.map((opt) => (
              <OptionRow
                key={opt.id}
                checked={current === opt.id}
                disabled={disabled}
                onClick={() => !disabled && update(opt.id)}
                label={opt.value}
              />
            ))}
          </OptionsShell>
        );
      }

      case "multi_select_checkbox": {
        if (options.length === 0) {
          return (
            <p className="rounded-md border border-dashed border-[#E0E6E3] bg-[#FAFBFA] px-3 py-2 text-[10.5px] font-medium italic text-[#9AA5A1]">
              No options configured
            </p>
          );
        }
        const arr = Array.isArray(current) ? current : [];
        return (
          <OptionsShell>
            {options.map((opt) => {
              const checked = arr.includes(opt.id);
              return (
                <CheckOptionRow
                  key={opt.id}
                  checked={checked}
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    const next = checked
                      ? arr.filter((v) => v !== opt.id)
                      : [...arr, opt.id];
                    update(next);
                  }}
                  label={opt.value}
                />
              );
            })}
          </OptionsShell>
        );
      }

      case "text":
      default:
        return (
          <Input
            value={current || ""}
            onChange={(e) => update(e.target.value)}
            disabled={disabled}
            placeholder="Enter value..."
            className={`${inputClass} !h-9 !px-3`}
          />
        );
    }
  };

  return (
    <>
      <div className="w-full overflow-hidden rounded-xl border border-[#CCD8D3] bg-white shadow-[0_5px_20px_rgba(38,53,46,0.055)]">
        {/* Header */}
        <div className="border-b border-[#D7E0DC] bg-[#F7F9F8] px-5 py-3">
          <h3 className="text-[13px] font-bold tracking-[0.02em] text-[#263B35]">
            {checklist_name || "Checklist"}
          </h3>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr className="bg-[#EEF3F1]">
                {include_serial_number && (
                  <th className="w-[60px] border-b border-r border-[#D5DFDB] px-3 py-3 text-center text-[11px] font-bold tracking-[0.01em] text-[#43564F]">
                    Sr. No
                  </th>
                )}
                {question_columns.map((col) => (
                  <th
                    key={col.id}
                    className="border-b border-r border-[#D5DFDB] px-3 py-3 text-left align-middle text-[11px] font-bold tracking-[0.01em] text-[#43564F]"
                  >
                    {col.column_header}
                  </th>
                ))}

                {hasAnyFrequency && (
                  <th className="w-[130px] border-b border-r border-[#D5DFDB] px-3 py-3 text-left align-middle text-[11px] font-bold tracking-[0.01em] text-[#43564F]">
                    Frequency
                  </th>
                )}

                {data_columns.map((col) => (
                  <th
                    key={col.id}
                    className="border-b border-r border-[#D5DFDB] px-3 py-3 text-left align-middle text-[11px] font-bold tracking-[0.01em] text-[#43564F]"
                  >
                    {col.column_header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {questions.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      (include_serial_number ? 1 : 0) +
                      question_columns.length +
                      (hasAnyFrequency ? 1 : 0) +
                      data_columns.length
                    }
                    className="h-[80px] px-5 text-center text-[11px] font-medium text-[#899690]"
                  >
                    No checklist items.
                  </td>
                </tr>
              ) : (
                questions.map((q, idx) => (
                  <tr key={q.id} className="bg-white align-top">
                    {include_serial_number && (
                      <td className="border-b border-r border-[#E0E7E4] px-3 py-3 text-center text-[11px] font-semibold text-[#60716A]">
                        {idx + 1}
                      </td>
                    )}
                    {question_columns.map((col) => (
                      <td
                        key={col.id}
                        className="border-b border-r border-[#E0E7E4] px-3 py-3 text-[12px] leading-5 text-[#263B35]"
                      >
                        {pick(q.values, col.id) || ""}
                      </td>
                    ))}

                    {hasAnyFrequency && (
                      <td className="border-b border-r border-[#E0E7E4] px-3 py-3 align-top">
                        {q.frequency_enabled ? (
                          q.frequency ? (
                            <span className="inline-flex items-center rounded-md bg-[#EEF4F1] px-2 py-1 text-[11.5px] font-semibold text-[#3F6B58]">
                              {q.frequency}
                            </span>
                          ) : (
                            <span className="text-[11.5px] font-medium italic text-[#9AA5A1]">
                              Not selected
                            </span>
                          )
                        ) : (
                          <span className="text-[11.5px] text-[#9AA5A1]">—</span>
                        )}
                      </td>
                    )}

                    {data_columns.map((col) => (
                      <td
                        key={col.id}
                        className="border-b border-r border-[#E0E7E4] px-3 py-3 align-top"
                      >
                        {renderCell(q.id, col.id, pick(q.data_cells, col.id))}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Authenticated eSign Modal */}
      <CheckboxEsignModal
        isOpen={!!esignModal}
        onClose={() => setEsignModal(null)}
        onSuccess={handleEsignVerified}
      />
    </>
  );
};

export default ChecklistInput;