import React from "react";
import { Select } from "antd";

const FormSelect = ({ ...props }) => {
    return (
        <Select
            {...props}
            className={`
                !w-full
                [&_.ant-select-selector]:!h-11
                [&_.ant-select-selector]:!rounded-lg
                [&_.ant-select-selector]:!border-[#CBD6D2]
                [&_.ant-select-selector]:!bg-transparent
                [&_.ant-select-selector]:!px-3.5
                [&_.ant-select-selector]:!shadow-none
                [&_.ant-select-selection-item]:!flex
                [&_.ant-select-selection-item]:!items-center
                [&_.ant-select-selection-item]:!text-[13px]
                [&_.ant-select-selection-item]:!font-medium
                [&_.ant-select-selection-item]:!text-[#263B35]
                [&_.ant-select-selection-placeholder]:!flex
                [&_.ant-select-selection-placeholder]:!items-center
                [&_.ant-select-selection-placeholder]:!text-[#8A9691]
                hover:[&_.ant-select-selector]:!border-[#AEBDB7]
                [&.ant-select-focused_.ant-select-selector]:!border-primary
                [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(78,117,133,0.08)]
                ${props.className || ""}
            `}
        />
    );
};

export default FormSelect;