import api from "../../../services/api";



// const buildAttachmentFormData = ({
//   attachment_field,
//   label,
//   Type,
//   fileList,
// }) => {
//   const formData = new FormData();

//   formData.append("attachment_field", attachment_field || "");
//   formData.append("label", label || "");
//   // formData.append(
//   //   "Type",
//   //   Type || (fileList.length > 1 ? "multiple-file" : "single-file")
//   // );

//   formData.append("Type", Type || "");

//   // Key point: same "file" key repeated for each file
//   fileList.forEach((f) => {
//     formData.append("file", f);
//   });

//   return formData;
// };

const buildAttachmentFormData = ({
  attachment_field,
  label,
  Type,
  fileList,
}) => {
  const formData = new FormData();

  formData.append("attachment_field", attachment_field || "");
  formData.append("label", label || "");
  formData.append("Type", Type || "");

  if (Type === "single-file") {
    formData.append("file", fileList[0]);
  }

  if (Type === "multiple-file") {
    fileList.forEach((file) => {
      formData.append("files[]", file);
    });
  }

  return formData;
};


export const addSingleAttachment = async ({
  record_id,
  attachment_field,
  label,
  file,
  files,
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


export const addMultipleAttachments = async ({
  record_id,
  attachment_field,
  label,
  file,
  files = [],
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

  const formData = buildAttachmentFormData({
    attachment_field,
    label,
    Type: "multiple-file",
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