import React from "react";
import { Upload } from "antd";

const FormAttachment = ({ ...props }) => {
    return (
        <Upload
            {...props}
            beforeUpload={() => false}
            maxCount={1}
            showUploadList
            className="
                !block
                !w-full
                [&_.ant-upload]:!block
                [&_.ant-upload]:!w-full
            "
        >
            <div
                className="
                    flex
                    h-[106px]
                    w-full
                    cursor-pointer
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-dashed
                    border-[#C7D3CE]
                    bg-transparent
                    px-5
                    text-center
                    transition-all
                    duration-200
                    hover:border-primary
                    hover:bg-primary/[0.02]
                "
            >
                <div>
                    <p className="text-[13px] font-semibold text-[#52645D]">
                        Choose attachment
                    </p>

                    <p className="mt-1 text-xs text-[#899690]">
                        PDF, DOC, DOCX, XLS, XLSX or image
                    </p>
                </div>
            </div>
        </Upload>
    );
};

export default FormAttachment;