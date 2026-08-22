import React, { useEffect, useRef, useState } from "react";
import {
    Check,
    ChevronDown,
    Search,
} from "lucide-react";

const MultiSelectDropdown = ({
    value = [],
    onChange,
    options = [],
    placeholder = "Select options",
    label,
    icon: LabelIcon,
    error,
    disabled = false,
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [placement, setPlacement] = useState("down");
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!selectRef.current?.contains(event.target)) {
                setOpen(false);
                setSearch("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!open) return;

        const updatePlacement = () => {
            const rect = selectRef.current?.getBoundingClientRect();
            if (!rect) return;

            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            setPlacement(
                spaceBelow < 280 && spaceAbove > spaceBelow
                    ? "up"
                    : "down"
            );
        };

        updatePlacement();

        window.addEventListener("resize", updatePlacement);
        window.addEventListener("scroll", updatePlacement, true);

        return () => {
            window.removeEventListener("resize", updatePlacement);
            window.removeEventListener("scroll", updatePlacement, true);
        };
    }, [open]);

    const selectedOptions = options.filter((option) =>
        value.includes(
            typeof option === "object" ? option.value : option
        )
    );

    const filteredOptions = options.filter((option) => {
        const label =
            typeof option === "object" ? option.label : option;

        return label
            ?.toLowerCase()
            .includes(search.toLowerCase());
    });

    const toggleOption = (option) => {
        const optionValue =
            typeof option === "object" ? option.value : option;

        const exists = value.includes(optionValue);

        onChange(
            exists
                ? value.filter((item) => item !== optionValue)
                : [...value, optionValue]
        );
    };

    const selectedLabel = selectedOptions.length
        ? selectedOptions.map((option) =>
              typeof option === "object" ? option.label : option
          ).join(", ")
        : "";

    return (
        <div className="relative" ref={selectRef}>
            {label && (
                <label className="mb-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-[#263F33]">
                    {LabelIcon && (
                        <LabelIcon
                            size={13}
                            strokeWidth={1.9}
                            className="text-[#39785D]"
                        />
                    )}
                    {label}
                </label>
            )}

            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setOpen((prev) => !prev)}
                className={`flex h-[46px] w-full items-center justify-between rounded-[10px] border bg-[#F9FCFA] px-3.5 text-left outline-none transition-all duration-200 ${
                    disabled
                        ? "cursor-not-allowed opacity-60"
                        : open
                        ? "border-[#79B89A] bg-white shadow-[0_0_0_3px_rgba(31,138,95,0.07)]"
                        : error
                        ? "border-[#C43D3D]"
                        : "border-[#CBE3D6] hover:border-[#AFCFBE] hover:bg-white"
                }`}
                aria-expanded={open}
                aria-haspopup="listbox"
            >
                <span
                    className={`truncate pr-3 text-[12.5px] font-medium ${
                        selectedLabel
                            ? "text-[#1C382A]"
                            : "text-[#94A79E]"
                    }`}
                >
                    {selectedLabel || placeholder}
                </span>

                <ChevronDown
                    size={15}
                    strokeWidth={1.8}
                    className={`shrink-0 text-[#71877C] transition-transform duration-200 ${
                        open ? "rotate-180 text-[#287653]" : ""
                    }`}
                />
            </button>

            {open && (
                <div
                    className={`absolute left-0 right-0 z-50 overflow-hidden rounded-xl border border-[#CBE3D6] bg-white p-1.5 shadow-[0_18px_40px_-18px_rgba(21,61,45,0.38)] ${
                        placement === "up"
                            ? "bottom-[calc(100%+7px)]"
                            : "top-[calc(100%+7px)]"
                    }`}
                >
                    <div className="px-2.5 pb-1.5 pt-1 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#91A39A]">
                        {label || "Options"}
                    </div>

                    <div className="mb-1.5 flex h-9 items-center gap-2 rounded-lg border border-[#E1EEE7] bg-[#F9FCFA] px-2.5">
                        <Search
                            size={14}
                            className="shrink-0 text-[#82958B]"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={`Search ${label || "options"}...`}
                            className="w-full bg-transparent text-[11.5px] text-[#1C382A] outline-none placeholder:text-[#9AAEA4]"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div
                        className="max-h-56 overflow-y-auto pr-0.5"
                        role="listbox"
                        aria-multiselectable="true"
                    >
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const optionValue =
                                    typeof option === "object"
                                        ? option.value
                                        : option;

                                const optionLabel =
                                    typeof option === "object"
                                        ? option.label
                                        : option;

                                const OptionIcon =
                                    typeof option === "object"
                                        ? option.icon
                                        : null;

                                const selected =
                                    value.includes(optionValue);

                                return (
                                    <button
                                        key={optionValue}
                                        type="button"
                                        role="option"
                                        aria-selected={selected}
                                        onClick={() =>
                                            toggleOption(option)
                                        }
                                        className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-2.5 text-left transition-all duration-150 ${
                                            selected
                                                ? "bg-[#EEF8F2] text-[#176B49]"
                                                : "text-[#3B5549] hover:bg-[#F5FAF7] hover:text-[#176B49]"
                                        }`}
                                    >
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            {OptionIcon && (
                                                <span
                                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                                                        selected
                                                            ? "border-[#B8DAC6] bg-white text-[#23845D]"
                                                            : "border-[#DCEAE2] bg-[#FAFCFB] text-[#82958B]"
                                                    }`}
                                                >
                                                    <OptionIcon
                                                        size={13}
                                                        strokeWidth={1.8}
                                                    />
                                                </span>
                                            )}

                                            <span className="truncate text-[12px] font-medium">
                                                {optionLabel}
                                            </span>
                                        </div>

                                        <span
                                            className={`ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                                selected
                                                    ? "border-[#23845D] bg-[#23845D] text-white"
                                                    : "border-[#CBE3D6] bg-white"
                                            }`}
                                        >
                                            {selected && (
                                                <Check
                                                    size={11}
                                                    strokeWidth={2.5}
                                                />
                                            )}
                                        </span>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-3 py-6 text-center text-[11px] text-[#8FA79B]">
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && (
                <p className="mt-1.5 text-[10.5px] font-medium text-[#C43D3D]">
                    {error}
                </p>
            )}
        </div>
    );
};

export default MultiSelectDropdown;