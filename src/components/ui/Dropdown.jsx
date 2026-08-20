import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

const Dropdown = ({
    value,
    onChange,
    options = [],
    placeholder = "Select an option",
    label,
    icon: LabelIcon,
    error,
    disabled = false,
}) => {
    const [open, setOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!selectRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((option) => {
        if (typeof option === "object") return option.value === value;
        return option === value;
    });

    const selectedLabel =
        typeof selectedOption === "object"
            ? selectedOption.label
            : selectedOption;

    const handleSelect = (option) => {
        const nextValue =
            typeof option === "object" ? option.value : option;

        onChange(nextValue);
        setOpen(false);
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

                    <div
                        className="max-h-56 overflow-y-auto"
                        role="listbox"
                    >
                        {options.map((option) => {
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
                        })}
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