import React, { useState, useRef } from "react";
import { Upload, Skeleton } from "antd";
import { UploadCloud, X, FileText, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import UserModal from "../UserModal/UserModal";
import { appConfig } from "../../../config/appConfig";

const { Dragger } = Upload;

const getNormalizedFileKey = (item) => {
  if (!item) return "";
  if (item instanceof File) {
    return `name-${item.name.toLowerCase()}`;
  }
  if (typeof item === "string") {
    const raw = item.split("/").pop().split("?")[0].toLowerCase();
    const clean = raw.replace(/^[0-9a-fA-F_-]+_(?=[^/]+\.[a-zA-Z0-9]+$)/, "");
    return `name-${clean || raw}`;
  }
  if (typeof item === "object") {
    const raw = (
      item.original_name ||
      item.name ||
      item.file_name ||
      (item.path ? item.path.split("/").pop().split("?")[0] : "") ||
      (item.url ? item.url.split("/").pop().split("?")[0] : "")
    );
    if (raw) {
      const lower = String(raw).toLowerCase();
      const clean = lower.replace(/^[0-9a-fA-F_-]+_(?=[^/]+\.[a-zA-Z0-9]+$)/, "");
      return `name-${clean || lower}`;
    }
    if (item.id) {
      return `id-${item.id}`;
    }
  }
  return JSON.stringify(item);
};

const deduplicateAttachments = (list) => {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  return list.filter((item) => {
    if (!item) return false;
    const key = getNormalizedFileKey(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const parseAttachmentList = (val, fileListProp) => {
  const target = val !== undefined && val !== null ? val : fileListProp;
  if (!target) return [];
  let rawList = [];
  if (Array.isArray(target)) {
    rawList = target;
  } else if (typeof target === "string" && target.trim() !== "") {
    try {
      const parsed = JSON.parse(target);
      if (Array.isArray(parsed)) rawList = parsed;
      else if (parsed && typeof parsed === "object") rawList = [parsed];
    } catch (e) {
      rawList = [{ name: target, path: target }];
    }
  } else if (typeof target === "object") {
    rawList = [target];
  }
  return deduplicateAttachments(rawList);
};

const getFileName = (file) => {
  if (!file) return "Attachment";
  if (file instanceof File) return file.name;
  if (typeof file === "string") {
    const parts = file.split("/");
    const raw = parts[parts.length - 1] || "Attachment";
    return raw.replace(/^[0-9a-fA-F_-]+_(?=[^/]+\.[a-zA-Z0-9]+$)/, "");
  }
  if (typeof file === "object") {
    if (file.original_name) return file.original_name;
    if (file.name) return file.name;
    if (file.file_name) {
      return String(file.file_name).replace(/^[0-9a-fA-F_-]+_(?=[^/]+\.[a-zA-Z0-9]+$)/, "");
    }
    if (file.path) {
      const parts = file.path.split("/");
      const raw = parts[parts.length - 1] || "Attachment";
      return raw.replace(/^[0-9a-fA-F_-]+_(?=[^/]+\.[a-zA-Z0-9]+$)/, "");
    }
  }
  return "Attachment";
};

const getAttachmentUrl = (file) => {
  if (!file) return "";
  if (file instanceof File) {
    if (file.url) return file.url;
    return URL.createObjectURL(file);
  }
  if (typeof file === "string") {
    if (file.startsWith("http://") || file.startsWith("https://") || file.startsWith("blob:")) {
      return file;
    }
    const cleanPath = file.replace(/^\//, "");
    const apiBase = appConfig.apiUrl || "";
    const origin = apiBase.startsWith("http")
      ? apiBase.replace(/\/api\/?$/, "")
      : (window.location.origin || "http://127.0.0.1:8000");
    return `${origin}/${cleanPath}`;
  }
  if (typeof file === "object") {
    if (file.url) return file.url;
    if (file.path) {
      if (file.path.startsWith("http://") || file.path.startsWith("https://")) {
        return file.path;
      }
      const cleanPath = file.path.replace(/^\//, "");
      const apiBase = appConfig.apiUrl || "";
      const origin = apiBase.startsWith("http")
        ? apiBase.replace(/\/api\/?$/, "")
        : (window.location.origin || "http://127.0.0.1:8000");
      return `${origin}/${cleanPath}`;
    }
  }
  return "";
};

const FormAttachment = ({
  multiple = false,
  recordId,
  attachmentField,
  label,
  uploadApi,
  value,
  fileList: fileListProp,
  onChange,
  disabled = false,
  maxCount,
}) => {
  const [uploading, setUploading] = useState(false);
  const isUploadingRef = useRef(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  const fileList = parseAttachmentList(value, fileListProp);

  const createCleanFile = (file) => {
    if (!(file instanceof File)) return null;
    return new File([file], file.name, { type: file.type, lastModified: file.lastModified });
  };

  const getFileKey = (file) => {
    if (!file) return "";
    return getNormalizedFileKey(file);
  };

  const handleChange = async ({ fileList: newFileList }) => {
    if (disabled || uploading || isUploadingRef.current) return;
    if (!newFileList || !newFileList.length) return;
    if (!recordId) { toast.error("Record ID is required for attachment upload."); return; }
    if (!attachmentField) { toast.error("Attachment field is required."); return; }
    if (!label) { toast.error("Attachment label is required."); return; }
    if (!uploadApi) { toast.error("Attachment API is not configured."); return; }

    const selectedFiles = newFileList
      .map((item) => item?.originFileObj)
      .filter((file) => file instanceof File);
    if (!selectedFiles.length) { toast.error("No valid file selected."); return; }

    const existingKeys = new Set(fileList.map((f) => getNormalizedFileKey(f)));
    const filesToUpload = multiple
      ? selectedFiles.filter((file) => !existingKeys.has(getNormalizedFileKey(file)))
      : selectedFiles.slice(0, 1);
    if (!filesToUpload.length) return;

    const cleanFiles = filesToUpload.map(createCleanFile).filter(Boolean);
    if (!cleanFiles.length) { toast.error("No valid file selected."); return; }

    try {
      isUploadingRef.current = true;
      setUploading(true);
      const attachmentType = cleanFiles.length > 1 ? "multiple-file" : "single-file";
      if (!multiple) {
        const file = cleanFiles[0];
        const response = await uploadApi({
          record_id: recordId,
          attachment_field: attachmentField,
          label,
          file,
          files: cleanFiles,
          Type: attachmentType,
        });
        const responseData = response?.data;

        // Prioritize new_attachments, then the last element of attachments, then attachment object, then fallback
        const newAtts = responseData?.new_attachments || responseData?.data?.new_attachments;
        const allAtts = responseData?.attachments || responseData?.data?.attachments || responseData?.files || responseData?.data?.files;
        const singleAtt = responseData?.attachment || responseData?.data?.attachment;
        const uploadedObj = (Array.isArray(newAtts) && newAtts.length > 0)
          ? newAtts[newAtts.length - 1]
          : (Array.isArray(allAtts) && allAtts.length > 0)
          ? allAtts[allAtts.length - 1]
          : (singleAtt || {
              name: file.name,
              size: file.size,
              url: responseData?.url || "",
              path: responseData?.path || "",
            });

        onChange?.([uploadedObj]);
        toast.success(responseData?.message || "Attachment uploaded successfully.");
      } else {
        const response = await uploadApi({
          record_id: recordId,
          attachment_field: attachmentField,
          label,
          file: cleanFiles[0],
          files: cleanFiles,
          Type: attachmentType,
        });
        const responseData = response?.data;
        const newAtts = responseData?.new_attachments || responseData?.data?.new_attachments;
        const allAtts = responseData?.attachments || responseData?.data?.attachments || responseData?.files || responseData?.data?.files;
        const singleAtt = responseData?.attachment || responseData?.data?.attachment;

        let mergedFiles = [];
        if (Array.isArray(allAtts) && allAtts.length > 0) {
          mergedFiles = allAtts;
        } else if (Array.isArray(newAtts) && newAtts.length > 0) {
          const existingFiles = fileList.filter((f) => f instanceof File || typeof f === "object" || typeof f === "string");
          mergedFiles = [...newAtts, ...existingFiles];
        } else if (singleAtt && typeof singleAtt === "object" && (singleAtt.url || singleAtt.path || singleAtt.file_name || singleAtt.name)) {
          const existingFiles = fileList.filter((f) => f instanceof File || typeof f === "object" || typeof f === "string");
          mergedFiles = [singleAtt, ...existingFiles];
        } else {
          const existingFiles = fileList.filter((f) => f instanceof File || typeof f === "object" || typeof f === "string");
          mergedFiles = [...cleanFiles, ...existingFiles];
        }

        const finalDeduplicated = deduplicateAttachments(mergedFiles);
        onChange?.(finalDeduplicated);
        toast.success(responseData?.message || (cleanFiles.length === 1 ? "Attachment uploaded successfully." : "Attachments uploaded successfully."));
      }
    } catch (error) {
      console.error("Attachment upload failed:", error);
      toast.error(error?.response?.data?.message || error?.response?.data?.error || error?.message || "Failed to upload attachment.");
    } finally {
      setUploading(false);
      isUploadingRef.current = false;
    }
  };

  const handleRequestRemove = (file, index) => {
    if (disabled || uploading) return;
    setItemToRemove({ file, index });
    setRemoveModalOpen(true);
  };

  const handleConfirmRemove = () => {
    if (!itemToRemove) return;
    const { file, index } = itemToRemove;
    const newList = fileList.filter((item, itemIndex) => {
      if (item instanceof File && file instanceof File) {
        return getFileKey(item) !== getFileKey(file);
      }
      if (typeof item === "object" && typeof file === "object" && item?.file_name && file?.file_name) {
        return item.file_name !== file.file_name;
      }
      return itemIndex !== index;
    });
    onChange?.(newList);
    setRemoveModalOpen(false);
    setItemToRemove(null);
    toast.success("Attachment removed.");
  };

  const handleCancelRemove = () => {
    setRemoveModalOpen(false);
    setItemToRemove(null);
  };

  const handleOpenAttachment = (file, event) => {
    if (event) event.stopPropagation();
    const url = getAttachmentUrl(file);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      toast.error("Attachment URL is not available.");
    }
  };

  const uploadDisabled = disabled || uploading;

  return (
    <div className="w-full">
      <div className={`w-full overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50/70 transition-all duration-200 ${!uploadDisabled ? "hover:border-primary/50 hover:bg-slate-50" : ""} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}>
        <Dragger
          multiple={multiple}
          beforeUpload={() => false}
          onChange={handleChange}
          disabled={uploadDisabled}
          showUploadList={false}
          fileList={[]}
          maxCount={maxCount || (multiple ? undefined : 1)}
          className="!w-full !border-0 !bg-transparent [&_.ant-upload]:!flex [&_.ant-upload]:!w-full [&_.ant-upload]:!min-h-[120px] [&_.ant-upload]:!items-center [&_.ant-upload]:!justify-center [&_.ant-upload]:!border-0 [&_.ant-upload]:!bg-transparent [&_.ant-upload]:!p-0 [&_.ant-upload-btn]:!flex [&_.ant-upload-btn]:!w-full [&_.ant-upload-btn]:!items-center [&_.ant-upload-btn]:!justify-center [&_.ant-upload-btn]:!p-0"
        >
          {uploading && (
            <div className="flex min-h-[120px] w-full items-center justify-center px-6 py-5">
              <div className="flex w-full max-w-md items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                  <Loader2 size={21} className="animate-spin text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <Skeleton.Input active size="small" block />
                  <div className="mt-2"><Skeleton.Input active size="small" style={{ width: "45%" }} /></div>
                  <p className="mt-2 text-xs text-slate-500">Uploading attachment...</p>
                </div>
              </div>
            </div>
          )}
          {!uploading && disabled && (
            <div className="flex min-h-[120px] w-full items-center justify-center px-6 py-5">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <UploadCloud size={21} />
                </div>
                <p className="m-0 text-sm font-semibold text-slate-500">Attachment upload disabled</p>
              </div>
            </div>
          )}
          {!uploading && !disabled && (
            <div className="flex min-h-[120px] w-full items-center justify-center px-6 py-5">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UploadCloud size={21} />
                </div>
                <p className="m-0 text-sm font-semibold text-[#263B35]">
                  {multiple ? "Click or drag files to upload" : "Click or drag a file to upload"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {multiple ? "You can select multiple attachments" : "Select one attachment"}
                </p>
              </div>
            </div>
          )}
        </Dragger>
      </div>

      {!uploading && fileList.length > 0 && (
        <div className="mt-3 space-y-2">
          {fileList.map((file, index) => {
            const isNativeFile = file instanceof File;
            const fileName = getFileName(file);
            const fileSize = isNativeFile ? file.size : (file?.size || 0);
            const fileKey = isNativeFile ? getFileKey(file) : (file?.file_name || file?.id || `${fileName}-${index}`);
            const fileUrl = getAttachmentUrl(file);

            return (
              <div
                key={fileKey}
                onClick={(e) => handleOpenAttachment(file, e)}
                className="group flex w-full cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-primary/40 hover:bg-slate-50/50"
                title="Click to open attachment in a new tab"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:scale-105">
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-medium text-[#263B35] group-hover:text-primary group-hover:underline">
                      {fileName}
                    </p>
                    {fileUrl && <ExternalLink size={13} className="shrink-0 text-slate-400 group-hover:text-primary" />}
                  </div>
                  {fileSize > 0 && (
                    <p className="mt-0.5 text-[11px] text-slate-400">{(fileSize / 1024).toFixed(1)} KB</p>
                  )}
                </div>
                <CheckCircle2 size={18} className="shrink-0 text-green-500" />
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRequestRemove(file, index);
                    }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    title="Remove attachment"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <UserModal
        isOpen={removeModalOpen}
        onClose={handleCancelRemove}
        title="Remove Attachment"
        description="Please confirm this action before continuing."
        width="max-w-[420px]"
      >
        <div className="space-y-5">
          <p className="text-[13px] leading-6 text-[#596760]">
            Are you sure you want to remove this attachment?
          </p>
          <div className="flex justify-end gap-3 border-t border-[#E8ECEA] pt-4">
            <button
              type="button"
              onClick={handleCancelRemove}
              className="h-9 rounded-lg border border-[#D5DEDA] bg-white px-4 text-[12px] font-semibold text-[#596760] transition-all duration-200 hover:bg-[#F6F8F7] hover:text-[#263B35] active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRemove}
              className="h-9 rounded-lg bg-[#F52F3E] px-4 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(245,47,62,0.20)] transition-all duration-200 hover:bg-[#E52635] hover:shadow-[0_6px_15px_rgba(245,47,62,0.28)] active:scale-[0.98]"
            >
              Remove
            </button>
          </div>
        </div>
      </UserModal>
    </div>
  );
};

export default FormAttachment;
