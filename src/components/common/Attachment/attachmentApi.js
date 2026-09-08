import api from "../../../services/api";

export const addSingleAttachment = ({
  record_id,
  attachment_field,
  label,
  file,
}) => {
  const formData = new FormData();

  if (record_id) {
    formData.append("record_id", record_id);
  }

  formData.append("attachment_field", attachment_field);
  formData.append("label", label);
  formData.append("file", file);

  console.log("Single Attachment Payload:", {
    record_id,
    attachment_field,
    label,
    file,
  });

  return api.post("/calibration/attachment", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const addMultipleAttachments = ({
  record_id,
  attachment_field,
  label,
  files,
}) => {
  const formData = new FormData();

  if (record_id) {
    formData.append("record_id", record_id);
  }

  formData.append("attachment_field", attachment_field);
  formData.append("label", label);

  files.forEach((file) => {
    formData.append("files", file);
  });

  console.log("Multiple Attachments Payload:", {
    record_id,
    attachment_field,
    label,
    files,
  });

  return api.post("/calibration/attachments", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};