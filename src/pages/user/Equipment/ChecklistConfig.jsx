import React from "react";
import {
    Plus,
    X,
    Trash2,
    ClipboardCheck,
    ListChecks,
} from "lucide-react";

import SectionHeader from "../../../components/common/SectionHeader/SectionHeader";

const ChecklistConfiguration = ({
    value = [],
    onChange,
    description = "Define categorical inspection checkpoints for the field engineers.",
    disabled = false,
    className = "",
}) => {
    // ─── Category handlers ──────────────────────────────────────────────
    const addCategory = () => {
        const newCategory = {
            id: Date.now().toString(),
            name: "",
            checkpoints: [],
        };

        onChange([...value, newCategory]);
    };

    const deleteCategory = (catId) => {
        onChange(
            value.filter(
                (cat) => cat.id !== catId
            )
        );
    };

    const updateCategoryName = (
        catId,
        newName
    ) => {
        onChange(
            value.map((cat) =>
                cat.id === catId
                    ? {
                          ...cat,
                          name: newName,
                      }
                    : cat
            )
        );
    };

    // ─── Checkpoint handlers ────────────────────────────────────────────
    const addCheckpoint = (catId) => {
        onChange(
            value.map((cat) =>
                cat.id === catId
                    ? {
                          ...cat,
                          checkpoints: [
                              ...cat.checkpoints,
                              {
                                  id: Date.now().toString(),
                                  text: "",
                              },
                          ],
                      }
                    : cat
            )
        );
    };

    const deleteCheckpoint = (
        catId,
        cpId
    ) => {
        onChange(
            value.map((cat) =>
                cat.id === catId
                    ? {
                          ...cat,
                          checkpoints:
                              cat.checkpoints.filter(
                                  (cp) =>
                                      cp.id !==
                                      cpId
                              ),
                      }
                    : cat
            )
        );
    };

    const updateCheckpointText = (
        catId,
        cpId,
        newText
    ) => {
        onChange(
            value.map((cat) =>
                cat.id === catId
                    ? {
                          ...cat,
                          checkpoints:
                              cat.checkpoints.map(
                                  (cp) =>
                                      cp.id ===
                                      cpId
                                          ? {
                                                ...cp,
                                                text: newText,
                                            }
                                          : cp
                              ),
                      }
                    : cat
            )
        );
    };

    return (
        <div
            className={`
                mt-8
                w-full
                ${className}
            `}
        >
            {/* =========================================================
                SECTION HEADING
            ========================================================== */}
            <div className="mb-4">
                <SectionHeader title="CHECKLIST CONFIGURATION" />
            </div>

            {/* =========================================================
                MAIN CHECKLIST CONTAINER
            ========================================================== */}
            <div
                className="
                    overflow-hidden
                    rounded-[16px]
                    border
                    border-[var(--color-border)]
                    bg-[var(--color-surface)]
                    shadow-[0_5px_20px_rgba(36,50,56,0.045)]
                "
            >
                {/* TOP ACCENT */}
                <div
                    className="
                        h-[2px]
                        w-full
                        bg-[var(--color-secondary)]
                    "
                />

                {/* =====================================================
                    HEADER / DESCRIPTION
                ====================================================== */}
                <div
                    className="
                        flex
                        flex-col
                        gap-4
                        border-b
                        border-[var(--color-border-soft)]
                        bg-[var(--color-surface)]
                        px-4
                        py-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        sm:px-5
                    "
                >
                    {/* DESCRIPTION */}
                    <div className="flex min-w-0 items-start gap-3">
                        <div
                            className="
                                flex
                                h-[34px]
                                w-[34px]
                                shrink-0
                                items-center
                                justify-center
                                rounded-[9px]
                                border
                                border-[#D4DFDA]
                                bg-[#EEF4F1]
                                text-[var(--color-primary)]
                            "
                        >
                            <ClipboardCheck
                                size={16}
                                strokeWidth={1.9}
                            />
                        </div>

                        <div className="min-w-0">
                            <p
                                className="
                                    text-[10.5px]
                                    font-bold
                                    uppercase
                                    tracking-[0.07em]
                                    text-[var(--color-text-primary)]
                                "
                            >
                                Inspection Checklist
                            </p>

                            <p
                                className="
                                    mt-0.5
                                    max-w-[650px]
                                    text-[10.5px]
                                    font-medium
                                    leading-5
                                    text-[var(--color-text-muted)]
                                "
                            >
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* ADD CATEGORY */}
                    <button
                        type="button"
                        onClick={addCategory}
                        disabled={disabled}
                        className="
                            inline-flex
                            h-[37px]
                            shrink-0
                            items-center
                            justify-center
                            gap-2
                            self-start
                            rounded-[10px]
                            border
                            border-[#BFCFC8]
                            bg-[var(--color-primary)]
                            px-3.5
                            text-[10.5px]
                            font-bold
                            text-white
                            shadow-[0_4px_11px_rgba(86,118,109,0.14)]
                            transition-all
                            duration-200
                            hover:bg-[var(--color-primary-hover)]
                            hover:shadow-[0_6px_15px_rgba(86,118,109,0.18)]
                            active:scale-[0.98]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            sm:self-auto
                            focus:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-[var(--color-primary-muted)]
                            focus-visible:ring-offset-1
                        "
                    >
                        <span
                            className="
                                flex
                                h-[22px]
                                w-[22px]
                                items-center
                                justify-center
                                rounded-[6px]
                                bg-white/10
                            "
                        >
                            <Plus
                                size={13}
                                strokeWidth={2.4}
                            />
                        </span>

                        Add Category
                    </button>
                </div>

                {/* =====================================================
                    BODY
                ====================================================== */}
                <div className="p-4 sm:p-5">

                    {/* =================================================
                        EMPTY STATE
                    ================================================== */}
                    {value.length === 0 && (
                        <div
                            className="
                                flex
                                min-h-[220px]
                                flex-col
                                items-center
                                justify-center
                                rounded-[13px]
                                border
                                border-dashed
                                border-[#CFDAD5]
                                bg-[#F8FAF8]
                                px-5
                                text-center
                            "
                        >
                            <div
                                className="
                                    mb-4
                                    flex
                                    h-[54px]
                                    w-[54px]
                                    items-center
                                    justify-center
                                    rounded-[15px]
                                    border
                                    border-[#D4E0DB]
                                    bg-[#EEF4F1]
                                    text-[#708780]
                                "
                            >
                                <ListChecks
                                    size={24}
                                    strokeWidth={1.6}
                                />
                            </div>

                            <p
                                className="
                                    text-[12.5px]
                                    font-bold
                                    text-[var(--color-text-primary)]
                                "
                            >
                                No categories yet
                            </p>

                            <p
                                className="
                                    mt-1
                                    max-w-[370px]
                                    text-[10.5px]
                                    font-medium
                                    leading-5
                                    text-[var(--color-text-muted)]
                                "
                            >
                                Add an inspection category to
                                start building the equipment
                                checklist.
                            </p>

                            <button
                                type="button"
                                onClick={addCategory}
                                disabled={disabled}
                                className="
                                    mt-4
                                    inline-flex
                                    h-[34px]
                                    items-center
                                    gap-1.5
                                    rounded-[9px]
                                    border
                                    border-[#C9D9D3]
                                    bg-white
                                    px-3.5
                                    text-[10.5px]
                                    font-bold
                                    text-[var(--color-primary)]
                                    shadow-[0_2px_7px_rgba(36,50,56,0.04)]
                                    transition-all
                                    duration-200
                                    hover:border-[#B8CAC2]
                                    hover:bg-[var(--color-primary-soft)]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                    focus:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-[var(--color-primary-muted)]
                                    focus-visible:ring-offset-1
                                "
                            >
                                <Plus
                                    size={13}
                                    strokeWidth={2.3}
                                />

                                Add Category
                            </button>
                        </div>
                    )}

                    {/* =================================================
                        CATEGORIES
                    ================================================== */}
                    {value.length > 0 && (
                        <div className="space-y-4">
                            {value.map(
                                (
                                    category,
                                    categoryIndex
                                ) => (
                                    <div
                                        key={
                                            category.id
                                        }
                                        className="
                                            group
                                            overflow-hidden
                                            rounded-[14px]
                                            border
                                            border-[#DCE3DF]
                                            bg-[#FAFBF9]
                                            transition-all
                                            duration-200
                                            hover:border-[#C9D6D0]
                                            hover:shadow-[0_4px_12px_rgba(36,50,56,0.035)]
                                        "
                                    >
                                        {/* =================================
                                            CATEGORY HEADER
                                        ================================== */}
                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                                border-b
                                                border-[#E2E7E4]
                                                bg-white
                                                px-3.5
                                                py-3
                                                sm:px-4
                                            "
                                        >
                                            {/* CATEGORY NUMBER */}
                                            <div
                                                className="
                                                    flex
                                                    h-[30px]
                                                    w-[30px]
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-[8px]
                                                    border
                                                    border-[#D2DFDA]
                                                    bg-[#E8F0ED]
                                                    text-[10px]
                                                    font-bold
                                                    text-[#56766D]
                                                "
                                            >
                                                {String(
                                                    categoryIndex +
                                                        1
                                                ).padStart(
                                                    2,
                                                    "0"
                                                )}
                                            </div>

                                            {/* CATEGORY INPUT */}
                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className="
                                                        mb-1
                                                        text-[8.5px]
                                                        font-bold
                                                        uppercase
                                                        tracking-[0.10em]
                                                        text-[#8A9591]
                                                    "
                                                >
                                                    Category
                                                </p>

                                                <input
                                                    type="text"
                                                    value={
                                                        category.name
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        updateCategoryName(
                                                            category.id,
                                                            e
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    placeholder="e.g. Electrical Safety"
                                                    disabled={
                                                        disabled
                                                    }
                                                    className="
                                                        w-full
                                                        border-none
                                                        bg-transparent
                                                        p-0
                                                        text-[12px]
                                                        font-bold
                                                        tracking-[-0.01em]
                                                        text-[var(--color-text-primary)]
                                                        outline-none
                                                        placeholder:text-[#A1AAA6]
                                                        focus:ring-0
                                                        disabled:cursor-not-allowed
                                                        disabled:opacity-60
                                                    "
                                                />
                                            </div>

                                            {/* DELETE CATEGORY */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    deleteCategory(
                                                        category.id
                                                    )
                                                }
                                                disabled={
                                                    disabled
                                                }
                                                aria-label="Delete category"
                                                title="Delete category"
                                                className="
                                                    flex
                                                    h-[31px]
                                                    w-[31px]
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-[8px]
                                                    border
                                                    border-transparent
                                                    text-[#929E99]
                                                    transition-all
                                                    duration-150
                                                    hover:border-[#E8D2D2]
                                                    hover:bg-[#FCF1F1]
                                                    hover:text-[#B54A4A]
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-40
                                                    focus:outline-none
                                                    focus-visible:ring-2
                                                    focus-visible:ring-[#E4BDBD]
                                                    focus-visible:ring-offset-1
                                                "
                                            >
                                                <Trash2
                                                    size={15}
                                                    strokeWidth={
                                                        1.8
                                                    }
                                                />
                                            </button>
                                        </div>

                                        {/* =================================
                                            CHECKPOINT CONTENT
                                        ================================== */}
                                        <div className="p-3.5 sm:p-4">

                                            {/* EMPTY CHECKPOINTS */}
                                            {category
                                                .checkpoints
                                                .length ===
                                                0 ? (
                                                <div
                                                    className="
                                                        rounded-[11px]
                                                        border
                                                        border-dashed
                                                        border-[#D8E1DD]
                                                        bg-[#F7F9F7]
                                                        px-4
                                                        py-6
                                                        text-center
                                                    "
                                                >
                                                    <p
                                                        className="
                                                            text-[10.5px]
                                                            font-semibold
                                                            text-[#7D8985]
                                                        "
                                                    >
                                                        No checkpoints defined yet.
                                                    </p>

                                                    <p
                                                        className="
                                                            mt-1
                                                            text-[9.5px]
                                                            font-medium
                                                            text-[#9AA5A1]
                                                        "
                                                    >
                                                        Add a checkpoint below to define the inspection step.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {category.checkpoints.map(
                                                        (
                                                            cp,
                                                            index
                                                        ) => (
                                                            <div
                                                                key={
                                                                    cp.id
                                                                }
                                                                className="
                                                                    group/checkpoint
                                                                    flex
                                                                    items-center
                                                                    gap-2.5
                                                                    rounded-[10px]
                                                                    border
                                                                    border-[#E0E6E3]
                                                                    bg-white
                                                                    p-2
                                                                    pl-2.5
                                                                    shadow-[0_1px_4px_rgba(36,50,56,0.025)]
                                                                    transition-all
                                                                    duration-200
                                                                    hover:border-[#CCD9D3]
                                                                    hover:shadow-[0_3px_9px_rgba(36,50,56,0.045)]
                                                                "
                                                            >
                                                                {/* INDEX */}
                                                                <span
                                                                    className="
                                                                        flex
                                                                        h-[25px]
                                                                        w-[25px]
                                                                        shrink-0
                                                                        items-center
                                                                        justify-center
                                                                        rounded-full
                                                                        bg-[#EAF0ED]
                                                                        text-[9px]
                                                                        font-bold
                                                                        text-[#56766D]
                                                                    "
                                                                >
                                                                    {index +
                                                                        1}
                                                                </span>

                                                                {/* CHECKPOINT */}
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        cp.text
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        updateCheckpointText(
                                                                            category.id,
                                                                            cp.id,
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    placeholder="Describe the inspection step..."
                                                                    disabled={
                                                                        disabled
                                                                    }
                                                                    className="
                                                                        min-w-0
                                                                        flex-1
                                                                        border-none
                                                                        bg-transparent
                                                                        py-1
                                                                        text-[11.5px]
                                                                        font-medium
                                                                        text-[var(--color-text-primary)]
                                                                        outline-none
                                                                        placeholder:text-[#A0AAA5]
                                                                        focus:ring-0
                                                                        disabled:cursor-not-allowed
                                                                        disabled:opacity-60
                                                                    "
                                                                />

                                                                {/* DELETE CHECKPOINT */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        deleteCheckpoint(
                                                                            category.id,
                                                                            cp.id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        disabled
                                                                    }
                                                                    aria-label="Delete checkpoint"
                                                                    title="Delete checkpoint"
                                                                    className="
                                                                        flex
                                                                        h-[29px]
                                                                        w-[29px]
                                                                        shrink-0
                                                                        items-center
                                                                        justify-center
                                                                        rounded-[8px]
                                                                        border
                                                                        border-transparent
                                                                        text-[#97A19D]
                                                                        opacity-65
                                                                        transition-all
                                                                        duration-150
                                                                        hover:border-[#E8D2D2]
                                                                        hover:bg-[#FCF1F1]
                                                                        hover:text-[#B54A4A]
                                                                        hover:opacity-100
                                                                        disabled:cursor-not-allowed
                                                                        disabled:opacity-35
                                                                        focus:outline-none
                                                                        focus-visible:ring-2
                                                                        focus-visible:ring-[#E4BDBD]
                                                                        focus-visible:ring-offset-1
                                                                    "
                                                                >
                                                                    <X
                                                                        size={
                                                                            14
                                                                        }
                                                                        strokeWidth={
                                                                            1.9
                                                                        }
                                                                    />
                                                                </button>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}

                                            {/* =================================
                                                ADD CHECKPOINT
                                            ================================== */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    addCheckpoint(
                                                        category.id
                                                    )
                                                }
                                                disabled={
                                                    disabled
                                                }
                                                className="
                                                    mt-3
                                                    inline-flex
                                                    h-[32px]
                                                    items-center
                                                    gap-1.5
                                                    rounded-[8px]
                                                    border
                                                    border-transparent
                                                    px-2.5
                                                    text-[10px]
                                                    font-bold
                                                    text-[#56766D]
                                                    transition-all
                                                    duration-150
                                                    hover:border-[#D5E1DC]
                                                    hover:bg-[#E8F0ED]
                                                    hover:text-[#48685F]
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-50
                                                    focus:outline-none
                                                    focus-visible:ring-2
                                                    focus-visible:ring-[var(--color-primary-muted)]
                                                    focus-visible:ring-offset-1
                                                "
                                            >
                                                <Plus
                                                    size={13}
                                                    strokeWidth={
                                                        2.3
                                                    }
                                                />

                                                Add Checkpoint
                                            </button>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChecklistConfiguration;