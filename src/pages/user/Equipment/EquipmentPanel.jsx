import React, { useEffect, useState } from "react";
import {
    Activity,
    Wrench,
    Hash,
    Factory,
    Cpu,
    Layers3,
} from "lucide-react";
import { Form } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import SectionHeader from "../../../components/common/SectionHeader/SectionHeader";
import FormInput from "../../../components/common/Form/FormInput";
import FloatingActionButtons from "../../../components/ui/FloatingActionButtons";
import Skeleton from "../../../components/common/Skeleton/Skeleton";
import ChecklistConfiguration from "./ChecklistConfig";

import {
    getEquipmentDetail,
    updateEquipment,
} from "../../../services/usersApi/equipmentApi";

const EquipmentPanel = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [isLoading, setIsLoading] =
        useState(true);

    const [isSaving, setIsSaving] =
        useState(false);

    const [categories, setCategories] =
        useState([]);

    // ─── Fetch detail ────────────────────────────────────────────────
    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) {
                toast.error(
                    "Equipment ID is missing."
                );

                navigate(-1);
                return;
            }

            try {
                setIsLoading(true);

                const response =
                    await getEquipmentDetail(id);

                const data =
                    response?.data?.data;

                if (!data) {
                    toast.error(
                        "Equipment not found."
                    );

                    navigate(-1);
                    return;
                }

                // Populate form fields
                form.setFieldsValue({
                    name: data.name || "",
                    equipment_id:
                        data.equipment_id || "",
                    make: data.make || "",
                    model: data.model || "",
                    equipment_type:
                        data.equipment_type || "",
                });

                // Transform checklist_config into categories state
                const fetchedCategories = (
                    data.checklist_config || []
                ).map((item, index) => ({
                    id: `cat-${Date.now()}-${index}`,
                    name:
                        item.category || "",
                    checkpoints: (
                        item.checkpoints || []
                    ).map(
                        (
                            text,
                            cpIndex
                        ) => ({
                            id: `cp-${Date.now()}-${index}-${cpIndex}`,
                            text: text || "",
                        })
                    ),
                }));

                setCategories(
                    fetchedCategories
                );
            } catch (error) {
                console.error(
                    "Failed to fetch equipment detail:",
                    error
                );

                toast.error(
                    error?.response?.data
                        ?.message ||
                        "Failed to load equipment details."
                );

                navigate(-1);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetail();
    }, [id, form, navigate]);

    // ─── Submit ─────────────────────────────────────────────────────
    const handleSubmit = async (
        values
    ) => {
        if (isSaving) return;

        // Build checklist payload – skip empty categories or checkpoints
        const checklistConfig =
            categories
                .filter(
                    (cat) =>
                        cat.name.trim() !== ""
                )
                .map((cat) => ({
                    category:
                        cat.name.trim(),

                    checkpoints:
                        cat.checkpoints
                            .map((cp) =>
                                cp.text.trim()
                            )
                            .filter(
                                (t) =>
                                    t !== ""
                            ),
                }))
                .filter(
                    (cat) =>
                        cat.checkpoints
                            .length > 0
                );

        try {
            setIsSaving(true);

            const payload = {
                name:
                    values.name.trim(),

                equipment_id:
                    values.equipment_id.trim(),

                make:
                    values.make.trim(),

                model:
                    values.model.trim(),

                equipment_type:
                    values.equipment_type.trim(),

                checklist_config:
                    checklistConfig,
            };

            await updateEquipment(
                id,
                payload
            );

            toast.success(
                "Equipment updated successfully."
            );

            // navigate("/user/equipment-dashboard");
        } catch (error) {
            console.error(
                "Failed to update equipment:",
                error
            );

            toast.error(
                error?.response?.data
                    ?.message ||
                    "Failed to update equipment. Please try again."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (isSaving) return;

        navigate(
            "/user/equipment-dashboard"
        );
    };

    // ─── Loading state ──────────────────────────────────────────────
    if (isLoading) {
        return (
            <div
                className="
                    w-full
                    min-h-full
                    bg-[var(--color-background)]
                    px-4
                    pb-10
                    sm:px-6
                    lg:px-8
                "
            >
                <div className="mx-auto w-full max-w-7xl space-y-5">
                    <Skeleton
                        variant="title"
                        className="w-full"
                    />

                    <Skeleton
                        variant="form"
                        fields={6}
                    />
                </div>
            </div>
        );
    }

    // ─── Render ─────────────────────────────────────────────────────
    return (
        <div
            className="
                min-h-full
                w-full
                bg-[var(--color-background)]
                px-4
                pb-12
                sm:px-6
                lg:px-8
            "
        >
            <div
                className="
                    mx-auto
                    w-full
                    max-w-7xl
                "
            >
                {/* =====================================================
                    PAGE HEADER
                ====================================================== */}
                <div
                    className="
                        mb-5
                        flex
                        flex-col
                        gap-4
                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                    "
                >
                    {/* LEFT */}
                    <div className="flex min-w-0 items-center gap-3">
                        <div
                            className="
                                flex
                                h-[42px]
                                w-[42px]
                                shrink-0
                                items-center
                                justify-center
                                rounded-[12px]
                                border
                                border-[#C7D8D2]
                                bg-[#E8F0ED]
                                text-[#56766D]
                                shadow-[0_2px_8px_rgba(86,118,109,0.06)]
                            "
                        >
                            <Wrench
                                size={19}
                                strokeWidth={1.9}
                            />
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1
                                    className="
                                        truncate
                                        text-[22px]
                                        font-bold
                                        tracking-[-0.035em]
                                        text-[var(--color-text-primary)]
                                    "
                                >
                                    Equipment Details
                                </h1>

                                <span
                                    className="
                                        hidden
                                        h-[5px]
                                        w-[5px]
                                        shrink-0
                                        rounded-full
                                        bg-[var(--color-secondary)]
                                        sm:block
                                    "
                                />
                            </div>

                            <p
                                className="
                                    mt-0.5
                                    text-[10.5px]
                                    font-medium
                                    text-[var(--color-text-secondary)]
                                "
                            >
                                Review and maintain the configuration of this equipment asset.
                            </p>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    EQUIPMENT INFORMATION CARD
                ====================================================== */}
                <section
                    className="
                        overflow-hidden
                        rounded-[18px]
                        border
                        border-[var(--color-border)]
                        bg-[var(--color-surface)]
                        shadow-[0_5px_20px_rgba(36,50,56,0.055)]
                    "
                >
                    {/* TOP ACCENT */}
                    <div
                        className="
                            h-[3px]
                            w-full
                            bg-[var(--color-primary)]
                        "
                    />

                    {/* SECTION HEADER */}
                    <div
                        className="
                            border-b
                            border-[var(--color-border-soft)]
                            px-5
                            py-4
                            sm:px-6
                        "
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="
                                    flex
                                    h-[36px]
                                    w-[36px]
                                    items-center
                                    justify-center
                                    rounded-[9px]
                                    border
                                    border-[#C9D9D3]
                                    bg-[#E8F0ED]
                                    text-[#56766D]
                                "
                            >
                                <Activity
                                    size={16}
                                    strokeWidth={1.9}
                                />
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <h2
                                        className="
                                            text-[14px]
                                            font-bold
                                            tracking-[-0.015em]
                                            text-[var(--color-text-primary)]
                                        "
                                    >
                                        Equipment Information
                                    </h2>

                                    <span
                                        className="
                                            h-[5px]
                                            w-[5px]
                                            rounded-full
                                            bg-[var(--color-secondary)]
                                        "
                                    />
                                </div>

                                <p
                                    className="
                                        mt-0.5
                                        text-[10px]
                                        font-medium
                                        text-[var(--color-text-muted)]
                                    "
                                >
                                    Core identification and equipment specifications.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* FORM CONTENT */}
                    <div
                        className="
                            px-5
                            pb-5
                            pt-4
                            sm:px-6
                            sm:pb-6
                        "
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            requiredMark={false}
                            onFinish={
                                handleSubmit
                            }
                            className="
                                w-full

                                [&_.ant-form-item-label>label]:!text-[10.5px]
                                [&_.ant-form-item-label>label]:!font-bold
                                [&_.ant-form-item-label>label]:!uppercase
                                [&_.ant-form-item-label>label]:!tracking-[0.07em]
                                [&_.ant-form-item-label]:!pb-1.5

                                [&_.ant-form-item-explain-error]:!text-[10.5px]

                                [&_.ant-form-item-required::before]:!text-[#B54A4A]

                                [&_.ant-input]:!rounded-[10px]
                            "
                        >
                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    gap-x-6
                                    md:grid-cols-2
                                "
                            >
                                {/* =================================================
                                    EQUIPMENT NAME
                                ================================================== */}
                                <Form.Item
                                    name="name"
                                    label={
                                        <span className="flex items-center gap-1.5">
                                            <Wrench
                                                size={12}
                                                strokeWidth={
                                                    1.9
                                                }
                                                className="text-[#56766D]"
                                            />
                                            Equipment Name
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            whitespace: true,
                                            message:
                                                "Please enter equipment name",
                                        },
                                    ]}
                                    className="!mb-4"
                                >
                                    <FormInput
                                        placeholder="Enter equipment name"
                                    />
                                </Form.Item>

                                {/* =================================================
                                    EQUIPMENT ID
                                ================================================== */}
                                <Form.Item
                                    name="equipment_id"
                                    label={
                                        <span className="flex items-center gap-1.5">
                                            <Hash
                                                size={12}
                                                strokeWidth={
                                                    1.9
                                                }
                                                className="text-[#56766D]"
                                            />
                                            Equipment ID
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            whitespace: true,
                                            message:
                                                "Please enter equipment ID",
                                        },
                                    ]}
                                    className="!mb-4"
                                >
                                    <FormInput
                                        placeholder="e.g. EQ-001"
                                    />
                                </Form.Item>

                                {/* =================================================
                                    MAKE
                                ================================================== */}
                                <Form.Item
                                    name="make"
                                    label={
                                        <span className="flex items-center gap-1.5">
                                            <Factory
                                                size={12}
                                                strokeWidth={
                                                    1.9
                                                }
                                                className="text-[#56766D]"
                                            />
                                            Make
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            whitespace: true,
                                            message:
                                                "Please enter manufacturer",
                                        },
                                    ]}
                                    className="!mb-4"
                                >
                                    <FormInput
                                        placeholder="Enter manufacturer"
                                    />
                                </Form.Item>

                                {/* =================================================
                                    MODEL
                                ================================================== */}
                                <Form.Item
                                    name="model"
                                    label={
                                        <span className="flex items-center gap-1.5">
                                            <Cpu
                                                size={12}
                                                strokeWidth={
                                                    1.9
                                                }
                                                className="text-[#56766D]"
                                            />
                                            Model
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            whitespace: true,
                                            message:
                                                "Please enter equipment model",
                                        },
                                    ]}
                                    className="!mb-4"
                                >
                                    <FormInput
                                        placeholder="Enter equipment model"
                                    />
                                </Form.Item>

                                {/* =================================================
                                    EQUIPMENT TYPE
                                ================================================== */}
                                <Form.Item
                                    name="equipment_type"
                                    label={
                                        <span className="flex items-center gap-1.5">
                                            <Layers3
                                                size={12}
                                                strokeWidth={
                                                    1.9
                                                }
                                                className="text-[#56766D]"
                                            />
                                            Equipment Type
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            whitespace: true,
                                            message:
                                                "Please enter equipment type",
                                        },
                                    ]}
                                    className="!mb-0 md:col-span-2"
                                >
                                    <FormInput
                                        placeholder="Enter equipment type"
                                    />
                                </Form.Item>
                            </div>
                        </Form>
                    </div>
                </section>

                {/* =====================================================
                    CHECKLIST CONFIGURATION
                ====================================================== */}
                <section
                    className="
                        mt-5
                        overflow-hidden
                        rounded-[18px]
                        border
                        border-[var(--color-border)]
                        bg-[var(--color-surface)]
                        shadow-[0_5px_20px_rgba(36,50,56,0.055)]
                    "
                >
                    <div
                        className="
                            h-[2px]
                            w-full
                            bg-[var(--color-secondary)]
                        "
                    />

                    <div className="p-5 sm:p-6">
                        <ChecklistConfiguration
                            value={categories}
                            onChange={
                                setCategories
                            }
                            description="Define categorical inspection checkpoints for the field engineers."
                        />
                    </div>
                </section>
            </div>

            {/* =====================================================
                FLOATING ACTION BUTTONS
            ====================================================== */}
            <FloatingActionButtons
                onSave={() =>
                    form.submit()
                }
                onCancel={
                    handleCancel
                }
                isSaving={
                    isSaving
                }
                saveLabel="Update"
                cancelLabel="Cancel"
            />
        </div>
    );
};

export default EquipmentPanel;