import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Activity,
  Wrench,
  Hash,
  Factory,
  Cpu,
  Layers3,
  MapPin,
  Ruler,
  Target,
  Gauge,
  SlidersHorizontal,
  ClipboardList,
} from "lucide-react";
import { Form } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import SectionHeader from "../../../components/common/SectionHeader/SectionHeader";
import FormInput from "../../../components/common/Form/FormInput";
import FormTextArea from "../../../components/common/Form/FormTextArea";
import FormAttachment from "../../../components/common/Attachment/FormAttachment";
import FloatingActionButtons from "../../../components/ui/FloatingActionButtons";
import Skeleton from "../../../components/common/Skeleton/Skeleton";
import ChecklistConfiguration from "./ChecklistConfig";
import ProcessTabs from "../../../components/common/ProcesStageTabs/ProcessTabs";
import ProcessStage from "../../../components/common/ProcesStageTabs/ProcessStage";
import ProcessActivities from "../../../components/common/ProcesStageTabs/ProcessActivities";
import "../../../components/common/ProcesStageTabs/Scrollerbar.css";

import {
  executeCalibrationActivity,
  getAllPermissions,
  getEquipmentDetail,
  updateEquipment,
} from "../../../services/usersApi/equipmentApi";
import { addMultipleAttachments } from "../../../components/common/Attachment/attachmentApi";
import { getProfile } from "../../../services/authApi";
import {
  getAllActivites,
  getAllActivityLogs,
  getAllStages,
} from "../../../services/usersApi/workflowCommonApi";

/* ───────────────────────── Tabs config ───────────────────────── */

const TABS = [
  { id: "instrument", label: "Instrument Information", stageId: 23 },
  { id: "checklist", label: "Checklist Configuration" },
  { id: "hod", label: "HOD / Designee Review (Engineering Dept)", stageId: 24 },
  { id: "qa-review", label: "QA Approval Review", stageId: 25 },
  { id: "activity", label: "Activity Log", stageId: 26 },
  { id: "cancellation", label: "Cancellation", stageId: 27 },
];

const MASTER_INSTRUMENT_PROCESS_ID = 3;

const EMPTY_CHECKLIST = {
  checklist_name: "",
  include_serial_number: true,
  question_columns: [],
  data_columns: [],
  questions: [],
  note: {
    heading: "Note:",
    include_serial_number: true,
    items: [],
  },
};

const SELECTION_TYPES = [
  "single_select",
  "multi_select",
  "single_select_checkbox",
  "multi_select_checkbox",
];

/* ───────────────────────── Helpers ───────────────────────── */

const normalizeIncomingChecklist = (raw) => {
  if (!raw) return { ...EMPTY_CHECKLIST };

  if (
    typeof raw === "object" &&
    !Array.isArray(raw) &&
    (raw.question_columns || raw.data_columns || raw.questions)
  ) {
    return {
      checklist_name: raw.checklist_name || "",
      include_serial_number: raw.include_serial_number !== false,
      question_columns: Array.isArray(raw.question_columns)
        ? raw.question_columns.map((c, i) => ({
            id: c.id ?? `qc-${i}`,
            column_header: c.column_header || "",
          }))
        : [],
      data_columns: Array.isArray(raw.data_columns)
        ? raw.data_columns.map((c, i) => ({
            id: c.id ?? `dc-${i}`,
            column_header: c.column_header || "",
          }))
        : [],
      questions: Array.isArray(raw.questions)
        ? raw.questions.map((q, i) => ({
            id: q.id ?? `q-${i}`,
            values: q.values || {},
            data_cells:
              q.data_cells && typeof q.data_cells === "object"
                ? Object.fromEntries(
                    Object.entries(q.data_cells).map(([colId, cell], ci) => {
                      const base = {
                        field_type: cell?.field_type || "text",
                        required: cell?.required === true,
                        options: Array.isArray(cell?.options)
                          ? cell.options.map((o, oi) =>
                              typeof o === "string"
                                ? { id: `opt-${i}-${ci}-${oi}`, value: o }
                                : {
                                    id: o.id ?? `opt-${i}-${ci}-${oi}`,
                                    value: o.value || "",
                                  }
                            )
                          : [],
                      };

                      if (base.field_type === "checkbox") {
                        base.checkbox_variant =
                          cell?.checkbox_variant || "normal";
                        if (base.checkbox_variant === "esign") {
                          base.esign_type = cell?.esign_type || "simple";
                        }
                      }

                      return [colId, base];
                    })
                  )
                : {},
            frequency_enabled: q.frequency_enabled !== false,
            frequency: q.frequency || "",
          }))
        : [],

      note: (() => {
        const rawNotes = raw?.notes ?? raw?.note ?? null;
        const heading =
          typeof rawNotes?.heading === "string" && rawNotes.heading.trim()
            ? rawNotes.heading
            : "Note:";
        const items = Array.isArray(rawNotes?.items)
          ? rawNotes.items.map((it, i) =>
              typeof it === "string"
                ? { id: `note-${i}`, value: it }
                : { id: it.id ?? `note-${i}`, value: it.value || "" }
            )
          : [];

        return {
          heading,
          include_serial_number: rawNotes?.include_serial_number !== false,
          items,
        };
      })(),
    };
  }

  if (Array.isArray(raw)) {
    const questionColumns = [{ id: "qc-1", column_header: "Question" }];

    const questions = [];
    raw.forEach((cat, catIdx) => {
      (cat.checkpoints || []).forEach((cp, cpIdx) => {
        const text = typeof cp === "string" ? cp : cp?.text || "";
        if (!text.trim()) return;
        questions.push({
          id: `q-${catIdx}-${cpIdx}`,
          values: { "qc-1": text },
          data_cells: {},
        });
      });
    });

    return {
      checklist_name: "",
      include_serial_number: true,
      question_columns: questionColumns,
      data_columns: [],
      questions,
      note: {
        heading: "Note:",
        include_serial_number: true,
        items: [],
      },
    };
  }

  return { ...EMPTY_CHECKLIST };
};

/* ───────────────────────── Component ───────────────────────── */

const EquipmentPanel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("instrument");

  const [checklistConfig, setChecklistConfig] = useState(EMPTY_CHECKLIST);

  const [processId, setProcessId] = useState(MASTER_INSTRUMENT_PROCESS_ID);
  const [activeStageId, setActiveStageId] = useState(null);
  const [workflowStages, setWorkflowStages] = useState([]);
  const [workflowLoading, setWorkflowLoading] = useState(true);

  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLogsLoading, setActivityLogsLoading] = useState(false);

  const [canPerformActivity, setCanPerformActivity] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  const [loginUserId, setLoginUserId] = useState("");
  const [userRoles, setUserRoles] = useState([]);
  const [processName, setProcessName] = useState("Master Instrument");

  /* ── NEW: track is_imported from getEquipmentDetail ── */
  const [isImported, setIsImported] = useState(false);
  const isImportedRef = useRef(false);
  /* ─────────────────────────────────────────────────── */

  const isFetchingRef = useRef(false);

  const isStageEditable = (stageId) =>
    Number(activeStageId) === Number(stageId) &&
    canPerformActivity === true &&
    permissionsLoading === false;

  const isInstrumentEditable = isStageEditable(23);
  const isHodEditable = isStageEditable(24);
  const isQaReviewEditable = isStageEditable(25);
  const isCancellationEditable = isStageEditable(27);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        const profile = response?.data?.data;
        if (!profile) return;
        setLoginUserId(profile?.id || "");
        setUserRoles(Array.isArray(profile?.roles) ? profile.roles : []);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const fetchDetail = useCallback(
    async (isInitial = false) => {
      if (!id) {
        toast.error("Instrument ID is missing.");
        navigate(-1);
        return;
      }
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      try {
        if (isInitial) setIsLoading(true);

        const response = await getEquipmentDetail(id);
        const data = response?.data?.data;

        if (!data) {
          toast.error("Instrument not found.");
          navigate(-1);
          return;
        }

        /* ── NEW: capture is_imported before any downstream effect runs ── */
        const imported =
          data.is_imported === 1 ||
          data.is_imported === true ||
          data.is_imported === "1";
        isImportedRef.current = imported;
        setIsImported(imported);
        /* ─────────────────────────────────────────────────────────────── */

        form.setFieldsValue({
          instrument_name: data.instrument_name || data.name || "",
          instrument_id_no: data.instrument_id_no || data.equipment_id || "",
          make: data.make || "",
          sr_no_model_no: data.sr_no_model_no || data.model || "",
          location: data.location || "",
          least_count: data.least_count || "",
          accuracy: data.accuracy || "",
          instrument_range: data.instrument_range || "",
          operating_range: data.operating_range || "",
          calibration_test_points: data.calibration_test_points || "",
          asset_code: data.asset_code || "",
          capacity: data.capacity || "",
          category: data.category || data.equipment_type || "",
          stage_id: data.stage_id?.id || data.stage_id || null,
          process_id: data.process_id || null,

          hodReviewComments: data.hod_review_comments || "",
          hodReviewAttachment: data.hod_review_attachment || [],
          qaReviewComments: data.qa_review_comments || "",
          qaReviewAttachment: data.qa_review_attachment || [],
          cancellationRemark: data.cancellation_remark || "",
          cancellationAttachment: data.cancellation_attachment || [],
        });

        setChecklistConfig(normalizeIncomingChecklist(data.checklist_config));

        if (data.process_id) setProcessId(data.process_id);
        setProcessName(data?.process?.name || "Master Instrument");

        const backendStageId =
          data?.stage_id?.id ?? data?.stage_id ?? null;
        setActiveStageId(backendStageId);
      } catch (error) {
        console.error("Failed to fetch instrument detail:", error);
        toast.error(
          error?.response?.data?.message || "Failed to load instrument details."
        );
        navigate(-1);
      } finally {
        if (isInitial) setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [id, form, navigate]
  );

  useEffect(() => {
    fetchDetail(true);
  }, [fetchDetail]);

  useEffect(() => {
    if (!processId) return;
    const fetchStages = async () => {
      try {
        setWorkflowLoading(true);
        const response = await getAllStages(processId);
        const stages = response?.data?.data || [];
        const activeStages = stages.filter(
          (stage) => stage?.is_active !== false
        );
        setWorkflowStages(activeStages);
      } catch (error) {
        console.error("Failed to fetch workflow stages:", error);
        toast.error(
          error?.response?.data?.message || "Failed to load workflow stages."
        );
        setWorkflowStages([]);
      } finally {
        setWorkflowLoading(false);
      }
    };
    fetchStages();
  }, [processId]);

  useEffect(() => {
    if (!activeStageId) {
      setActivities([]);
      setActivitiesLoading(false);
      return;
    }
    const fetchActivities = async () => {
      try {
        setActivitiesLoading(true);
        const response = await getAllActivites(activeStageId);
        const activityList = response?.data?.data || [];
        setActivities(
          activityList.filter((activity) => activity?.is_active !== false)
        );
      } catch (error) {
        console.error("Failed to fetch activities:", error);
        toast.error(
          error?.response?.data?.message || "Failed to load activities."
        );
        setActivities([]);
      } finally {
        setActivitiesLoading(false);
      }
    };
    fetchActivities();
  }, [activeStageId]);

  const fetchPermissions = useCallback(async () => {
    if (!id) {
      setCanPerformActivity(false);
      setPermissionsLoading(false);
      return;
    }
    try {
      setPermissionsLoading(true);
      const response = await getAllPermissions(id);
      const canPerform =
        response?.data?.data?.permission?.can_perform_action === true;
      setCanPerformActivity(canPerform);
    } catch (error) {
      console.error("Failed to fetch record permissions:", error);
      setCanPerformActivity(false);
      toast.error(
        error?.response?.data?.message ||
          "Failed to check activity permissions."
      );
    } finally {
      setPermissionsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const fetchActivityLogs = useCallback(async () => {
    /* ── NEW: wait for getEquipmentDetail to settle, then skip if imported ── */
    if (isLoading) return;
    if (isImportedRef.current) {
      setActivityLogs([]);
      setActivityLogsLoading(false);
      return;
    }
    /* ────────────────────────────────────────────────────────────────────── */

    if (!id) {
      setActivityLogs([]);
      return;
    }
    try {
      setActivityLogsLoading(true);
      const response = await getAllActivityLogs(id, processId);
      setActivityLogs(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch activity history:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load activity history."
      );
      setActivityLogs([]);
    } finally {
      setActivityLogsLoading(false);
    }
  }, [id, processId, isLoading]);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  useEffect(() => {
    if (!activeStageId) return;

    /* ── NEW: don't auto-select the Activity tab when the record is imported ── */
    if (isImportedRef.current && Number(activeStageId) === 26) return;
    /* ──────────────────────────────────────────────────────────────────────── */

    const matchingTab = TABS.find(
      (tab) => Number(tab.stageId) === Number(activeStageId)
    );
    if (matchingTab) setActiveTab(matchingTab.id);
  }, [activeStageId]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleSubmit = async (values) => {
    if (isSaving) return;

    const questionColumnIdMap = {};
    const dataColumnIdMap = {};

    const cleanedQuestionColumns = checklistConfig.question_columns
      .filter((column) => column?.column_header?.trim() !== "")
      .map((column, idx) => {
        const newId = idx + 1;
        questionColumnIdMap[column.id] = newId;
        return {
          id: newId,
          column_header: column.column_header.trim(),
        };
      });

    const cleanedDataColumns = checklistConfig.data_columns
      .filter((column) => column?.column_header?.trim() !== "")
      .map((column, idx) => {
        const newId = idx + 1;
        dataColumnIdMap[column.id] = newId;
        return {
          id: newId,
          column_header: column.column_header.trim(),
        };
      });

    let questionCounter = 0;

    const cleanedQuestions = checklistConfig.questions
      .map((row) => {
        const questionValues = {};
        let hasAny = false;

        checklistConfig.question_columns.forEach((col) => {
          const newColId = questionColumnIdMap[col.id];
          if (!newColId) return;

          const v = row.values?.[col.id]?.trim() || "";
          if (v) hasAny = true;

          questionValues[newColId] = v;
        });

        if (!hasAny) return null;

        const data_cells = {};
        checklistConfig.data_columns.forEach((col) => {
          const newColId = dataColumnIdMap[col.id];
          if (!newColId) return;

          const cell = row.data_cells?.[col.id] || {
            field_type: "text",
            options: [],
          };
          const isSelection = SELECTION_TYPES.includes(cell.field_type);

          const nextCell = {
            field_type: cell.field_type || "text",
            required: cell.required === true,
            options: isSelection
              ? (cell.options || [])
                  .filter((o) => o?.value?.trim())
                  .map((o, optIdx) => ({
                    id: optIdx + 1,
                    value: o.value.trim(),
                  }))
              : [],
          };

          if (cell.field_type === "checkbox") {
            nextCell.checkbox_variant = cell.checkbox_variant || "normal";
            if (nextCell.checkbox_variant === "esign") {
              nextCell.esign_type = cell.esign_type || "simple";
            }
          }

          data_cells[newColId] = nextCell;
        });

        questionCounter += 1;
        return {
          id: questionCounter,
          values: questionValues,
          data_cells,
          frequency_enabled: row.frequency_enabled !== false,
          frequency: row.frequency || "",
        };
      })
      .filter(Boolean);

    const cleanedChecklistConfig = {
      checklist_name: checklistConfig.checklist_name?.trim() || "",
      include_serial_number: checklistConfig.include_serial_number !== false,
      question_columns: cleanedQuestionColumns,
      data_columns: cleanedDataColumns,
      questions: cleanedQuestions,

      notes: {
        heading: checklistConfig.note?.heading?.trim() || "",
        include_serial_number:
          checklistConfig.note?.include_serial_number !== false,
        items: (checklistConfig.note?.items || [])
          .filter((it) => it?.value?.trim())
          .map((it, idx) => ({
            id: idx + 1,
            value: it.value.trim(),
          })),
      },
    };

    try {
      setIsSaving(true);

      const payload = {
        instrument_name: values.instrument_name?.trim() || "",
        instrument_id_no: values.instrument_id_no?.trim() || "",
        make: values.make?.trim() || "",
        sr_no_model_no: values.sr_no_model_no?.trim() || "",
        location: values.location?.trim() || "",
        least_count: values.least_count?.trim() || "",
        accuracy: values.accuracy?.trim() || "",
        instrument_range: values.instrument_range?.trim() || "",
        operating_range: values.operating_range?.trim() || "",
        calibration_test_points:
          values.calibration_test_points?.trim() || "",
        asset_code:
          values.asset_code?.trim() || "",
        capacity:
          values.capacity?.trim() || "",
        category: values.category?.trim() || "",
        checklist_config: cleanedChecklistConfig,

        hod_review_comments: values.hodReviewComments || "",
        qa_review_comments: values.qaReviewComments || "",
        cancellation_remark: values.cancellationRemark || "",
        cancellation_attachment: values.cancellationAttachment || [],
      };

      await updateEquipment(id, payload);

      toast.success("Instrument updated successfully.");

      await fetchDetail(false);
      await fetchPermissions();
      await fetchActivityLogs();
    } catch (error) {
      console.error("Failed to update instrument:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to update instrument. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivitySuccess = async () => {
    try {
      if (canPerformActivity) {
        const values = form.getFieldsValue(true);
        await handleSubmit(values);
      } else {
        await fetchDetail(false);
        await fetchPermissions();
        await fetchActivityLogs();
      }
    } catch (error) {
      console.error("Failed to save instrument after activity:", error);
    }
  };

  const handleCancel = () => {
    if (isSaving) return;
    navigate("/user/equipment-dashboard");
  };

  const isCancellationStageActive = Number(activeStageId) === 81;

  let visibleTabs = isCancellationStageActive
    ? TABS.filter((tab) => tab.id === "cancellation")
    : TABS.filter((tab) => tab.id !== "cancellation");

  /* ── NEW: hide Activity Log tab for imported records ── */
  if (isImported) {
    visibleTabs = visibleTabs.filter((tab) => tab.id !== "activity");
  }
  /* ───────────────────────────────────────────────────── */

  /* ───────── Loading state (matches Calibration panel) ───────── */
  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton variant="title" className="w-full" />
        <Skeleton variant="form" fields={6} />
      </div>
    );
  }

  /* ───────── Render ───────── */
  return (
    <div className="w-full">
      {/* ═══════════════ WORKFLOW: STAGES + ACTIVITIES ═══════════════ */}
      <div className="mb-2 space-y-2">
        <ProcessStage
          stages={workflowStages}
          activeStageId={activeStageId}
          loading={workflowLoading}
          cancelledStageId={27}
        />

        <div className="flex flex-col gap-2 rounded-xl border border-[#DCE8E2] bg-white p-2 shadow-[0_3px_14px_rgba(21,44,32,0.04)] lg:flex-row lg:items-center">
          <div className="flex min-w-0 shrink-0 items-center gap-4 rounded-lg bg-[#F7FAF8] px-3 py-2 lg:w-[40%]">
            <div className="h-7 w-px shrink-0 bg-[#DCE8E2]" />
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-[#8A9992]">
                Process
              </p>
              <p className="truncate text-[11px] font-semibold text-[#344A43]">
                {processName || "—"}
              </p>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <ProcessActivities
              activities={activities}
              loading={activitiesLoading}
              recordId={id}
              userId={loginUserId}
              activityApi={executeCalibrationActivity}
              onActivitySuccess={handleActivitySuccess}
              canPerformActivity={canPerformActivity}
              permissionsLoading={permissionsLoading}
              auditRoute={"/user/instrument-master-audit"}
              onExit={() => navigate("/user/equipment-dashboard")}
            />
          </div>
        </div>
      </div>

      {/* ═══════════════ TABS ═══════════════ */}
      <div className="mb-6">
        <ProcessTabs
          tabs={visibleTabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      {/* ═══════════════ FORM — plain sections, no cards (matches Calibration panel) ═══════════════ */}
      <Form
        form={form}
        preserve={true}
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
        className="w-full [&_.ant-form-item-label>label]:!text-[12px] [&_.ant-form-item-label>label]:!font-semibold [&_.ant-form-item-label]:!pb-1.5 [&_.ant-form-item-explain-error]:!text-[11px]"
      >
        {/* ─── TAB 1: INSTRUMENT INFORMATION ─── */}
        <section style={{ display: activeTab === "instrument" ? "block" : "none" }}>
          <SectionHeader title="INSTRUMENT INFORMATION" />
          <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
            <Form.Item
              name="instrument_name"
              label={
                <span className="flex items-center gap-1.5">
                  <Wrench size={12} strokeWidth={1.9} className="text-[#56766D]" />
                  Instrument Name
                </span>
              }
              rules={[
                { required: true, whitespace: true, message: "Please enter instrument name" },
              ]}
              className="!mb-4"
            >
              <FormInput placeholder="Enter instrument name" disabled={!isInstrumentEditable} />
            </Form.Item>

            <Form.Item
              name="instrument_id_no"
              label={
                <span className="flex items-center gap-1.5">
                  <Hash size={12} strokeWidth={1.9} className="text-[#56766D]" />
                  Instrument ID No.
                </span>
              }
              rules={[
                { required: true, whitespace: true, message: "Please enter instrument ID No." },
              ]}
              className="!mb-4"
            >
              <FormInput placeholder="Enter instrument ID No." disabled={!isInstrumentEditable} />
            </Form.Item>

            <Form.Item
              name="make"
              label={
                <span className="flex items-center gap-1.5">
                  <Factory size={12} strokeWidth={1.9} className="text-[#56766D]" />
                  Make
                </span>
              }
              rules={[
                { required: true, whitespace: true, message: "Please enter make" },
              ]}
              className="!mb-4"
            >
              <FormInput placeholder="Enter make" disabled={!isInstrumentEditable} />
            </Form.Item>

            <Form.Item
              name="sr_no_model_no"
              label={
                <span className="flex items-center gap-1.5">
                  <Cpu size={12} strokeWidth={1.9} className="text-[#56766D]" />
                  Sr. No. / Model No.
                </span>
              }
              rules={[
                { required: true, whitespace: true, message: "Please enter Sr. No. / Model No." },
              ]}
              className="!mb-4"
            >
              <FormInput placeholder="Enter Sr. No. / Model No." disabled={!isInstrumentEditable} />
            </Form.Item>

            <Form.Item
              name="location"
              label={
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} strokeWidth={1.9} className="text-[#56766D]" />
                  Location
                </span>
              }
              rules={[
                { required: true, whitespace: true, message: "Please enter location" },
              ]}
              className="!mb-4"
            >
              <FormInput placeholder="Enter location" disabled={!isInstrumentEditable} />
            </Form.Item>

            <Form.Item
              name="least_count"
              label={
                <span className="flex items-center gap-1.5">
                  <Ruler size={12} strokeWidth={1.9} className="text-[#56766D]" />
                  Least Count
                </span>
              }
              rules={[
                { required: true, whitespace: true, message: "Please enter least count" },
              ]}
              className="!mb-4"
            >
              <FormInput placeholder="Enter least count" disabled={!isInstrumentEditable} />
            </Form.Item>

            <Form.Item
              name="accuracy"
              label={
                <span className="flex items-center gap-1.5">
                  <Target size={12} strokeWidth={1.9} className="text-[#56766D]" />
                  Accuracy
                </span>
              }
              rules={[
                { required: true, whitespace: true, message: "Please enter accuracy" },
              ]}
              className="!mb-4"
            >
              <FormInput placeholder="Enter accuracy" disabled={!isInstrumentEditable} />
            </Form.Item>

            <Form.Item
              name="instrument_range"
              label={
                <span className="flex items-center gap-1.5">
                  <Gauge size={12} strokeWidth={1.9} className="text-[#56766D]" />
                  Instrument Range
                </span>
              }
              rules={[
                { required: true, whitespace: true, message: "Please enter instrument range" },
              ]}
              className="!mb-4"
            >
              <FormInput placeholder="Enter instrument range" disabled={!isInstrumentEditable} />
            </Form.Item>

            <Form.Item
              name="operating_range"
              label={
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal size={12} strokeWidth={1.9} className="text-[#56766D]" />
                  Operating Range
                </span>
              }
              rules={[
                { required: true, whitespace: true, message: "Please enter operating range" },
              ]}
              className="!mb-4"
            >
              <FormInput placeholder="Enter operating range" disabled={!isInstrumentEditable} />
            </Form.Item>

            <Form.Item
              name="calibration_test_points"
              label={
                <span className="flex items-center gap-1.5">
                  <ClipboardList size={12} strokeWidth={1.9} className="text-[#56766D]" />
                  Calibration Test Points
                </span>
              }
              rules={[
                { required: true, whitespace: true, message: "Please enter calibration test points" },
              ]}
              className="!mb-4"
            >
              <FormInput placeholder="Enter calibration test points" disabled={!isInstrumentEditable} />
            </Form.Item>

            <Form.Item
              name="asset_code"
              label={
                <span className="flex items-center gap-1.5">
                  <ClipboardList size={12} strokeWidth={1.9} className="text-[#56766D]" />
                  Asset Code
                </span>
              }
              rules={[
                { required: true, whitespace: true, message: "Please enter Asset Code" },
              ]}
              className="!mb-4"
            >
              <FormInput placeholder="Enter Asset Code" disabled={!isInstrumentEditable} />
            </Form.Item>

            <Form.Item
              name="capacity"
              label={
                <span className="flex items-center gap-1.5">
                  <ClipboardList size={12} strokeWidth={1.9} className="text-[#56766D]" />
                  Capacity
                </span>
              }
              rules={[
                { required: true, whitespace: true, message: "Please enter Capacity" },
              ]}
              className="!mb-4"
            >
              <FormInput placeholder="Enter Capacity" disabled={!isInstrumentEditable} />
            </Form.Item>

            <Form.Item
              name="category"
              label={
                <span className="flex items-center gap-1.5">
                  <Layers3 size={12} strokeWidth={1.9} className="text-[#56766D]" />
                  Category
                </span>
              }
              rules={[
                { required: true, whitespace: true, message: "Please enter category" },
              ]}
              className="!mb-0"
            >
              <FormInput placeholder="Enter category" disabled={!isInstrumentEditable} />
            </Form.Item>
          </div>
        </section>

        {/* ─── TAB 2: HOD REVIEW ─── */}
        <section style={{ display: activeTab === "hod" ? "block" : "none" }}>
          <SectionHeader title="HOD / DESIGNEE REVIEW (ENGINEERING DEPT)" />
          <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
            <Form.Item name="hodReviewComments" label="Comments" className="!mb-4 md:col-span-2">
              <FormTextArea
                rows={5}
                placeholder="Enter comments..."
                disabled={!isHodEditable}
              />
            </Form.Item>

            <Form.Item
              name="hodReviewAttachment"
              label="Attachment"
              valuePropName="value"
              className="!mb-4 md:col-span-2"
            >
              <FormAttachment
                multiple={true}
                recordId={id}
                attachmentField="hod_review_attachment"
                label="HOD / Designee Review Attachment"
                uploadApi={addMultipleAttachments}
                disabled={!isHodEditable}
              />
            </Form.Item>
          </div>
        </section>

        {/* ─── TAB 3: QA REVIEW ─── */}
        <section style={{ display: activeTab === "qa-review" ? "block" : "none" }}>
          <SectionHeader title="QA APPROVAL REVIEW" />
          <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
            <Form.Item name="qaReviewComments" label="Comments" className="!mb-4 md:col-span-2">
              <FormTextArea
                rows={5}
                placeholder="Enter comments..."
                disabled={!isQaReviewEditable}
              />
            </Form.Item>

            <Form.Item
              name="qaReviewAttachment"
              label="Attachment"
              valuePropName="value"
              className="!mb-4 md:col-span-2"
            >
              <FormAttachment
                multiple={true}
                recordId={id}
                attachmentField="qa_review_attachment"
                label="QA Review Attachment"
                uploadApi={addMultipleAttachments}
                disabled={!isQaReviewEditable}
              />
            </Form.Item>
          </div>
        </section>

        {/* ─── TAB 4: CHECKLIST CONFIGURATION ─── */}
        <section style={{ display: activeTab === "checklist" ? "block" : "none" }}>
          <SectionHeader title="CHECKLIST CONFIGURATION" />
          <div className="mt-5">
            <ChecklistConfiguration
              value={checklistConfig}
              onChange={setChecklistConfig}
              description="Define categorical inspection checkpoints for the field engineers."
            />
          </div>
        </section>

        {/* ─── TAB 5: ACTIVITY LOG ─── */}
        <section style={{ display: activeTab === "activity" ? "block" : "none" }}>
          <SectionHeader title="ACTIVITY LOG" />
          <div className="mt-5 space-y-4">
            {activityLogsLoading ? (
              <Skeleton variant="activityLog" />
            ) : activityLogs.length === 0 ? (
              <div className="rounded-lg border border-[#DCE3EA] bg-white p-5 text-center text-sm text-slate-500">
                No activity history found.
              </div>
            ) : (
              activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-[#DCE3EA] bg-white p-5 shadow-[0_2px_6px_rgba(0,0,0,0.04)]"
                >
                  <div className="mb-5">
                    <p className="text-[13px] font-semibold text-[#3E4A5C]">
                      Activity Name
                    </p>
                    <p className="mt-1 text-[14px] font-semibold text-[#182234]">
                      {log.activity_name || "—"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <p className="mb-1 text-[13px] font-semibold text-[#3E4A5C]">
                        Performed By
                      </p>
                      <div className="flex min-h-11 items-center rounded-md border border-[#DCE3EA] bg-[#F3F4F6] px-3">
                        <span className="text-[14px] text-[#526071]">
                          {log.performed_by || "—"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="mb-1 text-[13px] font-semibold text-[#3E4A5C]">
                        Date Performed
                      </p>
                      <div className="flex min-h-11 items-center rounded-md border border-[#DCE3EA] bg-[#F3F4F6] px-3">
                        <span className="text-[14px] text-[#526071]">
                          {log.performed_at || "—"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="mb-1 text-[13px] font-semibold text-[#3E4A5C]">
                        Comments
                      </p>
                      <div className="h-11 overflow-y-auto rounded-md border border-[#DCE3EA] bg-[#F3F4F6] px-3 py-2">
                        <p className="break-words text-[14px] leading-5 text-[#526071]">
                          {log.comment || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ─── TAB 6: CANCELLATION ─── */}
        <section style={{ display: activeTab === "cancellation" ? "block" : "none" }}>
          <SectionHeader title="CANCELLATION" />
          <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
            <Form.Item
              name="cancellationRemark"
              label="Remark"
              className="!mb-4 md:col-span-2"
            >
              <FormTextArea
                rows={5}
                placeholder="Enter cancellation remark..."
                disabled={!isCancellationEditable}
              />
            </Form.Item>

            <Form.Item
              name="cancellationAttachment"
              label="Attachment"
              valuePropName="value"
              className="!mb-4 md:col-span-2"
            >
              <FormAttachment
                multiple={true}
                recordId={id}
                attachmentField="cancellation_attachment"
                label="Cancellation Attachment"
                uploadApi={addMultipleAttachments}
                disabled={!isCancellationEditable}
              />
            </Form.Item>
          </div>
        </section>
      </Form>

      {/* ═══════════════ FLOATING ACTIONS ═══════════════ */}
      <FloatingActionButtons
        onSave={() => form.submit()}
        onCancel={handleCancel}
        isSaving={isSaving}
        saveLabel="Update"
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default EquipmentPanel;