import React, { useEffect, useMemo, useState } from "react";
import {
    Users,
    ShieldCheck,
    Building2,
    UserPlus,
    ArrowUpRight,
    Activity,
    ChevronRight,
    RefreshCw,
    Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../../../services/adminApis/userApi";
import { getRoles } from "../../../services/adminApis/rolesApi";
import { getDepartments } from "../../../services/adminApis/departmentApi";
import Skeleton from "../../../components/common/Skeleton/Skeleton";

const AdminDashboard = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            const [usersRes, rolesRes, departmentsRes] = await Promise.all([
                getUsers(),
                getRoles(),
                getDepartments(),
            ]);

             setUsers(usersRes?.data?.data?.data ?? []);
            setRoles(rolesRes?.data?.data || []);
            setDepartments(departmentsRes?.data?.data || []);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Unable to load dashboard data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const activeUsers = useMemo(
        () => users.filter((user) => user.is_active).length,
        [users]
    );

    const activeRoles = useMemo(
        () => roles.filter((role) => role.is_active).length,
        [roles]
    );

    const activeDepartments = useMemo(
        () => departments.filter((department) => department.is_active).length,
        [departments]
    );

    const departmentStats = useMemo(() => {
        return departments.map((department) => ({
            ...department,
            users: users.filter(
                (user) => Number(user.department_id) === Number(department.id)
            ).length,
        }));
    }, [departments, users]);

    const recentUsers = useMemo(() => {
        return [...users]
            .sort(
                (a, b) =>
                    new Date(b.created_at || 0) -
                    new Date(a.created_at || 0)
            )
            .slice(0, 5);
    }, [users]);

    const stats = [
        {
            title: "Total Users",
            value: users.length,
            active: activeUsers,
            subtitle: "Registered users",
            icon: Users,
            path: "/admin/users-management",
        },
        {
            title: "Total Roles",
            value: roles.length,
            active: activeRoles,
            subtitle: "Configured roles",
            icon: ShieldCheck,
            path: "/admin/roles-management",
        },
        {
            title: "Departments",
            value: departments.length,
            active: activeDepartments,
            subtitle: "Organization units",
            icon: Building2,
            path: "/admin/department-management",
        },
    ];

    return (
        <div className="w-full space-y-6">
            {/* HEADER */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5B8872]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#23845D]" />
                        Administration
                    </div>

                    <h1 className="text-[24px] font-semibold tracking-[-0.025em] text-[#152C20]">
                        Admin Dashboard
                    </h1>

                    <p className="mt-1 text-[12.5px] text-[#6E897C]">
                        Monitor users, roles and organizational access from one
                        place.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="flex h-9 items-center justify-center gap-2 self-start rounded-[9px] border border-[#CBE3D6] bg-white px-3.5 text-[11.5px] font-semibold text-[#39785D] shadow-[0_4px_14px_-10px_rgba(21,61,45,0.3)] transition-all hover:border-[#9EC8B1] hover:bg-[#F7FBF8] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
                >
                    <RefreshCw
                        size={14}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* ERROR */}
            {error && (
                <div className="flex items-center justify-between rounded-xl border border-[#F0CACA] bg-[#FFF7F7] px-4 py-3 text-[12px] font-medium text-[#B33A3A]">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={fetchDashboardData}
                        className="font-semibold underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* STAT CARDS */}
            {loading ? (
    <Skeleton
        variant="cards"
        count={3}
    />
) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <button
                            key={stat.title}
                            type="button"
                            onClick={() => navigate(stat.path)}
                            className="group relative overflow-hidden rounded-2xl border border-[#CBE3D6] bg-white p-5 text-left shadow-[0_12px_35px_-22px_rgba(21,61,45,0.4)] transition-all duration-300 hover:-translate-y-[2px] hover:border-[#AFCFBE] hover:shadow-[0_18px_40px_-22px_rgba(21,61,45,0.5)]"
                        >
                            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-[#EEF8F2] opacity-70" />

                            <div className="relative flex items-start justify-between">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#CBE3D6] bg-[#F1F9F4] text-[#23845D]">
                                    <Icon size={18} strokeWidth={1.9} />
                                </span>

                                <span className="flex h-7 w-7 items-center justify-center rounded-lg text-[#91A69B] transition-colors group-hover:bg-[#EEF8F2] group-hover:text-[#23845D]">
                                    <ArrowUpRight size={15} />
                                </span>
                            </div>

                            <div className="relative mt-5">
                                <p className="text-[11px] font-medium text-[#789187]">
                                    {stat.title}
                                </p>

                                <div className="mt-1 flex items-end gap-2">
                                    <span className="text-[28px] font-semibold tracking-[-0.04em] text-[#152C20]">
                                        {loading ? "—" : stat.value}
                                    </span>

                                    {!loading && (
                                        <span className="mb-1 rounded-full bg-[#EEF8F2] px-2 py-0.5 text-[9.5px] font-semibold text-[#23845D]">
                                            {stat.active} active
                                        </span>
                                    )}
                                </div>

                                <p className="mt-1 text-[10.5px] text-[#9AAEA5]">
                                    {stat.subtitle}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
)}

            {/* MAIN CONTENT */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.65fr]">
                {/* DEPARTMENT OVERVIEW */}
                <div className="overflow-hidden rounded-2xl border border-[#CBE3D6] bg-white shadow-[0_12px_35px_-22px_rgba(21,61,45,0.4)]">
                    <div className="flex items-center justify-between border-b border-[#E5F0E9] px-5 py-4">
                        <div>
                            <h2 className="text-[14px] font-semibold text-[#20392D]">
                                Department Overview
                            </h2>

                            <p className="mt-0.5 text-[10.5px] text-[#8AA097]">
                                Users distributed across departments
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/admin/department-management")
                            }
                            className="flex items-center gap-1 text-[10.5px] font-semibold text-[#39785D] hover:text-[#176B49]"
                        >
                            View all
                            <ChevronRight size={13} />
                        </button>
                    </div>

                    <div className="p-5">
                        {loading ? (
                            <LoadingState />
                        ) : departmentStats.length === 0 ? (
                            <EmptyState text="No departments available." />
                        ) : (
                            <div className="space-y-4">
                                {departmentStats.slice(0, 6).map((department) => {
                                    const percentage = users.length
                                        ? Math.round(
                                              (department.users / users.length) *
                                                  100
                                          )
                                        : 0;

                                    return (
                                        <div key={department.id}>
                                            <div className="mb-1.5 flex items-center justify-between">
                                                <span className="text-[11.5px] font-medium text-[#405D4F]">
                                                    {department.name}
                                                </span>

                                                <span className="text-[10.5px] font-semibold text-[#789187]">
                                                    {department.users} users
                                                </span>
                                            </div>

                                            <div className="h-1.5 overflow-hidden rounded-full bg-[#EDF4EF]">
                                                <div
                                                    className="h-full rounded-full bg-[#398B68] transition-all duration-700"
                                                    style={{
                                                        width: `${Math.max(
                                                            percentage,
                                                            department.users
                                                                ? 4
                                                                : 0
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* QUICK ACTIONS */}
                <div className="rounded-2xl border border-[#CBE3D6] bg-white p-5 shadow-[0_12px_35px_-22px_rgba(21,61,45,0.4)]">
                    <div className="mb-5">
                        <h2 className="text-[14px] font-semibold text-[#20392D]">
                            Quick Actions
                        </h2>

                        <p className="mt-0.5 text-[10.5px] text-[#8AA097]">
                            Frequently used administration actions
                        </p>
                    </div>

                    <div className="space-y-2.5">
                        <QuickAction
                            icon={UserPlus}
                            title="Create User"
                            description="Add a new system user"
                            onClick={() => navigate("/admin/new-user")}
                        />

                        <QuickAction
                            icon={ShieldCheck}
                            title="Create Role"
                            description="Configure access permissions"
                            onClick={() => navigate("/admin/create-role")}
                        />

                        <QuickAction
                            icon={Building2}
                            title="Create Department"
                            description="Add an organization unit"
                            onClick={() =>
                                navigate("/admin/department-management")
                            }
                        />
                    </div>
                </div>
            </div>

            {/* RECENT USERS */}
            <div className="overflow-hidden rounded-2xl border border-[#CBE3D6] bg-white shadow-[0_12px_35px_-22px_rgba(21,61,45,0.4)]">
                <div className="flex items-center justify-between border-b border-[#E5F0E9] px-5 py-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Activity size={15} className="text-[#23845D]" />

                            <h2 className="text-[14px] font-semibold text-[#20392D]">
                                Recent Users
                            </h2>
                        </div>

                        <p className="mt-0.5 text-[10.5px] text-[#8AA097]">
                            Latest users added to the system
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/admin/users-management")}
                        className="flex items-center gap-1 text-[10.5px] font-semibold text-[#39785D] hover:text-[#176B49]"
                    >
                        View all
                        <ChevronRight size={13} />
                    </button>
                </div>

                {loading ? (
                    <LoadingState />
                ) : recentUsers.length === 0 ? (
                    <EmptyState text="No users found." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="bg-[#F7FAF8]">
                                    <th className="px-5 py-3 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#7D958A]">
                                        User
                                    </th>

                                    <th className="px-5 py-3 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#7D958A]">
                                        Username
                                    </th>

                                    <th className="px-5 py-3 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#7D958A]">
                                        Department
                                    </th>

                                    <th className="px-5 py-3 text-right text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#7D958A]">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[#E8F1EB]">
                                {recentUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="transition-colors hover:bg-[#F8FBF9]"
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF5EE] text-[11px] font-semibold text-[#23845D]">
                                                    {(user.name || "U")
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>

                                                <div>
                                                    <p className="text-[11.5px] font-semibold text-[#253D31]">
                                                        {user.name || "—"}
                                                    </p>

                                                    <p className="text-[9.5px] text-[#8AA097]">
                                                        {user.email || "—"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-3.5 text-[11px] text-[#506B5E]">
                                            {user.username || "—"}
                                        </td>

                                        <td className="px-5 py-3.5 text-[11px] text-[#506B5E]">
                                            {user.department?.name ||
                                                departments.find(
                                                    (department) =>
                                                        Number(department.id) ===
                                                        Number(
                                                            user.department_id
                                                        )
                                                )?.name ||
                                                "—"}
                                        </td>

                                        <td className="px-5 py-3.5 text-right">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold ${
                                                    user.is_active
                                                        ? "bg-[#EAF6EF] text-[#23845D]"
                                                        : "bg-[#F5F5F5] text-[#8A8A8A]"
                                                }`}
                                            >
                                                {user.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const LoadingState = () => (
    <div className="flex items-center justify-center gap-2 px-5 py-12 text-[11px] font-medium text-[#789187]">
        <Loader2 size={16} className="animate-spin text-[#23845D]" />
        Loading data...
    </div>
);

const EmptyState = ({ text }) => (
    <div className="px-5 py-12 text-center text-[11px] text-[#91A69B]">
        {text}
    </div>
);

const QuickAction = ({ icon: Icon, title, description, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="group flex w-full items-center gap-3 rounded-xl border border-[#E0ECE5] bg-[#FBFDFC] p-3 text-left transition-all duration-200 hover:border-[#BBD8C8] hover:bg-[#F4FAF6]"
    >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#CBE3D6] bg-white text-[#23845D] shadow-[0_3px_10px_-7px_rgba(21,61,45,0.4)]">
            <Icon size={16} strokeWidth={1.9} />
        </span>

        <span className="min-w-0 flex-1">
            <span className="block text-[11.5px] font-semibold text-[#304A3D]">
                {title}
            </span>

            <span className="mt-0.5 block text-[9.5px] text-[#8AA097]">
                {description}
            </span>
        </span>

        <ChevronRight
            size={14}
            className="text-[#A2B4AB] transition-transform group-hover:translate-x-0.5 group-hover:text-[#23845D]"
        />
    </button>
);

export default AdminDashboard;