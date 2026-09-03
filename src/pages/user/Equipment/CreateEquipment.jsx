import React, { useState } from "react";
import { Activity } from "lucide-react";
import { Form } from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import FormInput from "../../../components/common/Form/FormInput";
import FloatingActionButtons from "../../../components/ui/FloatingActionButtons";

import { addEquipment } from "../../../services/usersApi/equipmentApi";
import ChecklistConfiguration from "./ChecklistConfig";
import SectionHeader from "../../../components/common/SectionHeader/SectionHeader";

const CreateEquipment = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  // ─── Submit ─────────────────────────────────────────────────────────
  const handleSubmit = async (values) => {
    if (isSaving) return;

    // Build checklist payload – skip empty categories or checkpoints
    const checklistConfig = categories
      .filter((cat) => cat.name.trim() !== "")
      .map((cat) => ({
        category: cat.name.trim(),
        checkpoints: cat.checkpoints
          .map((cp) => cp.text.trim())
          .filter((t) => t !== ""),
      }))
      .filter((cat) => cat.checkpoints.length > 0);

    try {
      setIsSaving(true);
      const payload = {
        name: values.name.trim(),
        equipment_id: values.equipment_id.trim(),
        make: values.make.trim(),
        model: values.model.trim(),
        equipment_type: values.equipment_type.trim(),
        checklist_config: checklistConfig,
      };
      await addEquipment(payload);
      toast.success("Equipment created successfully.");
      form.resetFields();
      setCategories([]);
      navigate("/user/equipment-dashboard");
    } catch (error) {
      console.error("Failed to create equipment:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to create equipment. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isSaving) return;
    form.resetFields();
    setCategories([]);
    navigate("/user/equipment-dashboard");
  };

  return (
    <div className="w-full">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity size={20} />
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#263B35]">
              Create Equipment
            </h1>
          </div>
        </div>
      </div>

      {/* ─── Form ──────────────────────────────────────────────────── */}
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
        className="w-full [&_.ant-form-item-label>label]:!text-[12px] [&_.ant-form-item-label>label]:!font-semibold [&_.ant-form-item-label]:!pb-1.5 [&_.ant-form-item-explain-error]:!text-[11px]"
      >
        <section>
          <SectionHeader title="EQUIPMENT INFORMATION" />
          <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
            <Form.Item
              name="name"
              label={<span>Equipment Name <span className="text-red-500">*</span></span>}
              rules={[{ required: true, whitespace: true, message: "Please enter equipment name" }]}
              className="!mb-4"
            >
              <FormInput placeholder="Enter equipment name" />
            </Form.Item>

            <Form.Item
              name="equipment_id"
              label={<span>Equipment ID <span className="text-red-500">*</span></span>}
              rules={[{ required: true, whitespace: true, message: "Please enter equipment ID" }]}
              className="!mb-4"
            >
              <FormInput placeholder="e.g. EQ-001" />
            </Form.Item>

            <Form.Item
              name="make"
              label={<span>Make <span className="text-red-500">*</span></span>}
              rules={[{ required: true, whitespace: true, message: "Please enter manufacturer" }]}
              className="!mb-4"
            >
              <FormInput placeholder="Enter manufacturer" />
            </Form.Item>

            <Form.Item
              name="model"
              label={<span>Model <span className="text-red-500">*</span></span>}
              rules={[{ required: true, whitespace: true, message: "Please enter equipment model" }]}
              className="!mb-4"
            >
              <FormInput placeholder="Enter equipment model" />
            </Form.Item>

            <Form.Item
              name="equipment_type"
              label={<span>Equipment Type <span className="text-red-500">*</span></span>}
              rules={[{ required: true, whitespace: true, message: "Please enter equipment type" }]}
              className="!mb-4 md:col-span-2"
            >
              <FormInput placeholder="Enter equipment type" />
            </Form.Item>
          </div>
        </section>
      </Form>

      {/* ─── CHECKLIST CONFIGURATION (Reusable Component) ────────── */}
      <ChecklistConfiguration
        value={categories}
        onChange={setCategories}
        description="Define categorical inspection checkpoints for the field engineers."
      />

      {/* ─── Floating Action Buttons ──────────────────────────────── */}
      <FloatingActionButtons
        onSave={() => form.submit()}
        onCancel={handleCancel}
        isSaving={isSaving}
        saveLabel="Create"
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default CreateEquipment;