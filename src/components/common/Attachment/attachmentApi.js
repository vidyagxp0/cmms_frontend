import api from "../../../services/api";

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

  const targetFile = file || (Array.isArray(files) && files.length > 0 ? files[0] : null);
  if (!targetFile) {
    throw new Error("File is required for attachment upload.");
  }

  const formData = new FormData();
  formData.append("attachment_field", attachment_field || "");
  formData.append("label", label || "");
  formData.append("Type", Type || "single-file");

  formData.append("file", targetFile);
  formData.append("files", targetFile);

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

  const fileListToUpload = Array.isArray(files) && files.length > 0 ? files : (file ? [file] : []);
  if (!fileListToUpload.length) {
    throw new Error("At least one file is required.");
  }

  const isMultiple = fileListToUpload.length > 1;
  const attachmentType = Type
    ? (Type === "multiple-file" && !isMultiple ? "single-file" : Type)
    : (isMultiple ? "multiple-file" : "single-file");

  const formData = new FormData();
  formData.append("attachment_field", attachment_field || "");
  formData.append("label", label || "");
  formData.append("Type", attachmentType);

  // Single file parameter (for single file validator endpoints)
  formData.append("file", fileListToUpload[0]);

  // Array file parameter (files[] array for multi-file endpoints)
  fileListToUpload.forEach((f) => {
    formData.append("files[]", f);
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