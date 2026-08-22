import React, { useEffect, useState } from "react";
import {
    Building2,
    Pencil,
    Plus,
    Loader2,
    XCircle,
    Trash2,
    AlertTriangle,
    Search,
    X,
} from "lucide-react";
import {
    addDepartment,
    getDepartments,
    updateDepartment,
    deleteDepartment,
} from "../../../services/adminApis/departmentApi";
import AdminModal from "../../../components/common/AdminModal/AdminModal";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import SearchInput from "../../../components/ui/SearchInput";
import Skeleton from "../../../components/common/Skeleton/Skeleton";

const DepartmentManagemelist = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [departmentName, setDepartmentName] = useState("");
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getDepartments();
            setDepartments(response?.data?.data || []);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Failed to load departments."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const openAddModal = () => {
        setEditingDepartment(null);
        setDepartmentName("");
        setFormError("");
        setModalOpen(true);
    };

    const openEditModal = (department) => {
        setEditingDepartment(department);
        setDepartmentName(department.name);
        setFormError("");
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;

        setModalOpen(false);
        setDepartmentName("");
        setEditingDepartment(null);
        setFormError("");
    };

    const openDeleteModal = (department) => {
        setDepartmentToDelete(department);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        if (deleting) return;

        setDeleteModalOpen(false);
        setDepartmentToDelete(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const name = departmentName.trim();

        if (!name) {
            setFormError("Department name is required.");
            return;
        }

        try {
            setSaving(true);
            setFormError("");

            if (editingDepartment) {
                await updateDepartment(editingDepartment.id, { name });
                toast.success("Department updated successfully");
            } else {
                await addDepartment({ name });
                toast.success("Department added successfully");
            }

            closeModal();
            await fetchDepartments();
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                `Failed to ${
                    editingDepartment ? "update" : "create"
                } department.`;

            toast.error(message);
            setFormError(message);
        } finally {
            setSaving(false);
        }
    };

  const handleDelete = async () => {
    if (!departmentToDelete) return;

    try {
        setDeleting(true);

        await deleteDepartment(departmentToDelete.id);

        toast.success("Department deleted successfully", {
            description: `${departmentToDelete.name} has been removed.`,
        });
    } catch (err) {
        const message =
            err?.response?.data?.message ||
            "Failed to delete department.";
        toast.error(message);
    } finally {
        setDeleting(false);
    }

    const filteredDepartments = departments.filter((dept) =>
        dept.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full">
            {/* PAGE HEADER */}
            <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#CBDCD0] bg-gradient-to-tr from-[#EEFDF4] to-[#FFFFFF] shadow-[0_4px_12px_rgba(23,115,76,0.04)]">
                        <Building2
                            size={19}
                            strokeWidth={1.8}
                            className="text-[#17734C]"
                        />
                    </span>

                    <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-[#152C20]">
                        Department Management
                    </h1>
                </div>

                <button
                    type="button"
                    onClick={openAddModal}
                    className="flex h-[42px] items-center gap-2 rounded-[11px] bg-gradient-to-r from-[#17734C] to-[#1F9F68] px-4.5 text-[12px] font-semibold text-white shadow-[0_4px_14px_rgba(23,115,76,0.22)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_6px_20px_rgba(23,115,76,0.3)] active:scale-[0.98]"
                >
                    <Plus size={15} strokeWidth={2.2} />
                    Add New Department
                </button>
            </div>

            {/* SEARCH */}
            <div className="mb-4 flex items-center justify-between gap-4">
                <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search by department..."
                    suggestions={departments.map((d) => d.name).filter(Boolean)}
                />
            </div>

            {/* TABLE */}
            <div className="w-full overflow-hidden rounded-2xl border border-[#E3ECE6] bg-white shadow-[0_12px_40px_-12px_rgba(21,50,32,0.07)]">
                <div className="w-full max-h-[450px] overflow-auto custom-scrollbar rounded-2xl">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-[#FAFDFB]">
                                <th className="w-[100px] sticky top-0 bg-[#FAFDFB] z-10 border-b border-[#E8EFEA] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#476053]">
                                    S.No
                                </th>

                                <th className="sticky top-0 bg-[#FAFDFB] z-10 border-b border-[#E8EFEA] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#476053]">
                                    Department Name
                                </th>

                                <th className="w-[150px] sticky top-0 bg-[#FAFDFB] z-10 border-b border-[#E8EFEA] px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-[#476053]">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#E3F0E8]">
                     {loading && (
                    <tr>
                        <td colSpan="3" className="p-0">
                            <Skeleton
                            variant="table"
                            rows={6}
                            showHeader={false}
                            columnDefinitions={[
                            { type: "number", width: "15%", align: "center" },
                            { type: "text", width: "60%" },
                            { type: "actions", width: "25%", align: "right" },
                        ]}
                            />
                        </td>
                    </tr>
                )}

                            {/* ERROR */}
                            {!loading && error && (
                                <tr>
                                    <td
                                        colSpan="3"
                                        className="px-6 py-12 text-center text-[12px] font-medium text-[#C43D3D]"
                                    >
                                        {error}
                                    </td>
                                </tr>
                            )}

                            {/* EMPTY */}
                            {!loading &&
                                !error &&
                                filteredDepartments.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-16">
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <div className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEFDF5] border border-[#CBE5D8] text-[#17734C]">
                                                    <Building2 size={22} strokeWidth={1.8} />
                                                </div>
                                                <h3 className="text-[14px] font-semibold text-[#152C20]">
                                                    {departments.length === 0 ? "No departments found" : "No matching departments"}
                                                </h3>
                                                <p className="mt-1 text-[11.5px] text-[#6C8679] max-w-xs">
                                                    {departments.length === 0 
                                                        ? "Create a new department to start organizing your teams." 
                                                        : "Try adjusting your search terms to locate the department."}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                            {!loading &&
                                !error &&
                                filteredDepartments.map((department, index) => (
                                    <tr
                                        key={department.id}
                                        className="group transition-all duration-250 hover:bg-[#F6FAF8]/70"
                                    >
                                        <td className="px-6 py-4 text-[12.5px] font-medium text-[#5C7A6C]">
                                            {String(index + 1).padStart(2, "0")}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="text-[13px] font-semibold text-[#152C20]">
                                                {department.name}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* EDIT */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(
                                                            department
                                                        )
                                                    }
                                                    aria-label={`Edit ${department.name}`}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#475569] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200 hover:border-[#E8C875] hover:bg-[#FFFDF5] hover:text-[#B38D24]"
                                                >
                                                    <Pencil
                                                        size={14}
                                                        strokeWidth={1.9}
                                                    />
                                                </button>

                                                {/* DELETE */}
                                                {/* <button
                                                    type="button"
                                                    onClick={() =>
                                                        openDeleteModal(
                                                            department
                                                        )
                                                    }
                                                    aria-label={`Delete ${department.name}`}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#475569] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200 hover:border-[#FCA5A5] hover:bg-[#FEF2F2] hover:text-[#EF4444]"
                                                >
                                                    <Trash2
                                                        size={14}
                                                        strokeWidth={1.9}
                                                    />
                                                </button> */}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FOOTER */}
            {!loading && !error && (
                <p className="mt-3 px-1 text-[11.5px] text-[#8FA79B]">
                    Showing {filteredDepartments.length} of {departments.length} department
                    {departments.length !== 1 ? "s" : ""}
                </p>
            )}

            {/* ADD / EDIT MODAL */}
            <AdminModal
                open={modalOpen}
                onClose={closeModal}
                onSubmit={handleSubmit}
                title={
                    editingDepartment
                        ? "Edit Department"
                        : "Add New Department"
                }
                description={
                    editingDepartment
                        ? "Update the department information."
                        : "Create a new department."
                }
                icon={Building2}
                submitText={
                    editingDepartment
                        ? "Update Department"
                        : "Create Department"
                }
                loading={saving}
            >
                <div>
                    <label
                        htmlFor="departmentName"
                        className="mb-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-[#263F33]"
                    >
                        <Building2
                            size={13}
                            strokeWidth={1.9}
                            className="text-[#39785D]"
                        />
                        Department Name
                    </label>

                    <input
                        id="departmentName"
                        type="text"
                        value={departmentName}
                        onChange={(e) => {
                            setDepartmentName(e.target.value);
                            if (formError) setFormError("");
                        }}
                        placeholder="Enter department name"
                        autoFocus
                        disabled={saving}
                        className={`h-[46px] w-full rounded-[10px] border bg-[#F9FCFA] px-3.5 text-[12.5px] font-medium text-[#1C382A] outline-none transition-all duration-200 placeholder:text-[#94A79E] ${
                            formError
                                ? "border-[#C43D3D] focus:shadow-[0_0_0_3px_rgba(196,61,61,0.07)]"
                                : "border-[#CBE3D6] focus:border-[#79B89A] focus:bg-white focus:shadow-[0_0_0_3px_rgba(31,138,95,0.07)]"
                        }`}
                    />

                    {formError && (
                        <p className="mt-1.5 flex items-center gap-1 text-[10.5px] font-medium text-[#C43D3D]">
                            <XCircle size={12} />
                            {formError}
                        </p>
                    )}
                </div>
            </AdminModal>

            {/* DELETE CONFIRMATION MODAL */}
            <AdminModal
                open={deleteModalOpen}
                onClose={closeDeleteModal}
                onSubmit={(e) => {
                    e.preventDefault();
                    handleDelete();
                }}
                title="Delete Department"
                description="This action cannot be undone."
                icon={AlertTriangle}
                submitText="Delete Department"
                loading={deleting}
            >
                <div className="rounded-2xl border border-red-100 bg-[#FFF8F8] p-5 shadow-[0_2px_8px_rgba(239,68,68,0.02)]">
                    <div className="flex items-start gap-3.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#FCA5A5]/40 bg-[#FEF2FE]/40 text-[#EF4444]">
                            <Trash2 size={16} strokeWidth={1.8} />
                        </div>

                        <div>
                            <p className="text-[12.5px] font-semibold text-[#1F2937]">
                                Are you sure you want to delete this department?
                            </p>

                            <p className="mt-1 text-[11.5px] leading-relaxed text-[#6B7280]">
                                You are about to permanently delete <span className="font-bold text-[#DC2626]">{departmentToDelete?.name}</span>. All associated roles and user mappings will be affected. This action cannot be undone.
                            </p>
                        </div>
                    </div>
                </div>
            </AdminModal>
        </div>
    );
  }};

export default DepartmentManagemelist;  
