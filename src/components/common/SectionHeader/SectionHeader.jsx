import React from "react";

const SectionHeader = ({ title }) => {
    return (
        <div className="mb-5">
            <h2
                className="
                    text-[15px]
                    font-bold
                    tracking-[-0.01em]
                    text-[#1F302B]
                "
            >
                {title}
            </h2>

            <div className="mt-2 h-[2px] w-full bg-[#9AA9A3]" />
        </div>
    );
};

export default SectionHeader;