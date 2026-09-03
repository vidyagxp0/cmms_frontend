import React, { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { Form } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import SectionHeader from "../../../components/common/SectionHeader/SectionHeader";
import FormInput from "../../../components/common/Form/FormInput";
import FloatingActionButtons from "../../../components/ui/FloatingActionButtons";
import Skeleton from "../../../components/common/Skeleton/Skeleton";
import ChecklistConfiguration from "./ChecklistConfig"; // adjust path if needed

import { getEquipmentDetail, updateEquipment } from "../../../services/usersApi/equipmentApi";

const EquipmentPanel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  // ─── Fetch detail ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) {
        toast.error("Equipment ID is missing.");
        navigate(-1);
        return;
      }
      try {
        setIsLoading(true);
        const response = await getEquipmentDetail(id);
        const data = response?.data?.data;
        if (!data) {
          toast.error("Equipment not found.");
          navigate(-1);
          return;
        }

        // Populate form fields
        form.setFieldsValue({
          name: data.name || "",
          equipment_id: data.equipment_id || "",
          make: data.make || "",
          model: data.model || "",
          equipment_type: data.equipment_type || "",
        });

        // Transform checklist_config into categories state
        const fetchedCategories = (data.checklist_config || []).map((item, index) => ({
          id: `cat-${Date.now()}-${index}`,
          name: item.category || "",
          checkpoints: (item.checkpoints || []).map((text, cpIndex) => ({
            id: `cp-${Date.now()}-${index}-${cpIndex}`,
            text: text || "",
          })),
        }));
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to fetch equipment detail:", error);
        toast.error(error?.response?.data?.message || "Failed to load equipment details.");
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id, form, navigate]);

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
      await updateEquipment(id, payload);
      toast.success("Equipment updated successfully.");
    //   navigate("/user/equipment-dashboard");
    } catch (error) {
      console.error("Failed to update equipment:", error);
      toast.error(error?.response?.data?.message || "Failed to update equipment. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isSaving) return;
    navigate("/user/equipment-dashboard");
  };

  // ─── Loading state ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton variant="title" className="w-full" />
        <Skeleton variant="form" fields={6} />
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity size={20} />
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#263B35]">
              Equipment Details
            </h1>
          </div>
        </div>
        {/* No site/process info */}
      </div>

      {/* Form */}
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

      {/* ─── CHECKLIST CONFIGURATION (Reusable) ────────────────────── */}
      <ChecklistConfiguration
        value={categories}
        onChange={setCategories}
        description="Define categorical inspection checkpoints for the field engineers."
      />

      {/* ─── Floating Action Buttons ────────────────────────────────── */}
      <FloatingActionButtons
        onSave={() => form.submit()}
        onCancel={handleCancel}
        isSaving={isSaving}
        saveLabel="Update"
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default EquipmentPanel;