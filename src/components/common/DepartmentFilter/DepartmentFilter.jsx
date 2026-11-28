import { useMemo } from "react";
import { Select } from "antd";
import { Building2, Check } from "lucide-react";
import "./DepartmentFilter.css";

/**
 * Compact, searchable department filter for dashboards.
 *
 * Replaces the old full-width row of department chips (which grew very wide
 * with many / long department names) with a single dropdown that:
 *  - sits inline with the other filters,
 *  - is searchable and alphabetically sorted,
 *  - truncates long names (full name on hover),
 *  - shows a highlighted state while a department is selected.
 *
 * `value` / `onChange` use the department id as a string ("" = all).
 */
const getDeptId = (dept) =>
    String(dept?.id ?? dept?.department_id ?? dept?.dept_id ?? "");

const getDeptName = (dept) =>
    dept?.name || dept?.department_name || dept?.dept_name || "Unnamed Department";

const DepartmentFilter = ({
    departments = [],
    loading = false,
    value = "",
    onChange,
    width = 240,
}) => {
    const options = useMemo(
        () =>
            (Array.isArray(departments) ? departments : [])
                .map((dept) => ({ value: getDeptId(dept), label: getDeptName(dept) }))
                .filter((opt) => opt.value)
                .sort((a, b) => a.label.localeCompare(b.label)),
        [departments]
    );

    const isActive = Boolean(value);

    return (
        <Select
            showSearch
            allowClear
            value={value || undefined}
            onChange={(val) => onChange?.(val ? String(val) : "")}
            options={options}
            loading={loading}
            optionFilterProp="label"
            placeholder="All Departments"
            prefix={
                <Building2
                    size={13}
                    strokeWidth={1.9}
                    className={isActive ? "text-[#2B5577]" : "text-[#8A9691]"}
                />
            }
            listHeight={288}
            classNames={{ popup: { root: "dept-filter-popup" } }}
            popupMatchSelectWidth={320}
            notFoundContent={
                <div className="px-2 py-3 text-center text-[11px] font-medium text-[#8A9691]">
                    {loading ? "Loading departments…" : "No departments found"}
                </div>
            }
            labelRender={({ label }) => (
                <span
                    className="block truncate text-[12px] font-semibold text-[#2B5577]"
                    title={typeof label === "string" ? label : undefined}
                >
                    {label}
                </span>
            )}
            optionRender={(option) => {
                const selected = String(option.value) === String(value);
                return (
                    <div className="flex min-w-0 items-center gap-2 py-0.5">
                        <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] border ${
                                selected
                                    ? "border-[#B9CDE0] bg-[#EAF1F7] text-[#2B5577]"
                                    : "border-[#D5E0DB] bg-[#F7FAF8] text-[#56766D]"
                            }`}
                        >
                            <Building2 size={12} strokeWidth={1.9} />
                        </span>
                        <span
                            className={`min-w-0 flex-1 truncate text-[12px] ${
                                selected ? "font-bold text-[#2B5577]" : "font-medium text-[#3F4E49]"
                            }`}
                            title={option.label}
                        >
                            {option.label}
                        </span>
                        {selected && (
                            <Check size={13} strokeWidth={2.4} className="shrink-0 text-[#2B5577]" />
                        )}
                    </div>
                );
            }}
            style={{ width, height: 30 }}
            className={`text-[12px] shadow-sm ${
                isActive
                    ? "[&_.ant-select-selector]:!border-[#9DB8CF] [&_.ant-select-selector]:!bg-[#F2F7FB] [&.ant-select]:!border-[#9DB8CF] [&.ant-select]:!bg-[#F2F7FB]"
                    : ""
            }`}
        />
    );
};

export default DepartmentFilter;
