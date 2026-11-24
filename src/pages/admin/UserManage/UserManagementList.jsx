import React, { useEffect, useState } from "react";
import {
    Users,
    Pencil,
    Trash2,
    Plus,
    UserCheck,
    Loader2,
    UserX,
    ChevronLeft,
    ChevronRight,
    Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUsers, deleteUser } from "../../../services/adminApis/userApi";
import { getRoles } from "../../../services/adminApis/rolesApi";
import AdminModal from "../../../components/common/AdminModal/AdminModal";
import SearchInput from "../../../components/ui/SearchInput";
import Dropdown from "../../../components/ui/Dropdown";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Skeleton from "../../../components/common/Skeleton/Skeleton";

const UserManagementList = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [availableRoles, setAvailableRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");
    const [sortOrder, setSortOrder] = useState("");

    const [pagination, setPagination] = useState({
            current_page: 1,
            last_page: 1,
            total: 0,
            from: 0,
            to: 0,
});
        const fetchUsers = async (currentPage = 1, searchValue = "") => {
            try {
                setLoading(true);
                setError("");

                const params = {
                    page: currentPage,
                    per_page: perPage,
                };

                if (searchValue.trim()) {
                    params.search = searchValue.trim();
                }

                const response = await getUsers(params);
                const data = response?.data?.data;

                setUsers(data?.data ?? []);

                setPagination({
                    current_page: data?.current_page ?? 1,
                    last_page: data?.last_page ?? 1,
                    total: data?.total ?? 0,
                    from: data?.from ?? 0,
                    to: data?.to ?? 0,
                });
            } catch (err) {
                setUsers([]);
                setError(
                    err?.response?.data?.message || "Failed to load users."
                );
            } finally {
                setLoading(false);
            }
        };

    const fetchRoles = async () => {
        try {
            const response = await getRoles();
            setAvailableRoles(response?.data?.data || []);
        } catch (err) {
            console.error("Failed to fetch roles:", err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setDeleteError("");
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        if (deleting) return;

        setDeleteModalOpen(false);
        setSelectedUser(null);
        setDeleteError("");
    };

    const handleDelete = async (e) => {
        e.preventDefault();

        if (!selectedUser?.id) return;

        try {
            setDeleting(true);
            setDeleteError("");

            await deleteUser(selectedUser.id);
            toast.success("User deleted successfully", {
                description: `${selectedUser.name} has been removed.`,
            });
            setDeleteModalOpen(false);
            setSelectedUser(null);
            await fetchUsers();
        } catch (err) {
            setDeleteError(
                err?.response?.data?.message || "Failed to delete user."
            );
            toast.success("User deleted successfully", {
              description: `${selectedUser.name} has been removed.`,
          });
        } finally {
            setDeleting(false);
        }
    };

    const filteredUsers = users.filter((user) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = user.name?.toLowerCase().includes(query);
        const matchesRole = selectedRole
            ? user.roles?.some((role) => role.name === selectedRole)
            : true;
        return matchesSearch && matchesRole;
    });

    if (sortOrder === "asc") {
        filteredUsers.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortOrder === "desc") {
        filteredUsers.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    }

    const roleOptions = [
        { value: "", label: "All Roles" },
        ...availableRoles.map((role) => ({
            value: role.name,
            label: role.name,
        })),
    ];

    const sortOptions = [
        { value: "", label: "Default Sort" },
        { value: "asc", label: "A - Z" },
        { value: "desc", label: "Z - A" },
    ];

    return (
        <div className="w-full">
            {/* PAGE HEADER */}
            <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#CBDCD0] bg-gradient-to-tr from-[#EEFDF4] to-[#FFFFFF] shadow-[0_4px_12px_rgba(23,115,76,0.04)]">
                        <Users
                            size={19}
                            strokeWidth={1.8}
                            className="text-[#17734C]"
                        />
                    </span>

                    <div>
                        <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-[#152C20]">
                            User Management
                        </h1>
                        <p className="mt-1 text-[13px] font-medium text-[#64748B]">
                            View and manage users, roles, and access permissions.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/admin/new-user")}
                    className="flex h-[42px] items-center gap-2 rounded-[11px] bg-gradient-to-r from-[#17734C] to-[#1F9F68] px-4.5 text-[12px] font-semibold text-white shadow-[0_4px_14px_rgba(23,115,76,0.22)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_6px_20px_rgba(23,115,76,0.3)] active:scale-[0.98]"
                >
                    <Plus size={15} strokeWidth={2.2} />
                    Add New User
                </button>
            </div>

            {/* SEARCH & FILTERS */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
                <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search by user's name..."
                    suggestions={users.map((u) => u.name).filter(Boolean)}
                />
                <div className="w-full sm:w-48">
                    <Dropdown
                        value={selectedRole}
                        options={roleOptions}
                        placeholder="All Roles"
                        onChange={setSelectedRole}
                    />
                </div>
                <div className="w-full sm:w-48">
                    <Dropdown
                        value={sortOrder}
                        options={sortOptions}
                        placeholder="Sort By"
                        onChange={setSortOrder}
                    />
                </div>
            </div>

            {/* TABLE */}
            <div className="w-full overflow-hidden rounded-2xl border border-[#E3ECE6] bg-white shadow-[0_12px_40px_-12px_rgba(21,50,32,0.07)]">
                <div className="w-full max-h-[450px] overflow-auto custom-scrollbar rounded-2xl">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-[#FAFDFB]">
                                <th className="w-[80px] sticky top-0 bg-[#FAFDFB] z-10 border-b border-[#E8EFEA] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#476053]">
                                    S.No
                                </th>
                                <th className="sticky top-0 bg-[#FAFDFB] z-10 border-b border-[#E8EFEA] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#476053]">
                                    Person ID
                                </th>
                                <th className="sticky top-0 bg-[#FAFDFB] z-10 border-b border-[#E8EFEA] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#476053]">
                                    User
                                </th>
                                <th className="sticky top-0 bg-[#FAFDFB] z-10 border-b border-[#E8EFEA] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#476053]">
                                    Username
                                </th>
                                <th className="sticky top-0 bg-[#FAFDFB] z-10 border-b border-[#E8EFEA] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#476053]">
                                    Department
                                </th>
                                <th className="sticky top-0 bg-[#FAFDFB] z-10 border-b border-[#E8EFEA] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#476053]">
                                    Roles
                                </th>
                                <th className="sticky top-0 bg-[#FAFDFB] z-10 border-b border-[#E8EFEA] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#476053]">
                                    Status
                                </th>
                                <th className="w-[110px] sticky top-0 bg-[#FAFDFB] z-10 border-b border-[#E8EFEA] px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-[#476053]">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#E8EFEA]">
                            {/* LOADING */}
                            {loading && (
                                <tr>
                            <td colSpan="8" className="">
                            <Skeleton
                            variant="table"
                            rows={6}
                            showHeader={false}
                            columnDefinitions={[
                            { type: "number", width: "7%", align: "center" },
                            { type: "avatarText", width: "25%" },
                            { type: "email", width: "25%" },
                            { type: "badge", width: "18%", align: "center" },
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
                                        colSpan="8"
                                        className="px-6 py-14 text-center text-[12px] font-medium text-[#C43D3D]"
                                    >
                                        {error}
                                    </td>
                                </tr>
                            )}

                            {/* EMPTY */}
                            {!loading &&
                                !error &&
                                filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-16">
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <div className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEFDF5] border border-[#CBE5D8] text-[#17734C]">
                                                    <Users size={22} strokeWidth={1.8} />
                                                </div>
                                                <h3 className="text-[14px] font-semibold text-[#152C20]">
                                                    {users.length === 0 ? "No users found" : "No matching users"}
                                                </h3>
                                                <p className="mt-1 text-[11.5px] text-[#6C8679] max-w-xs">
                                                    {users.length === 0 
                                                        ? "Get started by adding a new user to your organization directory." 
                                                        : "Try adjusting your search query or role filters to find who you're looking for."}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                            {/* USERS */}
                            {!loading &&
                                !error &&
                                filteredUsers.map((user, index) => {
                                    const roles = user.roles || [];
                                    const department =
                                        user.department?.name || "-";

                                    return (
                                        <tr
                                            key={user.id}
                                            className="group transition-all duration-250 hover:bg-[#F6FAF8]/70"
                                        >
                                            <td className="px-5 py-4 text-[12.5px] font-medium text-[#5C7A6C]">
                                                {String(pagination.from + index).padStart(2, "0")}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="rounded-lg border border-[#E3ECE6] bg-[#F7FBF8] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-[#346049]">
                                                    {user.person_id || "-"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#CDE5D8] bg-[#EEFDF5] text-[11px] font-bold text-[#17734C]">
                                                        {user.name
                                                            ?.charAt(0)
                                                            ?.toUpperCase() ||
                                                            "U"}
                                                    </span>

                                                    <div>
                                                        <p className="text-[12.5px] font-semibold text-[#152C20]">
                                                            {user.name || "-"}
                                                        </p>
                                                        <p className="text-[10.5px] text-[#8FA79B]">
                                                            {user.email || "-"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-[12px] font-medium text-[#3E5A4D]">
                                                {user.username || "-"}
                                            </td>

                                            <td className="px-5 py-4 text-[12px] text-[#3E5A4D]">
                                                {department}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex max-w-[220px] flex-wrap gap-1.5">
                                                    {roles.length > 0 ? (
                                                        roles.map((role) => (
                                                            <span
                                                                key={role.id}
                                                                className="rounded-lg border border-[#E3EFE8] bg-[#F1F9F4] px-2.5 py-0.5 text-[10.5px] font-medium text-[#1E5D3E]"
                                                            >
                                                                {role.name ||
                                                                    "-"}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[11px] text-[#8FA79B]">
                                                            No role
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                {user.is_active ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D1F0DB] bg-[#EDFBF2] px-2.5 py-0.5 text-[10.5px] font-semibold text-[#147037]">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-[#1CD162] animate-[pulse_2s_infinite]" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5C2C2] bg-[#FDF2F2] px-2.5 py-0.5 text-[10.5px] font-semibold text-[#9B2C2C]">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-[#E53E3E]" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* EDIT */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/update-user/${user.id}`
                                                            )
                                                        }
                                                        aria-label={`Edit ${user.name}`}
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
                                                        onClick={() =>
                                                            openDeleteModal(
                                                                user
                                                            )
                                                        }
                                                        aria-label={`Delete ${user.name}`}
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
                    Showing {filteredUsers.length} of {users.length} user
                    {users.length !== 1 ? "s" : ""}
                </p>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            <AdminModal
                open={deleteModalOpen}
                onClose={closeDeleteModal}
                onSubmit={handleDelete}
                title="Delete User"
                description="This action cannot be undone."
                icon={Trash2}
                submitText="Delete User"
                loading={deleting}
            >
                <div className="rounded-2xl border border-red-100 bg-[#FFF8F8] p-5 shadow-[0_2px_8px_rgba(239,68,68,0.02)]">
                    <div className="flex items-start gap-3.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#FCA5A5]/40 bg-[#FEF2FE]/40 text-[#EF4444]">
                            <Trash2 size={16} strokeWidth={1.8} />
                        </div>

                        <div>
                            <p className="text-[12.5px] font-semibold text-[#1F2937]">
                                Are you sure you want to delete{" "}
                                <span className="font-bold text-[#DC2626]">
                                    {selectedUser?.name || "this user"}
                                </span>
                                ?
                            </p>

                            <p className="mt-1 text-[11.5px] leading-relaxed text-[#6B7280]">
                                The user and all associated administrative permissions will be permanently removed. This action cannot be undone.
                            </p>
                        </div>
                    </div>
                </div>

                {deleteError && (
                    <p className="mt-3 text-[10.5px] font-medium text-[#C43D3D]">
                        {deleteError}
                    </p>
                )}
            </AdminModal>
        </div>
    );
};

export default UserManagementList;