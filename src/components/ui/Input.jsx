import React from "react";

const InputField = ({
    label,
    name,
    value = "",
    onChange,
    placeholder = "",
    type = "text",
    required = false,
    disabled = false,
    error = "",
    helperText = "",
    icon: Icon,
    className = "",
    inputClassName = "",
    ...props
}) => {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className="
                        mb-1.5
                        flex items-center gap-1
                        text-[12px]
                        font-semibold
                        tracking-[-0.01em]
                        text-[#34413B]
                    "
                >
                    <span>{label}</span>

                    {required && (
                        <span className="text-[#B45F5F]">*</span>
                    )}
                </label>
            )}

            <div className="relative">
                {Icon && (
                    <span
                        className="
                            pointer-events-none
                            absolute left-3
                            top-1/2
                            flex -translate-y-1/2
                            items-center justify-center
                            text-[#8A9690]
                            transition-colors duration-200
                        "
                    >
                        <Icon size={15} strokeWidth={1.7} />
                    </span>
                )}

                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    aria-invalid={Boolean(error)}
                    className={`
                        h-[42px]
                        w-full
                        rounded-[9px]
                        border
                        bg-[#FBFCFC]
                        px-3
                        text-[13px]
                        font-medium
                        tracking-[-0.005em]
                        text-[#27332E]
                        outline-none
                        placeholder:text-[#A7B0AC]
                        transition-all
                        duration-200
                        ease-out

                        ${Icon ? "pl-9" : ""}

                        ${
                            error
                                ? `
                                    border-[#D99A9A]
                                    focus:border-[#C97878]
                                    focus:ring-[3px]
                                    focus:ring-[#F4DEDE]
                                `
                                : `
                                    border-[#D9E0DC]
                                    hover:border-[#C3CDC7]
                                    focus:border-[#7D9187]
                                    focus:bg-white
                                    focus:ring-[3px]
                                    focus:ring-[#E8EEEB]
                                `
                        }

                        ${
                            disabled
                                ? `
                                    cursor-not-allowed
                                    bg-[#F2F4F3]
                                    text-[#9AA49F]
                                    opacity-70
                                `
                                : ""
                        }

                        ${inputClassName}
                    `}
                    {...props}
                />
            </div>

            {error ? (
                <p className="mt-1.5 text-[11px] font-medium text-[#B45F5F]">
                    {error}
                </p>
            ) : helperText ? (
                <p className="mt-1.5 text-[11px] text-[#8A9690]">
                    {helperText}
                </p>
            ) : null}
        </div>
    );
};

export default InputField;