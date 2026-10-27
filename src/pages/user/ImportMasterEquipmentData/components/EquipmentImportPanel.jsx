
import { useState } from "react";

import {
    Alert,
    Button,
    Modal,
    Tooltip,
    Upload,
    notification,
    Spin,
} from "antd";

import {
    CloudUploadOutlined,
    DeleteOutlined,
    FileExcelOutlined,
    ReloadOutlined,
    UploadOutlined,
    CheckCircleFilled,
    InfoCircleOutlined,
} from "@ant-design/icons";

import { formatBytes } from "../utils/excelImportUtils";

const { Dragger } = Upload;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export default function EquipmentImportPanel({
    masterKey,
    masterLabel,
    requiredHeaders = [],
    requiredFields = [],
    instructions = [],
    apiEndpoint,
}) {
    const [api, contextHolder] = notification.useNotification();

    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [importing, setImporting] = useState(false);
    const [serverResult, setServerResult] = useState(null);

    // Reset selected file and related state.
    const reset = () => {
        if (importing) return;

        setFile(null);
        setError("");
        setConfirmOpen(false);
        setServerResult(null);
    };

    // Select the file without reading its contents in React.
    const beforeUpload = (uploadFile) => {
        const actualFile = uploadFile?.originFileObj || uploadFile;

        setError("");
        setServerResult(null);

        if (!actualFile) {
            setError("Please select an Excel file.");
            return false;
        }

        const validExtension = /\.(xlsx|xls)$/i.test(
            actualFile.name || ""
        );

        if (!validExtension) {
            setFile(null);
            setError(
                "Please select a valid Excel file with .xlsx or .xls extension."
            );
            return false;
        }

        if (actualFile.size > MAX_FILE_SIZE) {
            setFile(null);
            setError(
                "The maximum allowed file size is 50 MB."
            );
            return false;
        }

        if (actualFile.size === 0) {
            setFile(null);
            setError("The selected file is empty.");
            return false;
        }

        setFile(actualFile);

        api.success({
            message: "Excel file selected",
            description: `${actualFile.name} is ready to upload.`,
            placement: "topRight",
        });

        // Stop Ant Design's automatic upload.
        // The file is uploaded after the user confirms.
        return false;
    };

    // Upload the original Excel file to Laravel.
   

const importRecords = async () => {
  if (!file) {
    notification.error({ message: "Please select an Excel file." });
    return;
  }

//   if (!apiEndpoint) {
//     notification.error({ message: "Import API endpoint is not configured." });
//     return;
//   }

  try {
    setImporting(true);

    const formData = new FormData();

    // Selected equipment master
    formData.append("Select Equipment Master", masterKey);

    // Complete original Excel file
    formData.append("file", file, file.name);

    // Log selected master
    console.log("Selected Equipment Master:", masterKey);

    // Log uploaded file details
    console.log("Uploaded File Object:", file);
    console.log("File Name:", file.name);
    console.log("File Size:", file.size, "bytes");
    console.log("File Type:", file.type);
    console.log("Last Modified:", new Date(file.lastModified));

    // Log complete FormData payload
    console.log("Payload being sent:");

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}:`, {
          name: value.name,
          size: value.size,
          type: value.type,
          lastModified: value.lastModified,
          fileObject: value,
        });
      } else {
        console.log(`${key}:`, value);
      }
    }

    console.log("API Endpoint:", apiEndpoint);

    const response = await fetch(apiEndpoint, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });

    const result = await response.json();

    console.log("API Response Status:", response.status);
    console.log("API Response:", result);

    if (!response.ok) {
      throw new Error(result.message || "Failed to import Excel file.");
    }

    setServerResult(result);

    notification.success({
      message: result.message || "File submitted successfully.",
    });
  } catch (error) {
    console.error("Equipment Import Error:", error);

    notification.error({
      message: error.message || "Failed to upload file.",
    });
  } finally {
    setImporting(false);
  }
};


    const uploadProps = {
        accept: ".xlsx,.xls",
        multiple: false,
        maxCount: 1,
        showUploadList: false,
        beforeUpload,
        disabled: importing,
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2">
            {contextHolder}

            {/* Import instructions */}
            <section className="border-b border-gray-200 px-4 py-5 lg:border-b-0 lg:border-r">
                <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-800">
                        Import Instructions
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                        Before uploading {masterLabel} data, check
                        these points.
                    </p>
                </div>

                <div className="space-y-3">
                    {instructions.map((item, index) => (
                        <div
                            key={`${index}-${item}`}
                            className="flex items-start gap-3"
                        >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                                {index + 1}
                            </span>

                            <p className="pt-1 text-sm leading-5 text-gray-600">
                                {item}
                            </p>
                        </div>
                    ))}
                </div>

                <Alert
                    className="mt-5"
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined />}
                    message="Required Excel columns"
                    description={
                        requiredHeaders.length
                            ? requiredHeaders.join(", ")
                            : "The backend will validate the Excel columns."
                    }
                />
{/* 
                {requiredFields.length > 0 && (
                    <Alert
                        className="mt-3"
                        type="warning"
                        showIcon
                        message="Required values"
                        description={`Cannot be empty: ${requiredFields.join(", ")}. These must be validated by Laravel during processing.`}
                    />
                )} */}

                {/* <Alert
                    className="mt-3"
                    type="info"
                    showIcon
                    message="Server-side processing"
                    description="The Excel file is sent directly to Laravel. The frontend does not parse or store the spreadsheet rows in React state."
                /> */}
            </section>

            {/* Upload area */}
            <section className="px-4 py-5">
                <h3 className="text-sm font-semibold text-gray-800">
                    Upload Excel File
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                    Selected master: {masterLabel}
                </p>

                {!file ? (
                    <Dragger
                        {...uploadProps}
                        className="equipment-import-dragger mt-4"
                    >
                        <div className="px-2 py-7">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                                <CloudUploadOutlined className="text-2xl text-blue-600" />
                            </div>

                            <p className="mt-4 text-sm font-semibold text-gray-800">
                                Click or drag your Excel file here
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Supports .xlsx and .xls files
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Maximum file size: 50 MB
                            </p>

                            <div className="mt-4">
                                <span className="rounded-md bg-blue-600 px-4 py-2 text-xs font-medium text-white">
                                    Browse Excel File
                                </span>
                            </div>
                        </div>
                    </Dragger>
                ) : (
                    <div className="mt-4 rounded-lg border border-gray-200 p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-50">
                                <FileExcelOutlined className="text-xl text-green-600" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="break-all text-sm font-semibold text-gray-800">
                                    {file.name}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    {formatBytes(file.size)}
                                </p>

                                <p className="mt-1 text-xs text-green-700">
                                    File selected and ready for upload
                                </p>
                            </div>

                            <Tooltip title="Remove file">
                                <Button
                                    icon={<DeleteOutlined />}
                                    danger
                                    type="text"
                                    disabled={importing}
                                    onClick={reset}
                                />
                            </Tooltip>
                        </div>

                        {importing && (
                            <div className="mt-4 flex items-center gap-3 rounded-lg bg-blue-50 p-3">
                                <Spin size="small" />

                                <div>
                                    <p className="text-sm font-medium text-blue-800">
                                        Uploading Excel file
                                    </p>

                                    <p className="mt-1 text-xs text-blue-600">
                                        Please keep this page open while the request is being submitted.
                                    </p>
                                </div>
                            </div>
                        )}

                        {serverResult && (
                            <Alert
                                className="mt-4"
                                type="success"
                                showIcon
                                icon={<CheckCircleFilled />}
                                message="Server response received"
                                description={
                                    serverResult.message ||
                                    "The server accepted the file."
                                }
                            />
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                                type="primary"
                                icon={<UploadOutlined />}
                                disabled={importing}
                                onClick={() => setConfirmOpen(true)}
                            >
                                Upload and Import
                            </Button>

                            <Button
                                icon={<ReloadOutlined />}
                                disabled={importing}
                                onClick={reset}
                            >
                                Reset
                            </Button>
                        </div>
                    </div>
                )}

                {error && (
                    <Alert
                        className="mt-3"
                        type="error"
                        showIcon
                        message="File upload error"
                        description={error}
                    />
                )}

                <p className="mt-3 text-xs leading-5 text-gray-500">
                    The file is uploaded as multipart/form-data.
                    Laravel is responsible for reading, validating,
                    processing, and saving the equipment records.
                </p>
            </section>

            {/* Confirmation modal */}
            <Modal
                title={`Confirm ${masterLabel} import`}
                open={confirmOpen}
                onCancel={() => {
                    if (!importing) setConfirmOpen(false);
                }}
                onOk={importRecords}
                okText="Confirm and Upload"
                cancelText="Cancel"
                confirmLoading={importing}
                okButtonProps={{ disabled: !file || importing }}
                cancelButtonProps={{ disabled: importing }}
                destroyOnClose
            >
                <p>
                    Upload <strong>{file?.name}</strong> for{" "}
                    <strong>{masterLabel}</strong>?
                </p>

                <p className="mt-2 text-sm text-gray-500">
                    File size: {file ? formatBytes(file.size) : "—"}
                </p>

                {/* <Alert
                    className="mt-4"
                    type="info"
                    showIcon
                    message="Backend processing"
                    description="The original Excel file will be sent to Laravel. The backend must validate the file and process the records."
                /> */}
            </Modal>
        </div>
    );
}
