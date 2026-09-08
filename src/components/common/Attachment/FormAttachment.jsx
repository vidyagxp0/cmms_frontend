import React, { useState } from "react";
import { Upload, Button, message } from "antd";
import { UploadCloud, X } from "lucide-react";

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

  const handleChange = ({ fileList: newFileList }) => {
    onChange?.(newFileList);
  };

  const handleUpload = async () => {
    if (!attachmentField) {
      message.error("Attachment field is required.");
      return;
    }

    if (!label) {
      message.error("Attachment label is required.");
      return;
    }

    if (!uploadApi) {
      message.error("Attachment API is not configured.");
      return;
    }

    if (!fileList.length) {
      message.error("Please select an attachment.");
      return;
    }

    try {
      setUploading(true);
      const originalFiles = fileList
        .map((item) => item?.originFileObj)
        .filter((file) => file instanceof File)
        .map(
          (file) =>
            new File([file], file.name, {
              type: file.type,
              lastModified: file.lastModified,
            })
        );

      if (!originalFiles.length) {
        message.error("No valid file selected.");
        return;
      }

      if (!multiple) {
        await uploadApi({
          ...(recordId ? { record_id: recordId } : {}),
          attachment_field: attachmentField,
          label,
          file: originalFiles[0],
        });
      }

      else {
        await uploadApi({
          ...(recordId ? { record_id: recordId } : {}),
          attachment_field: attachmentField,
          label,
          files: originalFiles,
        });
      }

      message.success(
        multiple
          ? "Attachments uploaded successfully."
          : "Attachment uploaded successfully."
      );

      // Clear selected files
      onChange?.([]);
    } catch (error) {
      console.error("Attachment upload failed:", error);

      message.error(
        error?.response?.data?.message ||
          "Failed to upload attachment."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (file) => {
    const newList = fileList.filter(
      (item) => item.uid !== file.uid
    );

    onChange?.(newList);
  };

  return (
    <div className="w-full">
      <Upload
        multiple={multiple}
        fileList={fileList}
        beforeUpload={() => false}
        onChange={handleChange}
        onRemove={handleRemove}
        disabled={disabled || uploading}
        maxCount={
          maxCount ||
          (multiple ? undefined : 1)
        }
        showUploadList={{
          showPreviewIcon: false,
          showDownloadIcon: false,
          showRemoveIcon:
            !disabled && !uploading,
          removeIcon: <X size={14} />,
        }}
      >
        {!disabled &&
          (multiple || fileList.length === 0) && (
            <Button
              icon={<UploadCloud size={16} />}
              disabled={uploading}
            >
              {multiple
                ? "Select Attachments"
                : "Select Attachment"}
            </Button>
          )}
      </Upload>

      {fileList.length > 0 && !disabled && (
        <Button
          type="primary"
          loading={uploading}
          onClick={handleUpload}
          className="mt-3"
        >
          {uploading
            ? "Uploading..."
            : multiple
              ? "Upload Attachments"
              : "Upload Attachment"}
        </Button>
      )}
    </div>
  );
};

export default FormAttachment;