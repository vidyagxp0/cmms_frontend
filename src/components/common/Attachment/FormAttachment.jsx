import React, { useState } from "react";
import { Upload, message, Skeleton } from "antd";
import { UploadCloud, X, FileText, CheckCircle2, Loader2 } from "lucide-react";

const { Dragger } = Upload;

const FormAttachment = ({
  multiple = false,
  recordId,
  attachmentField,
  label,
  uploadApi,
  value = [],
  onChange,
  disabled = false,
  maxCount,
}) => {
  const [uploading, setUploading] = useState(false);
  const fileList = Array.isArray(value) ? value : [];

  const createCleanFile = (file) => {
    if (!(file instanceof File)) return null;
    return new File([file], file.name, { type: file.type, lastModified: file.lastModified });
  };

  const getFileKey = (file) => {
    if (!(file instanceof File)) return "";
    return `${file.name}-${file.size}-${file.lastModified}`;
  };

  const handleChange = async ({ fileList: newFileList }) => {
    if (disabled || uploading) return;
    if (!newFileList || !newFileList.length) return;
    if (!recordId) { message.error("Record ID is required for attachment upload."); return; }
    if (!attachmentField) { message.error("Attachment field is required."); return; }
    if (!label) { message.error("Attachment label is required."); return; }
    if (!uploadApi) { message.error("Attachment API is not configured."); return; }

    const selectedFiles = newFileList
      .map((item) => item?.originFileObj)
      .filter((file) => file instanceof File);
    if (!selectedFiles.length) { message.error("No valid file selected."); return; }

    const existingKeys = new Set(fileList.filter((f) => f instanceof File).map(getFileKey));
    const filesToUpload = multiple
      ? selectedFiles.filter((file) => !existingKeys.has(getFileKey(file)))
      : selectedFiles.slice(0, 1);
    if (!filesToUpload.length) return;

    const cleanFiles = filesToUpload.map(createCleanFile).filter(Boolean);
    if (!cleanFiles.length) { message.error("No valid file selected."); return; }

    try {
      setUploading(true);
      if (!multiple) {
        const file = cleanFiles[0];
        await uploadApi({ record_id: recordId, attachment_field: attachmentField, label, file });
        onChange?.([file]);
        message.success("Attachment uploaded successfully.");
      } else {
        await uploadApi({ record_id: recordId, attachment_field: attachmentField, label, files: cleanFiles });
        const existingFiles = fileList.filter((f) => f instanceof File);
        const mergedFiles = [...existingFiles, ...cleanFiles];
        onChange?.(mergedFiles);
        message.success(cleanFiles.length === 1 ? "Attachment uploaded successfully." : "Attachments uploaded successfully.");
      }
    } catch (error) {
      console.error("Attachment upload failed:", error);
      message.error(error?.response?.data?.message || error?.response?.data?.error || error?.message || "Failed to upload attachment.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (file, index) => {
    if (disabled || uploading) return;
    const newList = fileList.filter((item, itemIndex) => {
      if (item instanceof File && file instanceof File) return getFileKey(item) !== getFileKey(file);
      return itemIndex !== index;
    });
    onChange?.(newList);
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
            const fileName = isNativeFile ? file.name : file?.name || file?.file_name || "Attachment";
            const fileSize = isNativeFile ? file.size : file?.size || 0;
            const fileKey = isNativeFile ? getFileKey(file) : `${fileName}-${index}`;
            return (
              <div key={fileKey} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#263B35]">{fileName}</p>
                  {fileSize > 0 && <p className="mt-0.5 text-[11px] text-slate-400">{(fileSize / 1024).toFixed(1)} KB</p>}
                </div>
                <CheckCircle2 size={18} className="shrink-0 text-green-500" />
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(file, index)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FormAttachment;