import React, { useEffect, useState } from "react";
import {
    Eye,
    Pencil,
    Trash2,
    ShieldCheck,
    Plus,
    Loader2,
    AlertTriangle,
    Search,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    getRoles,
    deleteRole,
} from "../../../services/adminApis/rolesApi";
import AdminModal from "../../../components/common/AdminModal/AdminModal";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import SearchInput from "../../../components/ui/SearchInput";
import Skeleton from "../../../components/common/Skeleton/Skeleton";

const RolesManagementList = () => {
    const navigate = useNavigate();

    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getRoles();
            setRoles(response?.data?.data || []);
        } catch (err) {
            console.error("Error fetching roles:", err);
            setError(
                err?.response?.data?.message ||
                    "Failed to load roles."
            );
            setRoles([]);
        } finally {
            setLoading(false);
        }
    };

    const getPermissions = (role) => {
        const permissions = role?.permissions?.[0]?.name?.[0];

        if (!permissions) return [];

        return Object.entries(permissions)
            .filter(([, value]) => value)
            .map(
                ([key]) =>
                    key.charAt(0).toUpperCase() + key.slice(1)
            );
    };

    const openDeleteModal = (role) => {
        setSelectedRole(role);
        setDeleteModal(true);
    };

    const closeDeleteModal = () => {
        if (deleting) return;

        setDeleteModal(false);
        setSelectedRole(null);
    };

    const handleDelete = async () => {
        if (!selectedRole) return;

        try {
            setDeleting(true);

            await deleteRole(selectedRole.id);

            toast.success("Role deleted successfully", {
                description: `${selectedRole.name} has been removed.`,
            });

            closeDeleteModal();
            await fetchRoles();
        } catch (err) {
            console.error("Error deleting role:", err);

            toast.error("Failed to delete role", {
                description:
                    err?.response?.data?.message ||
                    "Something went wrong while deleting the role.",
            });
        } finally {
            setDeleting(false);
        }
    };

    const filteredRoles = roles.filter((role) =>
        role.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full">
            {/* PAGE HEADER */}
            <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#CBDCD0] bg-gradient-to-tr from-[#EEFDF4] to-[#FFFFFF] shadow-[0_4px_12px_rgba(23,115,76,0.04)]">
                            <ShieldCheck
                                size={19}
                                strokeWidth={1.8}
                                className="text-[#17734C]"
                            />
                        </span>

                        <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-[#152C20]">
                            Roles Management
                        </h1>
                    </div>

                    <p className="pl-[46px] text-[12.5px] text-[#5C7A6C]">
                        View and manage roles, departments, and access
                        permissions.
                    </p>
                </div>

                {/* ADD ROLE */}
                <button
                    type="button"
                    onClick={() => navigate("/admin/create-role")}
                    className="flex h-[42px] items-center gap-2 rounded-[11px] bg-gradient-to-r from-[#17734C] to-[#1F9F68] px-4.5 text-[12px] font-semibold text-white shadow-[0_4px_14px_rgba(23,115,76,0.22)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_6px_20px_rgba(23,115,76,0.3)] active:scale-[0.98]"
                >
                    <Plus size={15} strokeWidth={2.2} />
                    Add New Role
                </button>
            </div>

            {/* SEARCH */}
            <div className="mb-4 flex items-center justify-between gap-4">
                <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search by role name..."
                    suggestions={roles.map((r) => r.name).filter(Boolean)}
                />
            </div>

            {/* TABLE */}
            <div className="w-full overflow-hidden rounded-2xl border border-[#E3ECE6] bg-white shadow-[0_12px_40px_-12px_rgba(21,50,32,0.07)]">
                <div className="w-full max-h-[450px] overflow-auto custom-scrollbar rounded-2xl">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-[#FAFDFB]">
                                <th className="w-[90px] sticky top-0 bg-[#FAFDFB] z-10 border-b border-[#E8EFEA] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#476053]">
                                    S.No
                                </th>

                                <th className="w-[24%] sticky top-0 bg-[#FAFDFB] z-10 border-b border-[#E8EFEA] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#476053]">
                                    Role Name
                                </th>

                                <th className="w-[24%] sticky top-0 bg-[#FAFDFB] z-10 border-b border-[#E8EFEA] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#476053]">
                                    Department
                                </th>

                                <th className="sticky top-0 bg-[#FAFDFB] z-10 border-b border-[#E8EFEA] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#476053]">
                                    Permissions
                                </th>

                                <th className="w-[130px] sticky top-0 bg-[#FAFDFB] z-10 border-b border-[#E8EFEA] px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-[#476053]">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#E8EFEA]">
                            {/* LOADING */}
                          {loading && (
                    <tr>
                        <td colSpan="5" className="p-0">
                            <Skeleton
                            variant="table"
                            rows={6}
                            showHeader={false}
                          columnDefinitions={[
                        { type: "number", width: "10%", align: "center" },
                        { type: "text", width: "40%" },
                        { type: "text", width: "40%" },
                        { type: "badge", width: "25%", align: "center" },
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
                                        colSpan="5"
                                        className="px-6 py-12 text-center text-[12px] font-medium text-[#C43D3D]"
                                    >
                                        {error}
                                    </td>
                                </tr>
                            )}

                            {/* EMPTY */}
                            {!loading &&
                                !error &&
                                filteredRoles.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16">
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <div className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEFDF5] border border-[#CBE5D8] text-[#17734C]">
                                                    <ShieldCheck size={22} strokeWidth={1.8} />
                                                </div>
                                                <h3 className="text-[14px] font-semibold text-[#152C20]">
                                                    {roles.length === 0 ? "No roles found" : "No matching roles"}
                                                </h3>
                                                <p className="mt-1 text-[11.5px] text-[#6C8679] max-w-xs">
                                                    {roles.length === 0 
                                                        ? "Create a new role and configure its permission rules." 
                                                        : "Try adjusting your search query or filters to find the role."}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                            {/* ROLES */}
                            {!loading &&
                                !error &&
                                filteredRoles.map((role, index) => {
                                    const permissions =
                                        getPermissions(role);

                                    return (
                                        <tr
                                            key={role.id}
                                            className="group transition-all duration-250 hover:bg-[#F6FAF8]/70"
                                        >
                                            {/* S.NO */}
                                            <td className="px-6 py-4 text-[12.5px] font-medium text-[#5C7A6C]">
                                                {String(index + 1).padStart(
                                                    2,
                                                    "0"
                                                )}
                                            </td>

                                            {/* ROLE NAME */}
                                            <td className="px-6 py-4">
                                                <span className="text-[13px] font-semibold text-[#152C20]">
                                                    {role.name}
                                                </span>
                                            </td>

                                            {/* DEPARTMENT */}
                                            <td className="px-6 py-4">
                                                <span className="inline-flex rounded-lg border border-[#E3ECE6] bg-[#F7FBF8] px-2.5 py-0.5 text-[11px] font-medium text-[#3E5A4D]">
                                                    {role.department?.name ||
                                                        "—"}
                                                </span>
                                            </td>

                                            {/* PERMISSIONS */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {permissions.length > 0 ? (
                                                        permissions.map(
                                                            (permission) => (
                                                                <span
                                                                    key={
                                                                        permission
                                                                    }
                                                                    className="rounded-lg border border-[#E3EFE8] bg-[#F1F9F4] px-2.5 py-0.5 text-[10.5px] font-medium text-[#1E5D3E]"
                                                                >
                                                                    {
                                                                        permission
                                                                    }
                                                                </span>
                                                            )
                                                        )
                                                    ) : (
                                                        <span className="text-[11px] text-[#9AAEA4]">
                                                            No permissions
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* ACTION */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* EDIT */}
                                                    <button
                                                        type="button"
                                                        aria-label={`Edit ${role.name}`}
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/update-role/${role.id}`
                                                            )
                                                        }
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#475569] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200 hover:border-[#E8C875] hover:bg-[#FFFDF5] hover:text-[#B38D24]"
                                                    >
                                                        <Pencil
                                                            size={14}
                                                            strokeWidth={1.9}
                                                        />
                                                    </button>

                                                    {/* DELETE */}
                                                    <button
                                                        type="button"
                                                        aria-label={`Delete ${role.name}`}
                                                        onClick={() =>
                                                            openDeleteModal(
                                                                role
                                                            )
                                                        }
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#475569] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200 hover:border-[#FCA5A5] hover:bg-[#FEF2F2] hover:text-[#EF4444]"
                                                    >
                                                        <Trash2
                                                            size={14}
                                                            strokeWidth={1.9}
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FOOTER */}
            {!loading && !error && (
                <p className="mt-3 px-1 text-[11.5px] text-[#8FA79B]">
                    Showing {filteredRoles.length} of {roles.length} role
                    {roles.length !== 1 ? "s" : ""}
                </p>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            <AdminModal
                open={deleteModal}
                onClose={closeDeleteModal}
                onSubmit={handleDelete}
                title="Delete Role"
                description="This action cannot be undone."
                icon={AlertTriangle}
                submitText="Delete Role"
                loading={deleting}
            >
                <div className="rounded-2xl border border-red-100 bg-[#FFF8F8] p-5 shadow-[0_2px_8px_rgba(239,68,68,0.02)]">
                    <div className="flex items-start gap-3.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#FCA5A5]/40 bg-[#FEF2FE]/40 text-[#EF4444]">
                            <Trash2 size={16} strokeWidth={1.8} />
                        </div>

                        <div>
                            <p className="text-[12.5px] font-semibold text-[#1F2937]">
                                Are you sure you want to delete this role?
                            </p>

                            <p className="mt-1 text-[11.5px] leading-relaxed text-[#6B7280]">
                                You are about to permanently delete the role <span className="font-bold text-[#DC2626]">{selectedRole?.name}</span> and its associated permissions. This action cannot be undone.
                            </p>
                        </div>
                    </div>
                </div>
            </AdminModal>
        </div>
    );
};

export default RolesManagementList;