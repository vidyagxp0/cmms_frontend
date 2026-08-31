import React, { useEffect, useState, useMemo } from "react";
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
import AdminModal from "../../../components/common/AdminModal/AdminModal";
import { toast } from "sonner";
import Skeleton from "../../../components/common/Skeleton/Skeleton";
import { getRoles } from "../../../services/adminApis/rolesApi";
import Dropdown from "../../../components/ui/Dropdown";
import SearchInput from "../../../components/common/SearchInput/SearchInput";
import useDebounce from "../../../hooks/useDebounce";

const UserManagementList = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);

    const [pagination, setPagination] = useState({
            current_page: 1,
            last_page: 1,
            total: 0,
            from: 0,
            to: 0,
});
    const [allRoles, setAllRoles] = useState([]);
    const [roleFilter, setRoleFilter] = useState("");

    const filteredUsers = useMemo(() => {
        if (!roleFilter) return users;
        return users.filter((user) =>
            user.roles?.some((role) => String(role.name) === String(roleFilter))
        );
    }, [users, roleFilter]);

    useEffect(() => {
        const fetchAllRoles = async () => {
            try {
                const response = await getRoles();
                setAllRoles(response?.data?.data || []);
            } catch (err) {
                console.error("Failed to fetch roles:", err);
            }
        };
        fetchAllRoles();
    }, []);

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

    const debouncedSearch = useDebounce(search, 350);

    const suggestions = useMemo(() => {
        return users.map((user) => user.name).filter(Boolean);
    }, [users]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    useEffect(() => {
        fetchUsers(page, debouncedSearch);
    }, [page, debouncedSearch]);

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
            toast.error(err?.response?.data?.message || "Failed to delete user.");
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
                        <Users
                            size={18}
                            strokeWidth={2}
                            className="text-[#17734C]"
                        />
                    </span>

                    <div>
                        <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-[#152C20]">
                            User Management
                        </h1>
                        <p className="mt-0.5 text-[11.5px] text-[#6C8679]">
                            View and manage users, roles, and access.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/admin/new-user")}
                    className="flex h-10 items-center gap-2 rounded-[10px] border border-[#176B49] bg-[#17734C] px-4 text-[12px] font-semibold text-white shadow-[0_6px_18px_-8px_rgba(23,115,76,0.6)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#125D3E] hover:shadow-[0_8px_22px_-8px_rgba(23,115,76,0.7)]"
                >
                    <Plus size={15} strokeWidth={2.2} />
                    Add New User
                </button>
            </div>

            {/* TABLE */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        suggestions={suggestions}
                        placeholder="Search users..."
                        className="mb-0"
                    />

                    <div className="w-full max-w-[200px]">
                        <Dropdown
                            value={roleFilter}
                            onChange={setRoleFilter}
                            options={[
                                { value: "", label: "All Roles" },
                                ...allRoles.map((role) => ({
                                    value: String(role.name),
                                    label: role.name,
                                })),
                            ]}
                            placeholder="All Roles"
                            searchable
                        />
                    </div>
                </div>
            </div>
                    <div className="w-full overflow-hidden rounded-2xl border border-[#CBE3D6] bg-white shadow-[0_10px_30px_-18px_rgba(21,44,32,0.35)]">
                         <div className="custom-scrollbar max-h-[calc(100vh-330px)] overflow-y-auto overflow-x-auto">
                              <table className="w-full border-collapse text-left">
                                <thead className="sticky top-0 z-10 bg-[#F3F9F5]">
                                    <tr className="bg-[#F3F9F5]">
                                    <th className="w-[80px] border-b border-[#E3F0E8] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                                        S.No
                                    </th>
                                    <th className="border-b border-[#E3F0E8] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                                        Person ID
                                    </th>
                                    <th className="border-b border-[#E3F0E8] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                                        User
                                    </th>
                                    <th className="border-b border-[#E3F0E8] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                                        Username
                                    </th>
                                    <th className="border-b border-[#E3F0E8] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                                        Department
                                    </th>
                                    <th className="border-b border-[#E3F0E8] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                                        Roles
                                    </th>
                                    <th className="border-b border-[#E3F0E8] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                                        Status
                                    </th>
                                    <th className="w-[110px] border-b border-[#E3F0E8] px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[#E3F0E8]">
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
                                            <td
                                                colSpan="8"
                                                className="px-6 py-14 text-center text-[12px] text-[#8FA79B]"
                                            >
                                                No users found.
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
                                                className="transition-colors duration-150 hover:bg-[#F6FBF8]"
                                            >
                                                <td className="px-5 py-4 text-[12.5px] font-medium text-[#5C7A6C]">
                                                    {String(pagination.from + index).padStart(2, "0")}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="rounded-md border border-[#DCEAE2] bg-[#F8FCFA] px-2 py-1 text-[11px] font-semibold text-[#39785D]">
                                                        {user.person_id || "-"}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#CBE3D6] bg-[#EEF8F2] text-[11px] font-bold text-[#17734C]">
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
                                                                    className="rounded-full border border-[#CBE3D6] bg-[#EAF5EE] px-2.5 py-1 text-[10.5px] font-medium text-[#17734C]"
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
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#CBE3D6] bg-[#EEF8F2] px-2.5 py-1 text-[10.5px] font-semibold text-[#17734C]">
                                                            <UserCheck size={12} />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8D7D7] bg-[#FFF6F6] px-2.5 py-1 text-[10.5px] font-semibold text-[#B84A4A]">
                                                            <UserX size={12} />
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
                                                            className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#CBE3D6] bg-white text-[#5C7A6C] transition-all duration-150 hover:border-[#B8933A]/40 hover:bg-[#FFFCF5] hover:text-[#B8933A]"
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
                                                            className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#E8D7D7] bg-white text-[#B84A4A] transition-all duration-150 hover:border-[#D9A5A5] hover:bg-[#FFF6F6] hover:text-[#A83D3D]"
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
            {!loading && !error && users.length > 0 && (
                 <div className="mt-3 flex items-center justify-between px-1">
                    <p className="text-[11.5px] text-[#8FA79B]">
                        Showing{" "}
                        <span className="font-semibold text-[#5C7A6C]">
                            {pagination.from}
                        </span>{" "}
                        to{" "}
                        <span className="font-semibold text-[#5C7A6C]">
                            {pagination.to}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-[#5C7A6C]">
                            {pagination.total}
                        </span>{" "}
                        users
                    </p>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            disabled={pagination.current_page === 1}
                            onClick={() =>
                                setPage(pagination.current_page - 1)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#CBE3D6] bg-white text-[#5C7A6C] transition-all hover:bg-[#F1F9F4] hover:text-[#17734C] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft size={15} />
                        </button>

                        <div className="flex h-8 min-w-8 items-center justify-center rounded-[8px] border border-[#176B49] bg-[#17734C] px-2 text-[11px] font-semibold text-white">
                            {pagination.current_page}
                        </div>

                        <button
                            type="button"
                            disabled={
                                pagination.current_page ===
                                pagination.last_page
                            }
                            onClick={() =>
                                setPage(pagination.current_page + 1)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#CBE3D6] bg-white text-[#5C7A6C] transition-all hover:bg-[#F1F9F4] hover:text-[#17734C] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>
                </div>
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
                <div className="rounded-xl border border-[#F0DADA] bg-[#FFF8F8] p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E8C4C4] bg-white text-[#B84A4A]">
                            <Trash2 size={16} strokeWidth={1.9} />
                        </div>

                        <div>
                            <p className="text-[12.5px] font-semibold text-[#382323]">
                                Are you sure you want to delete{" "}
                                <span className="text-[#A83D3D]">
                                    {selectedUser?.name || "this user"}
                                </span>
                                ?
                            </p>

                            <p className="mt-1 text-[11px] leading-5 text-[#8A6666]">
                                The user and its associated access will be
                                permanently removed.
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