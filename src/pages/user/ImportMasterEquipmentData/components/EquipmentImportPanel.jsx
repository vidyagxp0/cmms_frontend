
import { useState, useRef, useEffect } from "react";

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
import { toast } from "sonner";
import api from "../../../../services/api";

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
    // const [api, contextHolder] = notification.useNotification();

    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [importing, setImporting] = useState(false);
    const [serverResult, setServerResult] = useState(null);

    const [importProgress, setImportProgress] = useState(null);
    const [importErrors, setImportErrors] = useState([]);
    const pollingRef = useRef(false);
    const timerRef = useRef(null);

    // Reset selected file and related state.
    const reset = () => {
        if (importing) return;

        setFile(null);
        setError("");
        setConfirmOpen(false);
        setServerResult(null);
    };

    useEffect(() => {
    return () => {
        pollingRef.current = false;
        clearTimeout(timerRef.current);
    };
}, []);

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

        toast.success({
            message: "Excel file selected",
            description: `${actualFile.name} is ready to upload.`,
            placement: "topRight",
        });

        // Stop Ant Design's automatic upload.
        // The file is uploaded after the user confirms.
        return false;
    };

    // Upload the original Excel file to Laravel.
   


const checkImportStatus = async (importId) => {
    if (!pollingRef.current) return;

    try {
        const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

        if (!baseUrl) {
            throw new Error("VITE_API_URL is not configured.");
        }

        const statusUrl = `${baseUrl}/${importId}`;

        const response = await fetch(statusUrl, {
            method: "GET",
            credentials: "include",
            headers: {
                Accept: "application/json",
            },
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Failed to fetch import status."
            );
        }

        const data = result.data;

        setImportProgress(data);

        if (Array.isArray(data.errors)) {
            setImportErrors(data.errors);
        }

        if (["completed", "failed"].includes(data.status)) {
            pollingRef.current = false;
            setImporting(false);

            if (data.status === "completed") {
                toast.success({
                    message: "Import completed",
                    description: `Successful: ${data.success_rows || 0}, Failed: ${data.failed_rows || 0}`,
                });
            } else {
                toast.error({
                    message: "Import failed",
                    description:
                        result.message || "Please check the import errors.",
                });
            }

            return;
        }

        timerRef.current = setTimeout(() => {
            checkImportStatus(importId);
        }, 2000);
    } catch (error) {
        pollingRef.current = false;
        setImporting(false);
        setError(error.message || "Unable to check import status.");
    }
};


const importRecords = async () => {
    if (!file) {
        apiNotification.error({
            message: "Please select an Excel file.",
        });
        return;
    }

    try {
        setImporting(true);
        setError("");
        setImportProgress(null);
        setImportErrors([]);
        setServerResult(null);

        const formData = new FormData();

        formData.append("euipmentMasterType", masterKey);
        formData.append("file", file, file.name);

        // Use the reusable Axios instance
        const response = await api.post(
            "user/instrment-excel-import",
            formData,
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "multipart/form-data",
                },
                timeout: 0,
            }
        );

        const result = response.data;

        setServerResult(result);

        const importId = result.data?.import_id;

        if (!importId) {
            setImporting(false);

            apiNotification.success({
                message: result.message || "Import request submitted.",
            });

            return;
        }

        setConfirmOpen(false);
        setImportProgress(result.data);
        pollingRef.current = true;

        apiNotification.success({
            message: "Excel uploaded successfully",
            description: `Import ID: ${importId}`,
        });

        await checkImportStatus(importId);
    } catch (error) {
        pollingRef.current = false;
        setImporting(false);

        const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to upload Excel file.";

        setError(message);

        apiNotification.error({
            message: "Excel import failed",
            description: message,
        });
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
            {/* {contextHolder} */}

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

                        {importProgress && (
    <div className="mt-4 rounded-lg border border-gray-200 p-4">
        <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold text-gray-800">
                Import Progress
            </h4>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-700">
                {importProgress.status}
            </span>
        </div>

        <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span>
                Processed: {importProgress.processed_rows || 0} / {importProgress.total_rows || 0}
            </span>

            <span>
                {importProgress.total_rows > 0
                    ? Math.round(
                        (importProgress.processed_rows / importProgress.total_rows) * 100
                    )
                    : 0}%
            </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-gray-200">
            <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{
                    width: `${
                        importProgress.total_rows > 0
                            ? Math.min(
                                100,
                                (importProgress.processed_rows / importProgress.total_rows) * 100
                            )
                            : 0
                    }%`
                }}
            />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Total</p>
                <p className="font-bold">
                    {importProgress.total_rows || 0}
                </p>
            </div>

            <div className="rounded-lg bg-green-50 p-3">
                <p className="text-xs text-green-700">Success</p>
                <p className="font-bold text-green-700">
                    {importProgress.success_rows || 0}
                </p>
            </div>

            <div className="rounded-lg bg-red-50 p-3">
                <p className="text-xs text-red-700">Failed</p>
                <p className="font-bold text-red-700">
                    {importProgress.failed_rows || 0}
                </p>
            </div>
        </div>

        {importProgress.status === "completed" && (
            <Alert
                className="mt-4"
                type="success"
                showIcon
                message="Excel import completed successfully."
            />
        )}

        {importProgress.status === "failed" && (
            <Alert
                className="mt-4"
                type="error"
                showIcon
                message="Excel import failed."
            />
        )}

        {importErrors.length > 0 && (
            <div className="mt-4">
                <h5 className="mb-2 font-medium text-red-700">
                    Import Errors
                </h5>

                <pre className="max-h-60 overflow-auto rounded-lg bg-gray-50 p-3 text-xs">
                    {JSON.stringify(importErrors, null, 2)}
                </pre>
            </div>
        )}
    </div>
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

                {/* <p className="mt-3 text-xs leading-5 text-gray-500">
                    The file is uploaded as multipart/form-data.
                    Laravel is responsible for reading, validating,
                    processing, and saving the equipment records.
                </p> */}
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
