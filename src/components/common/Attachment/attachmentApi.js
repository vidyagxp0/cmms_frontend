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
}) => {
  if (!record_id) {
    throw new Error("record_id is required for attachment upload.");
  }

  if (!file) {
    throw new Error("File is required for attachment upload.");
  }

  const formData = new FormData();

  formData.append("attachment_field", attachment_field || "");
  formData.append("label", label || "");
  formData.append("file", file);

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
  files = [],
}) => {
  if (!record_id) {
    throw new Error("record_id is required for attachment upload.");
  }

  if (!files.length) {
    throw new Error("At least one file is required.");
  }

  const formData = new FormData();

  formData.append("attachment_field", attachment_field || "");
  formData.append("label", label || "");

  files.forEach((file) => {
    formData.append("files", file);
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