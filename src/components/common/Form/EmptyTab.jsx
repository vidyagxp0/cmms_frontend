import React from "react";

const EmptyTab = ({ title, description }) => {
    return (
        <div
            className="
                flex
                min-h-[350px]
                w-full
                items-center
                justify-center
                border-y
                border-slate-200
            "
        >
            <div className="text-center">
                <h2 className="text-base font-semibold text-[#263B35]">
                    {title}
                </h2>

                <p className="mt-2 text-sm text-[#7B8983]">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default EmptyTab;