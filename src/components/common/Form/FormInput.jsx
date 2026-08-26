import React from "react";
import { Input } from "antd";

const FormInput = ({ ...props }) => {
    return (
        <Input
            {...props}
            className={`
                !h-11
                !rounded-lg
                !border-[#CBD6D2]
                !bg-transparent
                !px-3.5
                !text-[13px]
                !font-medium
                !text-[#263B35]
                !shadow-none
                !placeholder:text-[#8A9691]
                hover:!border-[#AEBDB7]
                focus:!border-primary
                focus:!shadow-[0_0_0_2px_rgba(78,117,133,0.08)]
                ${props.className || ""}
            `}
        />
    );
};

export default FormInput;