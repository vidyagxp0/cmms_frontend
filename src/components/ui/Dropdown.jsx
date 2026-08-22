import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

const Dropdown = ({
    value,
    onChange,
    options = [],
    placeholder = "Select an option",
    label,
    icon: LabelIcon,
    error,
    disabled = false,
    searchable = false,
    searchPlaceholder = "Search options...",
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const selectRef = useRef(null);
    const searchRef = useRef(null);

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
        if (open && searchable) {
            setTimeout(() => searchRef.current?.focus(), 50);
        }
    }, [open, searchable]);

    const selectedOption = options.find((option) =>
        typeof option === "object"
            ? option.value === value
            : option === value
    );

    const selectedLabel =
        typeof selectedOption === "object"
            ? selectedOption.label
            : selectedOption;

    const filteredOptions = useMemo(() => {
        if (!search.trim()) return options;

        const query = search.toLowerCase();

        return options.filter((option) => {
            const optionLabel =
                typeof option === "object" ? option.label : option;

            return String(optionLabel).toLowerCase().includes(query);
        });
    }, [options, search]);

    const handleSelect = (option) => {
        const nextValue =
            typeof option === "object" ? option.value : option;

        onChange(nextValue);
        setOpen(false);
        setSearch("");
    };

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
                    className={`text-[12.5px] font-medium ${
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
                    className={`text-[#71877C] transition-transform duration-200 ${
                        open ? "rotate-180 text-[#287653]" : ""
                    }`}
                />
            </button>

            {open && (
                <div className="absolute left-0 right-0 top-[calc(100%+7px)] z-50 overflow-hidden rounded-xl border border-[#CBE3D6] bg-white p-1.5 shadow-[0_18px_40px_-18px_rgba(21,61,45,0.38)]">
                    <div className="px-2.5 pb-1.5 pt-1 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#91A39A]">
                        {label || "Options"}
                    </div>

                    {searchable && (
                        <div className="relative mb-1.5 px-1">
                            <Search
                                size={14}
                                strokeWidth={1.8}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8AA096]"
                            />

                            <input
                                ref={searchRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                placeholder={searchPlaceholder}
                                className="h-9 w-full rounded-lg border border-[#DCEAE2] bg-[#F8FBF9] pl-8 pr-8 text-[11.5px] font-medium text-[#1C382A] outline-none transition-all placeholder:text-[#9BAAA3] focus:border-[#79B89A] focus:bg-white focus:shadow-[0_0_0_3px_rgba(31,138,95,0.06)]"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSearch("");
                                        searchRef.current?.focus();
                                    }}
                                    className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#91A39A] transition-colors hover:text-[#39785D]"
                                >
                                    <X size={13} strokeWidth={2} />
                                </button>
                            )}
                        </div>
                    )}

                    <div
                        className="max-h-56 overflow-y-auto"
                        role="listbox"
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

                                const selected = value === optionValue;

                                return (
                                    <button
                                        key={optionValue}
                                        type="button"
                                        role="option"
                                        aria-selected={selected}
                                        onClick={() => handleSelect(option)}
                                        className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-2.5 text-left transition-all duration-150 ${
                                            selected
                                                ? "bg-[#EEF8F2] text-[#176B49]"
                                                : "text-[#3B5549] hover:bg-[#F5FAF7] hover:text-[#176B49]"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            {OptionIcon && (
                                                <span
                                                    className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
                                                        selected
                                                            ? "border-[#B8DAC6] bg-white text-[#23845D]"
                                                            : "border-[#DCEAE2] bg-[#FAFCFB] text-[#82958B] group-hover:border-[#C4DED0] group-hover:text-[#39785D]"
                                                    }`}
                                                >
                                                    <OptionIcon
                                                        size={13}
                                                        strokeWidth={1.8}
                                                    />
                                                </span>
                                            )}

                                            <span className="text-[12px] font-medium">
                                                {optionLabel}
                                            </span>
                                        </div>

                                        {selected && (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#23845D] text-white">
                                                <Check
                                                    size={11}
                                                    strokeWidth={2.5}
                                                />
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center px-4 py-7 text-center">
                                <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F8F5] text-[#8AA096]">
                                    <Search size={14} strokeWidth={1.8} />
                                </span>

                                <p className="text-[11.5px] font-medium text-[#526A5E]">
                                    No options found
                                </p>

                                {search && (
                                    <p className="mt-0.5 text-[10px] text-[#9AA9A1]">
                                        Try a different search
                                    </p>
                                )}
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

export default Dropdown;