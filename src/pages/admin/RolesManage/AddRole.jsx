import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ShieldPlus,
    Check,
    X,
    Building2,
    UserRound,
    LockKeyhole,
} from "lucide-react";
import Dropdown from "../../../components/ui/Dropdown";
import { addRole } from "../../../services/adminApis/rolesApi";
import { getDepartments } from "../../../services/adminApis/departmentApi";
import { toast } from "sonner";

const permissionOptions = ["Create", "Edit", "View"];

const AddRole = () => {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [departmentLoading, setDepartmentLoading] = useState(false);
    const [department, setDepartment] = useState("");
    const [roleName, setRoleName] = useState("");
    const [permissions, setPermissions] = useState({
        create: false,
        view: false,
        edit: false,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                setDepartmentLoading(true);
                const response = await getDepartments();
                const data = response?.data?.data || [];
                setDepartments(
                    data.map((department) => ({
                        value: department.id,
                        label: department.name,
                    }))
                );
            } catch (error) {
                setErrors((prev) => ({
                    ...prev,
                    department:
                        error?.response?.data?.message ||
                        "Failed to load departments.",
                }));
            } finally {
                setDepartmentLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    const togglePermission = (perm) => {
        const permissionKey = perm.toLowerCase();
        setPermissions((prev) => ({
            ...prev,
            [permissionKey]: !prev[permissionKey],
        }));
    };

    const selectedPermissionCount = Object.values(permissions).filter(
        Boolean
    ).length;

    const validate = () => {
        const nextErrors = {};

        if (!department) {
            nextErrors.department = "Select a department";
        }

        if (!roleName.trim()) {
            nextErrors.roleName = "Role name is required";
        }

        if (selectedPermissionCount === 0) {
            nextErrors.permissions = "Select at least one permission";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        const payload = {
            department_id: Number(department),
            name: roleName.trim(),
            permissions: [permissions],
            is_active: 1,
        };

        try {
            setLoading(true);
            const response = await addRole(payload);
            toast.success("Role created successfully!");
            navigate("/admin/roles-management");
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                    "Failed to create role. Please try again."
            );

            const message =
                error?.response?.data?.message ||
                "Failed to create role. Please try again.";

            setErrors((prev) => ({
                ...prev,
                submit: message,
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setDepartment("");
        setRoleName("");
        setPermissions({
            create: false,
            view: false,
            edit: false,
        });
        setErrors({});
        navigate("/admin/roles-management");
    };

    return (
        <div className="w-full">
            {/* PREMIUM PAGE HEADER */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#B9D9CA] bg-[#EAF5EF] shadow-[0_4px_14px_-8px_rgba(21,75,53,0.45)]">
                        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.9),transparent_55%)]" />
                        <ShieldPlus
                            size={19}
                            strokeWidth={2}
                            className="relative text-[#176B49]"
                        />
                    </span>

                    <div>
                        <h1 className="text-[21px] font-semibold tracking-[-0.02em] text-[#142A20]">
                            Create New Role
                        </h1>
                        <p className="mt-0.5 text-[12px] text-[#698276]">
                            Define a role and configure its access permissions.
                        </p>
                    </div>
                </div>

                <div className="hidden items-center gap-2 rounded-full border border-[#D8E9DF] bg-white px-3 py-1.5 shadow-[0_4px_12px_-9px_rgba(21,61,45,0.45)] sm:flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#23865E]" />
                    <span className="text-[10.5px] font-semibold text-[#668077]">
                        Role Configuration
                    </span>
                </div>
            </div>

            {/* FORM CARD */}
            <form
                onSubmit={handleSubmit}
                noValidate
                className="w-full overflow-hidden rounded-2xl border border-[#C9E1D5] bg-white shadow-[0_18px_50px_-28px_rgba(21,61,45,0.42)]"
            >
                {/* CARD HEADER */}
                <div className="border-b border-[#E2EEE7] bg-[linear-gradient(100deg,#F9FCFA_0%,#F2F8F4_55%,#F8FBF9_100%)] px-5 py-5 sm:px-7">
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#CBE3D6] bg-white text-[#277957] shadow-[0_3px_10px_-8px_rgba(21,61,45,0.5)]">
                            <LockKeyhole size={15} strokeWidth={1.9} />
                        </span>

                        <div>
                            <h2 className="text-[13px] font-semibold text-[#1A3528]">
                                Role Details
                            </h2>
                            <p className="text-[10.5px] text-[#82978D]">
                                Enter the basic information for this role.
                            </p>
                        </div>
                    </div>
                </div>

                {/* FORM BODY */}
                <div className="p-5 sm:p-7">
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {/* DEPARTMENT */}
                        <Dropdown
                            label="Department"
                            icon={Building2}
                            value={department}
                            options={departments}
                            placeholder="Select department"
                            error={errors.department}
                            searchable
                            onChange={(value) => {
                                setDepartment(value);
                                setErrors((prev) => ({
                                    ...prev,
                                    department: undefined,
                                }));
                            }}
                        />

                        {/* ROLE NAME */}
                        <div>
                            <label
                                htmlFor="roleName"
                                className="mb-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-[#263F33]"
                            >
                                <UserRound
                                    size={13}
                                    strokeWidth={1.9}
                                    className="text-[#39785D]"
                                />
                                Role Name
                            </label>

                            <input
                                id="roleName"
                                type="text"
                                value={roleName}
                                onChange={(e) => {
                                    setRoleName(e.target.value);
                                    setErrors((prev) => ({
                                        ...prev,
                                        roleName: undefined,
                                    }));
                                }}
                                placeholder="e.g. QA Manager"
                                className={`w-full rounded-[10px] border bg-[#F8FBF9] px-3.5 py-3 text-[12.5px] font-medium text-[#152C20] outline-none placeholder:font-normal placeholder:text-[#94A79E] transition-all duration-200 focus:bg-white focus:shadow-[0_0_0_3px_rgba(31,138,95,0.08)] ${
                                    errors.roleName
                                        ? "border-[#C43D3D] focus:border-[#C43D3D]"
                                        : "border-[#CBE3D6] focus:border-[#1F8A5F]"
                                }`}
                            />

                            {errors.roleName && (
                                <p className="mt-1.5 text-[10.5px] font-medium text-[#C43D3D]">
                                    {errors.roleName}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* PERMISSIONS */}
                    <div className="mt-7">
                        <div className="mb-3 flex items-end justify-between">
                            <div>
                                <label className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#263F33]">
                                    <LockKeyhole
                                        size={13}
                                        strokeWidth={1.9}
                                        className="text-[#39785D]"
                                    />
                                    Access Permissions
                                </label>

                                <p className="mt-1 text-[10.5px] text-[#84978E]">
                                    Select the permissions this role should
                                    have.
                                </p>
                            </div>

                            {selectedPermissionCount > 0 && (
                                <span className="rounded-full border border-[#CBE3D6] bg-[#F1F8F4] px-2.5 py-1 text-[10px] font-semibold text-[#287653]">
                                    {selectedPermissionCount} selected
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                            {permissionOptions.map((perm) => {
                                const permissionKey = perm.toLowerCase();
                                const checked = permissions[permissionKey];

                                return (
                                    <button
                                        key={perm}
                                        type="button"
                                        onClick={() => {
                                            togglePermission(perm);
                                            setErrors((prev) => ({
                                                ...prev,
                                                permissions: undefined,
                                            }));
                                        }}
                                        aria-pressed={checked}
                                        className={`group flex min-h-[58px] items-center justify-between rounded-xl border px-3.5 text-left transition-all duration-200 ${
                                            checked
                                                ? "border-[#9BC9B1] bg-[linear-gradient(135deg,#F0F8F3_0%,#E6F4EC_100%)] shadow-[0_5px_15px_-10px_rgba(23,115,76,0.45)]"
                                                : "border-[#D7E7DE] bg-[#FAFCFB] hover:border-[#B9D9CA] hover:bg-[#F5FAF7]"
                                        }`}
                                    >
                                        <div>
                                            <p
                                                className={`text-[12px] font-semibold ${
                                                    checked
                                                        ? "text-[#176B49]"
                                                        : "text-[#334F43]"
                                                }`}
                                            >
                                                {perm}
                                            </p>

                                            <p className="mt-0.5 text-[9.5px] text-[#8A9C94]">
                                                {perm === "Create"
                                                    ? "Add new records"
                                                    : perm === "Edit"
                                                    ? "Modify existing data"
                                                    : "View available data"}
                                            </p>
                                        </div>

                                        <span
                                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 ${
                                                checked
                                                    ? "border-[#1F8A5F] bg-[#1F8A5F] text-white shadow-[0_3px_8px_-5px_rgba(31,138,95,0.8)]"
                                                    : "border-[#C9DED3] bg-white text-transparent group-hover:border-[#A9CDB9]"
                                            }`}
                                        >
                                            <Check
                                                size={13}
                                                strokeWidth={2.5}
                                            />
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {errors.permissions && (
                            <p className="mt-1.5 text-[10.5px] font-medium text-[#C43D3D]">
                                {errors.permissions}
                            </p>
                        )}
                    </div>

                    {/* API ERROR */}
                    {errors.submit && (
                        <div className="mt-5 rounded-[10px] border border-[#E9BABA] bg-[#FFF6F6] px-3.5 py-2.5">
                            <p className="text-[11px] font-medium text-[#C43D3D]">
                                {errors.submit}
                            </p>
                        </div>
                    )}

                    {/* ACTIONS */}
                    <div className="mt-7 flex flex-col-reverse gap-2.5 border-t border-[#E5EFE9] pt-5 sm:flex-row sm:items-center sm:justify-end">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            className="flex h-10 items-center justify-center gap-1.5 rounded-[10px] border border-[#D2E4DB] bg-white px-4 text-[11.5px] font-semibold text-[#526A60] transition-all duration-200 hover:border-[#BBD5C7] hover:bg-[#F7FAF8] hover:text-[#304C3E] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <X size={14} strokeWidth={2} />
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[#16734D] bg-[linear-gradient(135deg,#176B49_0%,#238A61_100%)] px-5 text-[11.5px] font-semibold text-white shadow-[0_7px_18px_-9px_rgba(20,102,70,0.8)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_10px_22px_-9px_rgba(20,102,70,0.9)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                        >
                            {loading ? (
                                <>
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Check
                                        size={14}
                                        strokeWidth={2.2}
                                        className="transition-transform duration-200 group-hover:scale-110"
                                    />
                                    Create Role
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddRole;