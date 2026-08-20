import React, { useEffect, useState } from "react";
import { Eye, Pencil, ShieldCheck, Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRoles } from "../../../services/adminApis/rolesApi";

const RolesManagementList = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getRoles();
            const data = response?.data?.data || [];

            setRoles(data);
        } catch (err) {
            console.error("Error fetching roles:", err);
            setError("Failed to load roles.");
            setRoles([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            {/* PAGE HEADER */}
            <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#B8D9C8] bg-[#EEF8F2]">
                            <ShieldCheck
                                size={18}
                                strokeWidth={2}
                                className="text-[#17734C]"
                            />
                        </span>

                        <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-[#152C20]">
                            Roles Management
                        </h1>
                    </div>

                    <p className="pl-[46px] text-[12.5px] text-[#5C7A6C]">
                        View and manage roles, departments, and access permissions.
                    </p>
                </div>

                {/* ADD ROLE */}
                <button
                    type="button"
                    onClick={() => navigate("/admin/create-role")}
                    className="flex h-10 items-center gap-2 rounded-[10px] border border-[#176B49] bg-[#17734C] px-4 text-[12px] font-semibold text-white shadow-[0_6px_18px_-8px_rgba(23,115,76,0.6)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#125D3E] hover:shadow-[0_8px_22px_-8px_rgba(23,115,76,0.7)]"
                >
                    <Plus size={15} strokeWidth={2.2} />
                    Add New Role
                </button>
            </div>

            {/* TABLE */}
            <div className="w-full overflow-hidden rounded-2xl border border-[#CBE3D6] bg-white shadow-[0_10px_30px_-18px_rgba(21,44,32,0.35)]">
                <div className="w-full overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-[#F3F9F5]">
                                <th className="w-[90px] border-b border-[#E3F0E8] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                                    S.No
                                </th>

                                <th className="w-[24%] border-b border-[#E3F0E8] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                                    Role Name
                                </th>

                                <th className="w-[24%] border-b border-[#E3F0E8] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                                    Department
                                </th>

                                <th className="border-b border-[#E3F0E8] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                                    Status
                                </th>

                                <th className="w-[130px] border-b border-[#E3F0E8] px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5C7A6C]">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#E3F0E8]">
                            {/* LOADING */}
                            {loading && (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-6 py-12 text-center"
                                    >
                                        <div className="flex items-center justify-center gap-2 text-[12px] font-medium text-[#5C7A6C]">
                                            <Loader2
                                                size={16}
                                                className="animate-spin text-[#17734C]"
                                            />
                                            Loading roles...
                                        </div>
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
                            {!loading && !error && roles.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-6 py-12 text-center text-[12px] text-[#8FA79B]"
                                    >
                                        No roles found.
                                    </td>
                                </tr>
                            )}

                            {/* ROLES */}
                            {!loading &&
                                !error &&
                                roles.map((role, index) => (
                                    <tr
                                        key={role.id}
                                        className="transition-colors duration-150 hover:bg-[#F6FBF8]"
                                    >
                                        {/* S.NO */}
                                        <td className="px-6 py-4 text-[12.5px] font-medium text-[#5C7A6C]">
                                            {String(index + 1).padStart(2, "0")}
                                        </td>

                                        {/* ROLE NAME */}
                                        <td className="px-6 py-4">
                                            <span className="text-[13px] font-semibold text-[#152C20]">
                                                {role.name}
                                            </span>
                                        </td>

                                        {/* DEPARTMENT */}
                                        <td className="px-6 py-4">
                                            <span className="inline-flex rounded-full border border-[#D6E8DE] bg-[#F5FAF7] px-2.5 py-1 text-[11px] font-medium text-[#3E5A4D]">
                                                Department {role.department_id}
                                            </span>
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold ${
                                                    role.is_active
                                                        ? "border-[#BFE0CC] bg-[#EDF8F1] text-[#17734C]"
                                                        : "border-[#E5CCCC] bg-[#FEF3F3] text-[#B33A3A]"
                                                }`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${
                                                        role.is_active
                                                            ? "bg-[#23845D]"
                                                            : "bg-[#C43D3D]"
                                                    }`}
                                                />
                                                {role.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        {/* ACTION */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    aria-label={`View ${role.name}`}
                                                    className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#CBE3D6] bg-white text-[#5C7A6C] transition-all duration-150 hover:border-[#1F8A5F]/35 hover:bg-[#F1F9F4] hover:text-[#17734C]"
                                                >
                                                    <Eye
                                                        size={15}
                                                        strokeWidth={1.9}
                                                    />
                                                </button>

                                                <button
                                                    type="button"
                                                    aria-label={`Edit ${role.name}`}
                                                    className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#CBE3D6] bg-white text-[#5C7A6C] transition-all duration-150 hover:border-[#B8933A]/40 hover:bg-[#FCF8EE] hover:text-[#B8933A]"
                                                >
                                                    <Pencil
                                                        size={14}
                                                        strokeWidth={1.9}
                                                    />
                                                </button>
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
                    Showing {roles.length} role
                    {roles.length !== 1 ? "s" : ""}
                </p>
            )}
        </div>
    );
};

export default RolesManagementList;