import React, { useState, useEffect } from "react";
import { Modal, Form, Input } from "antd";
import { User, Lock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";
import { eSignChecklist } from "../../../services/usersApi/esignApi";

const CheckboxEsignModal = ({
  isOpen,
  onClose,
  onSuccess,
  title,
  subtitle,
  mode = "authenticated", // "authenticated" | "simple"
}) => {
  const [form] = Form.useForm();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const user = useAuthStore((s) => s.user);

  const isSimple = mode === "simple";

  const resolvedTitle =
    title || (isSimple ? "Sign Checkpoint" : "Authenticated eSign");
  const resolvedSubtitle =
    subtitle ||
    (isSimple
      ? "Confirm to sign this checkpoint. Your data will be saved automatically after signing."
      : "Enter your credentials to verify and sign. Your data will be saved automatically after signing.");

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      form.resetFields();
    }
  }, [isOpen, form]);

  const handleVerify = async () => {
    try {
      let signData;

      if (isSimple) {
        // Simple sign — no credentials required
        setIsVerifying(true);
        signData = {
          signed_by: user?.name || user?.username || "User",
          signed_at: new Date(),
        };
      } else {
        // Authenticated sign — verify against backend
        const values = await form.validateFields();
        setIsVerifying(true);

        const response = await eSignChecklist({
          username: values.username,
          password: values.password,
        });

        const isOk =
          response?.data?.success === true ||
          response?.data?.status === true ||
          response?.status === 200;

        if (!isOk) {
          toast.error(
            response?.data?.message ||
              "Invalid username or password. Please try again."
          );
          setIsVerifying(false);
          return;
        }

        // Prefer backend-provided identity/time if available
        signData = {
          signed_by:
            response?.data?.data?.name ||
            response?.data?.data?.username ||
            values.username,
          signed_at:
            response?.data?.data?.signed_at || new Date(),
        };
      }

      // Trigger parent save — may return false if save failed
      const result = await onSuccess?.(signData);

      if (result === false) {
        // Parent already showed an error toast
        setIsVerifying(false);
        onClose?.();
        return;
      }

      // Show success screen, then close
      setIsSuccess(true);
      await new Promise((r) => setTimeout(r, 1200));
      form.resetFields();
      setIsSuccess(false);
      onClose?.();
    } catch (error) {
      if (error?.errorFields) return; // antd validation
      console.error("eSign verification failed:", error);
      toast.error(
        error?.response?.data?.message ||
          "eSign verification failed. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    if (isVerifying) return;
    form.resetFields();
    setIsSuccess(false);
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
      {isSuccess ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F5EC]">
            <CheckCircle2 size={28} strokeWidth={2} className="text-[#3F8B5C]" />
          </div>
          <h3 className="text-[14px] font-bold text-[#263B35]">Signed & Saved</h3>
          <p className="mt-1 text-[11.5px] font-medium text-[#8A9591]">
            Your credentials were verified and your data has been saved.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[#E1E7E4] bg-[#F7F9F8] px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#C9D9D3] bg-[#E8F0ED] text-[#4E7585]">
              <ShieldCheck size={17} strokeWidth={1.9} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[13px] font-bold text-[#263B35]">
                {resolvedTitle}
              </h3>
              <p className="mt-0.5 text-[10.5px] font-medium leading-4 text-[#8A9591]">
                {resolvedSubtitle}
              </p>
            </div>
          </div>

          {/* Body */}
          {isSimple ? (
            <div className="px-5 py-5">
              <div className="rounded-lg border border-[#D1DBD7] bg-[#F7FAF8] px-4 py-3">
                <p className="text-[11.5px] font-medium leading-5 text-[#43564F]">
                  By signing, you confirm you have reviewed and completed this
                  checkpoint. Your data will be saved automatically after
                  signing.
                </p>
              </div>
              <p className="mt-3 text-[10.5px] font-medium text-[#8A9591]">
                Signing as:{" "}
                <span className="font-semibold text-[#3E4A5C]">
                  {user?.name || user?.username || "User"}
                </span>
              </p>
            </div>
          ) : (
            <div className="px-5 py-4">
              <Form form={form} layout="vertical" requiredMark={false}>
                <Form.Item
                  name="username"
                  label={
                    <span className="text-[11px] font-semibold text-[#3E4A5C]">
                      Username
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please enter your username" },
                  ]}
                  className="!mb-3"
                >
                  <Input
                    size="large"
                    placeholder="Enter your username"
                    prefix={<User size={14} className="text-[#9AA5A1]" />}
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
                  rules={[
                    { required: true, message: "Please enter your password" },
                  ]}
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
                  Your credentials are verified before signing. The signed
                  timestamp and your identity will be recorded.
                </p>
              </Form>
            </div>
          )}

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
              {isVerifying ? "Signing & Saving…" : "Sign & Save"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CheckboxEsignModal;