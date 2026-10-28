import { useState, useRef, useEffect } from "react";

import { Alert, Button, Modal, Tooltip, Upload, Spin } from "antd";

import {
  CloudUploadOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  ReloadOutlined,
  UploadOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  InfoCircleOutlined,
  UnorderedListOutlined,
  TableOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import { formatBytes } from "../utils/excelImportUtils";
import { toast } from "sonner";
import api from "../../../../services/api";
import { useNavigate } from "react-router-dom";

const { Dragger } = Upload;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const STATUS_STYLES = {
  completed: {
    badge: "bg-green-50 text-green-700 ring-green-200",
    bar: "bg-green-600",
  },
  failed: {
    badge: "bg-red-50 text-red-700 ring-red-200",
    bar: "bg-red-600",
  },
  default: {
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
    bar: "bg-blue-600",
  },
};

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

export default function EquipmentImportPanel({
  masterKey,
  masterLabel,
  requiredHeaders = [],
  requiredFields = [],
  instructions = [],
  apiEndpoint,
}) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [serverResult, setServerResult] = useState(null);

  const [importProgress, setImportProgress] = useState(null);
  const [importErrors, setImportErrors] = useState([]);
  const pollingRef = useRef(false);
  const timerRef = useRef(null);

  const navigate = useNavigate();

const dashboardRoutes = {
  master_instrument: "/user/equipment-dashboard",
  field_instrument_master: "/user/field-instruments-dashboard",
  spare_instrument_master:
    "/user/spare-instrument-calibration-master-dashboard",
};

const navigateToDashboard = () => {
  const dashboardRoute = dashboardRoutes[masterKey];

  if (dashboardRoute) {
    navigate(dashboardRoute, { replace: true });
  }
};

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

    const validExtension = /\.(xlsx|xls)$/i.test(actualFile.name || "");

    if (!validExtension) {
      setFile(null);
      setError(
        "Please select a valid Excel file with .xlsx or .xls extension.",
      );
      return false;
    }

    if (actualFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("The maximum allowed file size is 50 MB.");
      return false;
    }

    if (actualFile.size === 0) {
      setFile(null);
      setError("The selected file is empty.");
      return false;
    }

    setFile(actualFile);

    toast.success(
      `Excel file selected: ${actualFile.name} is ready to upload.`,
    );

    // Stop Ant Design's automatic upload.
    // The file is uploaded after the user confirms.
    return false;
  };

  const checkImportStatus = async (importId) => {
    if (!pollingRef.current) return;

    try {
      const response = await api.get(`/user/import-excel/${importId}`, {
        headers: {
          Accept: "application/json",
        },
      });

      const result = response.data;
      const data = result?.data;

      if (!data) {
        throw new Error("Invalid import status response.");
      }

      setImportProgress(data);
      setImportErrors(Array.isArray(data.errors) ? data.errors : []);


      if (["completed", "failed"].includes(data.status)) {
  pollingRef.current = false;
  clearTimeout(timerRef.current);
  setImporting(false);

  if (data.status === "completed") {
    toast.success("Excel import completed successfully.");

    // Navigate only after the import is completed successfully.
    navigateToDashboard();
  } else {
    toast.error("Excel import failed. Check the import errors.");
  }

  return;
}

      timerRef.current = setTimeout(() => {
        checkImportStatus(importId);
      }, 2000);
    } catch (error) {
      pollingRef.current = false;
      clearTimeout(timerRef.current);
      setImporting(false);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to check import status.";

      setError(message);
      toast.error(message);
    }
  };

  const importRecords = async () => {
    if (!file) {
      toast.error("Please select an Excel file.");
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

      console.log("Import file:", file.name, file.size, file.type);

      const response = await api.post(
        "/user/instrment-excel-import",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 0,
        },
      );

      const result = response.data;

      setServerResult(result);

      const importId = result?.data?.import_id;

if (!importId) {
  setImporting(false);
  setConfirmOpen(false);

  toast.success(
    result.message || "Import request submitted successfully.",
  );

  navigateToDashboard();

  return;
}

      setConfirmOpen(false);
      setImportProgress(result.data);
      pollingRef.current = true;

      toast.success(`Excel uploaded successfully. Import ID: ${importId}`);

      await checkImportStatus(importId);
    } catch (error) {
      pollingRef.current = false;
      clearTimeout(timerRef.current);
      setImporting(false);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload Excel file.";

      setError(message);
      toast.error(message);
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

  // Derived display values (presentation only)
  const totalRows = importProgress?.total_rows || 0;
  const processedRows = importProgress?.processed_rows || 0;
  const percent =
    totalRows > 0 ? Math.min(100, Math.round((processedRows / totalRows) * 100)) : 0;
  const statusStyle =
    STATUS_STYLES[importProgress?.status] || STATUS_STYLES.default;

  return (
    <div className="grid grid-cols-1 gap-5 bg-gray-50/60 p-4 lg:grid-cols-5">
      {/* Import instructions */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
        <SectionHeader
          icon={<UnorderedListOutlined />}
          title="Import Instructions"
          subtitle={`Check these points before uploading ${masterLabel} data.`}
        />

        <ol className="space-y-3">
          {instructions.map((item, index) => (
            <li key={`${index}-${item}`} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <p className="pt-0.5 text-sm leading-5 text-gray-600">{item}</p>
            </li>
          ))}
        </ol>

      </section>

      {/* Upload area */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-3">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <SectionHeader
            icon={<TableOutlined />}
            title="Upload Excel File"
            subtitle="Select your file, then confirm to start the import."
          />

          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            Master: {masterLabel}
          </span>
        </div>

        {!file ? (
          <Dragger {...uploadProps} className="equipment-import-dragger">
            <div className="px-2 py-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <CloudUploadOutlined className="text-3xl text-blue-600" />
              </div>

              <p className="mt-4 text-sm font-semibold text-gray-900">
                Click or drag your Excel file here
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Supports .xlsx and .xls · Maximum size 50 MB
              </p>

              <div className="mt-5">
                <span className="inline-block rounded-md bg-blue-600 px-5 py-2 text-xs font-medium text-white shadow-sm">
                  Browse Excel File
                </span>
              </div>
            </div>
          </Dragger>
        ) : (
          <div className="space-y-4">
            {/* Selected file card */}
            <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50/50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                <FileExcelOutlined className="text-2xl text-green-600" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="break-all text-sm font-semibold text-gray-900">
                  {file.name}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="text-gray-500">{formatBytes(file.size)}</span>
                  <span className="inline-flex items-center gap-1 font-medium text-green-700">
                    <CheckCircleFilled /> Ready for upload
                  </span>
                </div>
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

            {importing && !importProgress && (
              <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
                <Spin size="small" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Uploading Excel file
                  </p>
                  <p className="mt-0.5 text-xs text-blue-600">
                    Please keep this page open while the request is being
                    submitted.
                  </p>
                </div>
              </div>
            )}

            {serverResult && (
              <Alert
                type="success"
                showIcon
                icon={<CheckCircleFilled />}
                message="Server response received"
                description={
                  serverResult.message || "The server accepted the file."
                }
              />
            )}

            {importProgress && (
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Import Progress
                  </h4>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ring-1 ring-inset ${statusStyle.badge}`}
                  >
                    {importProgress.status}
                  </span>
                </div>

                <div className="mb-2 flex justify-between text-xs text-gray-600">
                  <span>
                    Processed {processedRows} of {totalRows} rows
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${statusStyle.bar}`}
                    style={{ width: `${percent}%` }}
                  />
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
                    icon={<CloseCircleFilled />}
                    message="Excel import failed."
                  />
                )}

                {/* {importErrors.length > 0 && (
                  <div className="mt-4">
                    <h5 className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700">
                      <WarningOutlined />
                      Import Errors ({importErrors.length})
                    </h5>

                    <pre className="max-h-60 overflow-auto rounded-lg border border-red-100 bg-red-50/40 p-3 text-xs text-gray-700">
                      {JSON.stringify(importErrors, null, 2)}
                    </pre>
                  </div>
                )} */}
              </div>
            )}

            <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
              <Button
                type="primary"
                icon={<UploadOutlined />}
                disabled={importing}
                loading={importing}
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
            className="mt-4"
            type="error"
            showIcon
            message="File upload error"
            description={error}
          />
        )}
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
        <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
          <FileExcelOutlined className="mt-0.5 text-2xl text-green-600" />
          <div className="min-w-0">
            <p className="break-all text-sm font-semibold text-gray-900">
              {file?.name}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {file ? formatBytes(file.size) : "—"} · {masterLabel}
            </p>
          </div>
        </div>

        <p className="mt-3 text-sm text-gray-600">
          Do you want to upload this file for <strong>{masterLabel}</strong>?
        </p>
      </Modal>
    </div>
  );
}