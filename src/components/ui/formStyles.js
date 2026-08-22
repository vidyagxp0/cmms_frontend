export const inputClass = (field, errors = {}) =>
    `h-[46px] w-full rounded-[10px] border bg-[#F9FCFA] px-3.5 text-[12.5px] font-medium text-[#1C382A] outline-none transition-all duration-200 placeholder:text-[#94A79E] ${
        errors[field]
            ? "border-[#C43D3D] focus:shadow-[0_0_0_3px_rgba(196,61,61,0.07)]"
            : "border-[#CBE3D6] focus:border-[#79B89A] focus:bg-white focus:shadow-[0_0_0_3px_rgba(31,138,95,0.07)]"
    }`;