import React, { useEffect, useState } from "react";
import {
    ArrowLeft,
    Loader2,
    RotateCcw,
    Save,
    Settings2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import InputField from "../../../components/ui/Input";
import {
    getEquipmentDetail,
    updateEquipment,
} from "../../../services/usersApi/equipmentApi";
import FloatingActionButtons from "../../../components/ui/FloatingActionButtons";
import Skeleton from "../../../components/common/Skeleton/Skeleton";

const initialForm = {
    name: "",
    equipment_id: "",
    make: "",
    model: "",
    equipment_type: "",
};

const EquipmentPanel = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [equipment, setEquipment] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showActions, setShowActions] = useState(false);

    const fetchEquipmentDetail = async () => {
        try {
            setLoading(true);

            const response = await getEquipmentDetail(id);
            console.log("Equipment Detail Response:", response);

            const data = response?.data?.data || null;

            setEquipment(data);

            if (data) {
                setForm({
                    name: data.name || "",
                    equipment_id: data.equipment_id || "",
                    make: data.make || "",
                    model: data.model || "",
                    equipment_type: data.equipment_type || "",
                });
            }
        } catch (error) {
            console.error("Failed to fetch equipment detail:", error);
            setEquipment(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchEquipmentDetail();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = "Equipment name is required.";
        }

        if (!form.equipment_id.trim()) {
            newErrors.equipment_id = "Equipment ID is required.";
        }

        if (!form.make.trim()) {
            newErrors.make = "Make is required.";
        }

        if (!form.model.trim()) {
            newErrors.model = "Model is required.";
        }

        if (!form.equipment_type.trim()) {
            newErrors.equipment_type = "Equipment type is required.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleExit = () => {
       navigate('/user/equipment-dashboard')
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setIsSaving(true);

            const payload = {
                name: form.name.trim(),
                equipment_id: form.equipment_id.trim(),
                make: form.make.trim(),
                model: form.model.trim(),
                equipment_type: form.equipment_type.trim(),
            };

            await updateEquipment(id, payload);

            toast.success("Equipment updated successfully.");

            await fetchEquipmentDetail();
        } catch (error) {
            console.error("Failed to update equipment:", error);

            toast.error(
                error?.response?.data?.message ||
                    "Failed to update equipment. Please try again."
            );
        } finally {
            setIsSaving(false);
        }
    };

if (loading) {
    return (
        <div className="h-full min-h-0 overflow-auto bg-[#F7F9F8] px-5 py-5 sm:px-8 sm:py-6">
            <div className="mx-auto w-full max-w-6xl">
                <Skeleton variant="form" fields={5} />
            </div>
        </div>
    );
}

    if (!equipment) {
        return (
            <div className="flex h-full min-h-0 items-center justify-center bg-[#F7F9F8]">
                <div className="rounded-2xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <Settings2 size={20} />
                    </div>

                    <h2 className="text-sm font-semibold text-slate-700">
                        Equipment not found
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        The requested equipment record could not be loaded.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="
                            mt-5 inline-flex h-9 items-center gap-2
                            rounded-lg bg-[#26352E] px-4
                            text-xs font-semibold text-white
                            transition-all duration-200
                            hover:bg-[#1F2D27]
                        "
                    >
                        <ArrowLeft size={14} />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#F7F9F8]">
            {/* Header */}
            <div className="shrink-0 border-b border-[#E8ECEA] bg-white">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="
                                flex h-9 w-9 items-center justify-center
                                rounded-lg border border-[#D9E0DC]
                                bg-white text-[#59655F]
                                transition-all duration-200
                                hover:border-[#C5CEC9]
                                hover:bg-[#F7F9F8]
                            "
                            title="Go back"
                        >
                            <ArrowLeft size={16} />
                        </button>

                        <div>
                            <h1 className="text-lg font-semibold tracking-tight text-[#26352E]">
                                {equipment.name}
                            </h1>

                            <p className="mt-0.5 text-xs text-[#929B96]">
                                Equipment configuration and details
                            </p>
                        </div>
                    </div>

                    <div className="hidden items-center gap-2 sm:flex">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#929B96]">
                            Equipment ID
                        </span>

                        <span
                            className="
                                rounded-lg border border-indigo-100
                                bg-indigo-50/70 px-3 py-1.5
                                font-mono text-[11px] font-semibold
                                tracking-wide text-indigo-700
                            "
                        >
                            {equipment.equipment_id || "-"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="min-h-0 flex-1 overflow-auto px-5 py-5 sm:px-8 sm:py-6">
                <div className="mx-auto w-full max-w-6xl">
                    <div
                        className="
                            overflow-hidden rounded-2xl border
                            border-[#E2E8E4] bg-white
                            shadow-[0_8px_30px_rgba(38,53,46,0.05)]
                        "
                    >
                        {/* Section Header */}
                        <div className="border-b border-[#E8ECEA] px-6 py-5 sm:px-8">
                            <div className="flex items-center gap-3">
                                <div
                                    className="
                                        flex h-10 w-10 items-center
                                        justify-center rounded-xl
                                        bg-[#EEF3F0] text-[#26352E]
                                    "
                                >
                                    <Settings2 size={18} />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-[#26352E]">
                                        Equipment Details
                                    </h2>

                                    <p className="mt-0.5 text-xs text-[#929B96]">
                                        Update the information for this equipment
                                        record.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="px-6 py-7 sm:px-8 sm:py-8">
                            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                                <InputField
                                    label="Equipment Name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter equipment name"
                                    required
                                    error={errors.name}
                                />

                                <InputField
                                    label="Equipment ID"
                                    name="equipment_id"
                                    value={form.equipment_id}
                                    onChange={handleChange}
                                    placeholder="e.g. EQ-001"
                                    required
                                    error={errors.equipment_id}
                                />

                                <InputField
                                    label="Make"
                                    name="make"
                                    value={form.make}
                                    onChange={handleChange}
                                    placeholder="Enter manufacturer"
                                    required
                                    error={errors.make}
                                />

                                <InputField
                                    label="Model"
                                    name="model"
                                    value={form.model}
                                    onChange={handleChange}
                                    placeholder="Enter equipment model"
                                    required
                                    error={errors.model}
                                />

                                <div className="md:col-span-2">
                                    <InputField
                                        label="Equipment Type"
                                        name="equipment_type"
                                        value={form.equipment_type}
                                        onChange={handleChange}
                                        placeholder="Enter equipment type"
                                        required
                                        error={errors.equipment_type}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
      <FloatingActionButtons
    onSave={handleSubmit}
    onCancel={handleExit}
    isSaving={isSaving}
    saveLabel="Save"
    cancelLabel="Exit"
/>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EquipmentPanel;