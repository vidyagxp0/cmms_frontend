import api from "../../../services/api";



const buildAttachmentFormData = ({
  attachment_field,
  label,
  Type,
  fileList,
}) => {
  const formData = new FormData();

  formData.append("attachment_field", attachment_field || "");
  formData.append("label", label || "");
  formData.append(
    "Type",
    Type || (fileList.length > 1 ? "multiple-file" : "single-file")
  );

  // Key point: same "file" key repeated for each file
  fileList.forEach((f) => {
    formData.append("file", f);
  });

  return formData;
};



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
    file || (Array.isArray(files) && files.length > 0 ? files[0] : null);

  if (!targetFile) {
    throw new Error("File is required for attachment upload.");
  }

  const formData = buildAttachmentFormData({
    attachment_field,
    label,
    Type: Type || "single-file",
    fileList: [targetFile],
  });

  return api.post(`/user/upload-attachment/${record_id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};



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
    Array.isArray(files) && files.length > 0 ? files : file ? [file] : [];

  if (!fileListToUpload.length) {
    throw new Error("At least one file is required.");
  }

  const isMultiple = fileListToUpload.length > 1;
  const attachmentType = Type
    ? Type === "multiple-file" && !isMultiple
      ? "single-file"
      : Type
    : isMultiple
    ? "multiple-file"
    : "single-file";

  const formData = buildAttachmentFormData({
    attachment_field,
    label,
    Type: attachmentType,
    fileList: fileListToUpload,
  });

  return api.post(`/user/upload-attachment/${record_id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};