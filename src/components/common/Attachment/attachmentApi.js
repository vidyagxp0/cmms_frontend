import api from "../../../services/api";

// ==========================================================
// BUILD ATTACHMENT FORMDATA
// ==========================================================

const buildAttachmentFormData = ({
  attachment_field,
  label,
  Type,
  fileList,
}) => {
  const formData = new FormData();

  formData.append("attachment_field", attachment_field || "");
  formData.append("label", label || "");
  formData.append("Type", Type || "single-file");

  // Single file
  if (fileList.length === 1) {
    formData.append("file", fileList[0]);
  }

  // Multiple files -> send as array
  if (fileList.length > 1) {
    fileList.forEach((file) => {
      formData.append("files[]", file);
    });
  }

  return formData;
};

// ==========================================================
// SINGLE ATTACHMENT
// POST /user/upload-attachment/{recordId}
// ==========================================================

export const addSingleAttachment = async ({
  record_id,
  attachment_field,
  label,
  file,
  files,
  Type,
}) => {
  if (!record_id) {
    throw new Error("record_id is required for attachment upload.");
  }

  const targetFile =
    file ||
    (Array.isArray(files) && files.length > 0 ? files[0] : null);

  if (!targetFile) {
    throw new Error("File is required for attachment upload.");
  }

  const formData = buildAttachmentFormData({
    attachment_field,
    label,
    Type: "single-file",
    fileList: [targetFile],
  });

  return api.post(
    `/user/upload-attachment/${record_id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// ==========================================================
// MULTIPLE ATTACHMENTS
// POST /user/upload-attachment/{recordId}
// ==========================================================

export const addMultipleAttachments = async ({
  record_id,
  attachment_field,
  label,
  file,
  files = [],
  Type,
}) => {
  if (!record_id) {
    throw new Error("record_id is required for attachment upload.");
  }

  const fileListToUpload =
    Array.isArray(files) && files.length > 0
      ? files
      : file
      ? [file]
      : [];

  if (!fileListToUpload.length) {
    throw new Error("At least one file is required.");
  }

  const attachmentType =
    fileListToUpload.length > 1
      ? "multiple-file"
      : "single-file";

  const formData = buildAttachmentFormData({
    attachment_field,
    label,
    Type: Type || attachmentType,
    fileList: fileListToUpload,
  });

  return api.post(
    `/user/upload-attachment/${record_id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};