import React from "react";
import { Input } from "antd";

const FormDisabledInput = ({ ...props }) => {
    return (
        <Input
            {...props}
            disabled
            readOnly
            className={`
                !h-11
                !cursor-not-allowed
                !rounded-lg
                !border-[#D2DCD8]
                !bg-[#F4F6F5]
                !px-3.5
                !text-[13px]
                !font-semibold
                !text-[#52645D]
                !opacity-100
                !shadow-none
                ${props.className || ""}
            `}
        />
    );
};

export default FormDisabledInput;