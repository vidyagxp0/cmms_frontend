import React from "react";
import {
    User,
    Mail,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

const UpdateProfileForm = ({
    editForm,
    editErrors,
    updatingProfile,
    handleEditFieldChange,
    handleEditFormSubmit,
    onCancel,
    theme,
}) => {
    const t = theme || {
        isSystemAdmin: true,
        textAccent: "text-[#56766D]",
        bgAccent: "bg-[#56766D]",
        bgHoverAccent: "hover:bg-[#48685F]",
        lightBg: "bg-[#E8F0ED]",
        borderLight:
            "border-[#D6D8D3]",
        textAccentHover:
            "hover:text-[#48685F]",
    };

    const getInputClass = (
        field,
        errors = {}
    ) => {
        const base = `
            h-[48px]
            w-full
            rounded-[11px]
            border
            px-3.5
            text-[12.5px]
            font-medium
            outline-none
            transition-all
            duration-200
        `;

        if (errors[field]) {
            return `
                ${base}
                border-[#C98A8A]
                bg-[#FFF9F9]
                text-[#7A3535]
                focus:border-[#B54A4A]
                focus:bg-white
                focus:shadow-[0_0_0_3px_rgba(181,74,74,0.07)]
                placeholder:text-[#B18B8B]
            `;
        }

        return `
            ${base}
            border-[#D8DEDB]
            bg-[#FAFBF9]
            text-[#293A40]
            focus:border-[#9FBAB0]
            focus:bg-white
            focus:shadow-[0_0_0_3px_rgba(86,118,109,0.07)]
            placeholder:text-[#9AA5A1]
        `;
    };

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            exit={{
                opacity: 0,
                y: -15,
            }}
            transition={{
                duration: 0.2,
            }}
        >
            {/* =================================================
                HEADER
            ================================================== */}
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <h3
                        className="
                            text-[18px]
                            font-bold
                            tracking-[-0.02em]
                            text-[#243238]
                        "
                    >
                        Update Profile Details
                    </h3>

                    <span
                        className="
                            h-[5px]
                            w-[5px]
                            rounded-full
                            bg-[#A47D45]
                        "
                    />
                </div>

                <p
                    className="
                        mt-1
                        max-w-[700px]
                        text-[11px]
                        font-medium
                        leading-5
                        text-[#7A8582]
                    "
                >
                    Modify your display name and email address. Other identity details are system-assigned.
                </p>
            </div>

            {/* =================================================
                FORM
            ================================================== */}
            <form
                onSubmit={handleEditFormSubmit}
                className="space-y-6"
            >
                <div
                    className="
                        grid
                        grid-cols-1
                        gap-5
                        md:grid-cols-2
                    "
                >
                    {/* FULL NAME */}
                    <div>
                        <label
                            className="
                                mb-2
                                flex
                                items-center
                                gap-1.5
                                text-[10.5px]
                                font-bold
                                uppercase
                                tracking-[0.08em]
                                text-[#61706C]
                            "
                        >
                            <User
                                size={13}
                                strokeWidth={1.9}
                                className={t.textAccent}
                            />

                            Full Name
                        </label>

                        <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) =>
                                handleEditFieldChange(
                                    "name",
                                    e.target.value
                                )
                            }
                            placeholder="Enter full name"
                            className={getInputClass(
                                "name",
                                editErrors
                            )}
                        />

                        {editErrors.name && (
                            <p
                                className="
                                    mt-1.5
                                    flex
                                    items-center
                                    gap-1
                                    text-[10.5px]
                                    font-semibold
                                    text-[#B54A4A]
                                "
                            >
                                <AlertCircle size={12} />
                                {editErrors.name}
                            </p>
                        )}
                    </div>

                    {/* EMAIL */}
                    <div>
                        <label
                            className="
                                mb-2
                                flex
                                items-center
                                gap-1.5
                                text-[10.5px]
                                font-bold
                                uppercase
                                tracking-[0.08em]
                                text-[#61706C]
                            "
                        >
                            <Mail
                                size={13}
                                strokeWidth={1.9}
                                className={t.textAccent}
                            />

                            Email Address
                        </label>

                        <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) =>
                                handleEditFieldChange(
                                    "email",
                                    e.target.value
                                )
                            }
                            placeholder="Enter email address"
                            className={getInputClass(
                                "email",
                                editErrors
                            )}
                        />

                        {editErrors.email && (
                            <p
                                className="
                                    mt-1.5
                                    flex
                                    items-center
                                    gap-1
                                    text-[10.5px]
                                    font-semibold
                                    text-[#B54A4A]
                                "
                            >
                                <AlertCircle size={12} />
                                {editErrors.email}
                            </p>
                        )}
                    </div>
                </div>

                {/* =================================================
                    ACTION BAR
                ================================================== */}
                <div
                    className="
                        mt-7
                        flex
                        flex-col-reverse
                        gap-2.5
                        border-t
                        border-[#E8EBE7]
                        pt-5
                        sm:flex-row
                        sm:justify-end
                    "
                >
                    {/* CANCEL */}
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={updatingProfile}
                        className="
                            h-10
                            rounded-[10px]
                            border
                            border-[#D3DAD6]
                            bg-white
                            px-5
                            text-[11.5px]
                            font-semibold
                            text-[#596762]
                            transition-all
                            duration-200
                            hover:border-[#BECBC5]
                            hover:bg-[#F4F6F4]
                            hover:text-[#48685F]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        Cancel
                    </button>

                    {/* SAVE */}
                    <button
                        type="submit"
                        disabled={updatingProfile}
                        className="
                            flex
                            h-10
                            items-center
                            justify-center
                            gap-2
                            rounded-[10px]
                            bg-[#56766D]
                            px-5
                            text-[11.5px]
                            font-bold
                            text-white
                            shadow-[0_3px_9px_rgba(86,118,109,0.14)]
                            transition-all
                            duration-200
                            hover:bg-[#48685F]
                            hover:shadow-[0_5px_14px_rgba(86,118,109,0.18)]
                            active:scale-[0.98]
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        {updatingProfile && (
                            <Loader2
                                size={14}
                                className="animate-spin"
                            />
                        )}

                        {updatingProfile
                            ? "Saving Changes..."
                            : "Save Changes"}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default UpdateProfileForm;