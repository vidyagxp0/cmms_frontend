import React, { useState } from "react";
import { Modal, Form, Input } from "antd";
import { Mail, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";

const CheckboxEsignModal = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Authenticated eSign",
  subtitle = "Enter your credentials to verify and sign this checkpoint.",
}) => {
  const [form] = Form.useForm();
  const [isVerifying, setIsVerifying] = useState(false);
  const user = useAuthStore((s) => s.user);

  const handleVerify = async () => {
    try {
      const values = await form.validateFields();
      setIsVerifying(true);

      // TODO: replace with real verification API call
      // await verifyESign({ email: values.email, password: values.password });

      // Success
      form.resetFields();
      onSuccess?.({
        signed_by: user?.name || values.email,
        signed_at: new Date(),
      });
      onClose?.();
    } catch (error) {
      if (error?.errorFields) return; // antd validation, ignore
      console.error("eSign verification failed:", error);
      toast.error(
        error?.response?.data?.message || "eSign verification failed."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    if (isVerifying) return;
    form.resetFields();
    onClose?.();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={400}
      centered
      destroyOnClose
      maskClosable={!isVerifying}
      title={null}
      classNames={{ body: "!p-0" }}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#E1E7E4] bg-[#F7F9F8] px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#C9D9D3] bg-[#E8F0ED] text-[#4E7585]">
            <ShieldCheck size={17} strokeWidth={1.9} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[13px] font-bold text-[#263B35]">{title}</h3>
            <p className="mt-0.5 text-[10.5px] font-medium leading-4 text-[#8A9591]">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <Form form={form} layout="vertical" requiredMark={false}>
            <Form.Item
              name="email"
              label={
                <span className="text-[11px] font-semibold text-[#3E4A5C]">
                  Email
                </span>
              }
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
              className="!mb-3"
            >
              <Input
                size="large"
                placeholder="you@company.com"
                prefix={<Mail size={14} className="text-[#9AA5A1]" />}
                disabled={isVerifying}
                className="!rounded-lg !text-[12px]"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="text-[11px] font-semibold text-[#3E4A5C]">
                  Password
                </span>
              }
              rules={[{ required: true, message: "Please enter your password" }]}
              className="!mb-1"
            >
              <Input.Password
                size="large"
                placeholder="Enter your password"
                prefix={<Lock size={14} className="text-[#9AA5A1]" />}
                disabled={isVerifying}
                className="!rounded-lg !text-[12px]"
              />
            </Form.Item>

            <p className="mt-2 text-[10px] font-medium leading-4 text-[#8A9591]">
              Your credentials are used only to verify this sign action. The
              signed timestamp and your name will be recorded.
            </p>
          </Form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[#E1E7E4] bg-[#FAFBFA] px-5 py-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isVerifying}
            className="h-9 rounded-lg border border-[#D5DEDA] bg-white px-4 text-[12px] font-semibold text-[#596760] transition-all hover:bg-[#F6F8F7] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying}
            className="h-9 rounded-lg bg-[#2B5577] px-4 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(43,85,119,0.20)] transition-all hover:bg-[#234766] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isVerifying ? "Verifying…" : "Verify & Sign"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CheckboxEsignModal;