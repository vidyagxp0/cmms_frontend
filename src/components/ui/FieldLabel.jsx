import React from "react";

const FieldLabel = ({ icon: Icon, children, required = true }) => (
    <label className="mb-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-[#263F33]">
        {Icon && (
            <Icon
                size={13}
                strokeWidth={1.9}
                className="text-[#39785D]"
            />
        )}
        {children}
        {required && <span className="text-[#C43D3D]">*</span>}
    </label>
);

export default FieldLabel;