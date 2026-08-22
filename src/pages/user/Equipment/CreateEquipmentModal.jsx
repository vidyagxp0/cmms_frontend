import React, { useState } from "react";

import InputField from "../../../components/ui/Input";
import UserModal from "../../../components/common/UserModal/UserModal";
import { addEquipment } from "../../../services/usersApi/equipmentApi";

const initialForm = {
    name: "",
    equipment_id: "",
    make: "",
    model: "",
    equipment_type: "",
};

const CreateEquipmentModal = ({ open, onClose }) => {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setIsSubmitting(true);

            const payload = {
                name: form.name.trim(),
                equipment_id: form.equipment_id.trim(),
                make: form.make.trim(),
                model: form.model.trim(),
                equipment_type: form.equipment_type.trim(),
            };

            await addEquipment(payload);

            setForm(initialForm);
            setErrors({});
            onClose();
        } catch (error) {
            console.error("Failed to create equipment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;

        setForm(initialForm);
        setErrors({});
        onClose();
    };

    return (
        <UserModal
            isOpen={open}
            onClose={handleClose}
            title="Create Equipment"
            description="Add the equipment details below to create a new equipment record."
            width="max-w-[700px]"
        >
            <div className="space-y-7">
                {/* FORM */}
                <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
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

                    <div className="sm:col-span-2">
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

                {/* FOOTER */}
                <div className="flex items-center justify-between border-t border-[#E8ECEA] pt-5">
                    <p className="hidden text-[10.5px] text-[#929B96] sm:block">
                        All fields are required
                    </p>

                    <div className="ml-auto flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="
                                h-[40px]
                                rounded-[9px]
                                border border-[#D9E0DC]
                                bg-white
                                px-5
                                text-[12px]
                                font-semibold
                                text-[#59655F]
                                transition-all duration-200
                                hover:border-[#C5CEC9]
                                hover:bg-[#F7F9F8]
                                hover:text-[#3E4944]
                                active:scale-[0.98]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="
                                group
                                flex h-[40px]
                                min-w-[142px]
                                items-center
                                justify-center
                                rounded-[9px]
                                bg-[#26352E]
                                px-5
                                text-[12px]
                                font-semibold
                                text-white
                                shadow-[0_5px_16px_-8px_rgba(38,53,46,0.65)]
                                transition-all duration-200
                                ease-[cubic-bezier(.22,1,.36,1)]
                                hover:-translate-y-[1px]
                                hover:bg-[#1F2D27]
                                hover:shadow-[0_9px_20px_-8px_rgba(38,53,46,0.7)]
                                active:translate-y-0
                                active:scale-[0.98]
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            {isSubmitting ? "Creating..." : "Create Equipment"}
                        </button>
                    </div>
                </div>
            </div>
        </UserModal>
    );
};

export default CreateEquipmentModal;