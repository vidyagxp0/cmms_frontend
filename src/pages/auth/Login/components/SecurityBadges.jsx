import React from "react";
import { ShieldCheck } from "lucide-react";

const SecurityBadges = () => {

    return (
        <div className="pt-3 text-center">

            <div className="flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-slate-600">

                <ShieldCheck
                    size={14}
                    className="text-emerald-500"
                />

                Secure & compliant access

            </div>


        </div>
    );
};

export default SecurityBadges;