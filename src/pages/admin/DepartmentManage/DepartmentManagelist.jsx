import React, { useEffect, useState, useMemo } from "react";
import {
    Building2,
    Pencil,
    Plus,
    Loader2,
    XCircle,
    Trash2,
    AlertTriangle,
} from "lucide-react";
import {
    addDepartment,
    getDepartments,
    updateDepartment,
    deleteDepartment,
} from "../../../services/adminApis/departmentApi";
import AdminModal from "../../../components/common/AdminModal/AdminModal";
import { toast } from "sonner";
import Skeleton from "../../../components/common/Skeleton/Skeleton";
import SearchInput from "../../../components/common/SearchInput/SearchInput";
import useDebounce from "../../../hooks/useDebounce";

const DepartmentManagemelist = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);

    const filteredDepartments = useMemo(() => {
        const query = debouncedSearch.trim().toLowerCase();
        if (!query) return departments;
        return departments.filter((dept) =>
            dept.name?.toLowerCase().includes(query)
        );
    }, [departments, debouncedSearch]);

    const suggestions = useMemo(() => {
        return departments.map((dept) => dept.name).filter(Boolean);
    }, [departments]);

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

        closeDeleteModal();
        await fetchDepartments();
    } catch (err) {
        toast.error(
            err?.response?.data?.message ||
                "Failed to delete department."
        );
    } finally {
        setDeleting(false);
    }
};
    return (
        <div className="w-full">
            {/* PAGE HEADER */}
            <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#B8D9C8] bg-[#EEF8F2]">
                        <Building2
                            size={18}
                            strokeWidth={2}
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
                    className="flex h-10 items-center gap-2 rounded-[10px] border border-[#176B49] bg-[#17734C] px-4 text-[12px] font-semibold text-white shadow-[0_6px_18px_-8px_rgba(23,115,76,0.6)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#125D3E] hover:shadow-[0_8px_22px_-8px_rgba(23,115,76,0.7)]"
                >
                    <Plus size={15} strokeWidth={2.2} />
                    Add New Department
                </button>
            </div>

            <SearchInput
                value={search}
                onChange={setSearch}
                suggestions={suggestions}
                placeholder="Search departments..."
            />

            {/* TABLE */}
            <div className="w-full overflow-hidden rounded-2xl border border-[#CBE3D6] bg-white shadow-[0_10px_30px_-18px_rgba(21,44,32,0.35)]">
                <div className="w-full overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-[#F3F9F5]">
                                <th className="w-[100px] border-b border-[#E3F0E8] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                                    S.No
                                </th>

                                <th className="border-b border-[#E3F0E8] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                                    Department Name
                                </th>

                                <th className="w-[150px] border-b border-[#E3F0E8] px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
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

                            {!loading &&
                                !error &&
                                filteredDepartments.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="3"
                                            className="px-6 py-12 text-center text-[12px] text-[#8FA79B]"
                                        >
                                            No departments found.
                                        </td>
                                    </tr>
                                )}

                            {!loading &&
                                !error &&
                                filteredDepartments.map((department, index) => (
                                    <tr
                                        key={department.id}
                                        className="transition-colors duration-150 hover:bg-[#F6FBF8]"
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
                                                    className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#CBE3D6] bg-white text-[#5C7A6C] transition-all duration-150 hover:border-[#B8933A]/40 hover:bg-[#FFFCF5] hover:text-[#B8933A]"
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
                                                    className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#E8CCCC] bg-white text-[#A65A5A] transition-all duration-150 hover:border-[#D88989] hover:bg-[#FFF6F6] hover:text-[#C43D3D]"
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
                    Showing {departments.length} department
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
                <div className="rounded-xl border border-[#F0D4D4] bg-[#FFF8F8] p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FCEAEA] text-[#C43D3D]">
                            <Trash2 size={16} strokeWidth={1.9} />
                        </div>

                        <div>
                            <p className="text-[12.5px] font-semibold text-[#3A2525]">
                                Are you sure you want to delete this
                                department?
                            </p>

                            <p className="mt-1 text-[11.5px] leading-5 text-[#806565]">
                                You are about to permanently delete{" "}
                                <span className="font-semibold text-[#C43D3D]">
                                    {departmentToDelete?.name}
                                </span>
                                . All associated data may be affected.
                            </p>
                        </div>
                    </div>
                </div>
            </AdminModal>
        </div>
    );
};

export default DepartmentManagemelist;