import React, { useEffect, useRef, useState } from "react";
import {
    ArrowLeft,
    Building2,
    Check,
    ChevronDown,
    Loader2,
    Pencil,
    ShieldCheck,
    XCircle,
    Search,
    X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getRoleDetail,
    updateRole,
} from "../../../services/adminApis/rolesApi";
import { getDepartments } from "../../../services/adminApis/departmentApi";
import { toast } from "sonner";

const EditRole = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const departmentRef = useRef(null);

    const [roleName, setRoleName] = useState("");
    const [department, setDepartment] = useState("");
    const [departments, setDepartments] = useState([]);
    const [deptSearch, setDeptSearch] = useState("");

    const [permissions, setPermissions] = useState({
        create: false,
        view: false,
        edit: false,
    });

    const [departmentOpen, setDepartmentOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [formErrors, setFormErrors] = useState({});

    /* LOAD DEPARTMENTS + ROLE */
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                const [departmentResponse, roleResponse] =
                    await Promise.all([
                        getDepartments(),
                        getRoleDetail(id),
                    ]);

                const departmentData =
                    departmentResponse?.data?.data || [];

                const role = roleResponse?.data?.data;

                if (!role) {
                    throw new Error("Role data not found.");
                }

                setDepartments(departmentData);

                /* ROLE NAME */
                setRoleName(role.name || "");

                /* DEPARTMENT ID */
                setDepartment(
                    role.department_id
                        ? String(role.department_id)
                        : ""
                );

                /* PERMISSIONS */
                const permissionData =
                    role.permissions?.[0]?.name?.[0] || {};

                setPermissions({
                    create: Boolean(permissionData.create),
                    view: Boolean(permissionData.view),
                    edit: Boolean(permissionData.edit),
                });
            } catch (err) {
                setError(
                    err?.response?.data?.message ||
                        err?.message ||
                        "Failed to load role details."
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadData();
        }
    }, [id]);

    /* CLOSE DROPDOWN WHEN CLICKING OUTSIDE */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                departmentRef.current &&
                !departmentRef.current.contains(event.target)
            ) {
                setDepartmentOpen(false);
                setDeptSearch("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const selectedDepartment = departments.find(
        (item) => String(item.id) === String(department)
    );

    const handlePermissionChange = (permission) => {
        setPermissions((prev) => ({
            ...prev,
            [permission]: !prev[permission],
        }));

        if (formErrors.permissions) {
            setFormErrors((prev) => ({
                ...prev,
                permissions: "",
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!roleName.trim()) {
            errors.roleName = "Role name is required.";
        }

        if (!department) {
            errors.department = "Department is required.";
        }

        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setSaving(true);
            setError("");

            const payload = {
                department_id: Number(department),
                name: roleName.trim(),
                permissions: [
                    {
                        create: permissions.create,
                        view: permissions.view,
                        edit: permissions.edit,
                    },
                ],
                is_active: 1,
            };

            await updateRole(id, payload);
toast.success("Role updated successfully!");
            navigate("/admin/roles-management");
        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                    "Failed to update role. Please try again."
            );
            setError(
                err?.response?.data?.message ||
                    "Failed to update role."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[calc(100vh-130px)] items-center justify-center">
                <div className="flex items-center gap-2.5 text-[12px] font-medium text-[#5C7A6C]">
                    <Loader2
                        size={18}
                        className="animate-spin text-[#17734C]"
                    />
                    Loading role details...
                </div>
            </div>
        );
    }

    if (error && !roleName && !department) {
        return (
            <div className="w-full">
                <div className="rounded-2xl border border-[#E8CACA] bg-white p-10 text-center shadow-[0_10px_30px_-18px_rgba(21,44,32,0.35)]">
                    <XCircle
                        size={32}
                        className="mx-auto mb-3 text-[#C43D3D]"
                    />

                    <p className="text-[13px] font-semibold text-[#263F33]">
                        Unable to load role
                    </p>

                    <p className="mt-1 text-[11.5px] text-[#8A6B6B]">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/admin/roles")}
                        className="mt-5 inline-flex h-9 items-center gap-2 rounded-[9px] bg-[#17734C] px-4 text-[11.5px] font-semibold text-white transition hover:bg-[#125D3E]"
                    >
                        <ArrowLeft size={14} />
                        Back to Roles
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* HEADER */}
            <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/roles")}
                        className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#CBE3D6] bg-white text-[#5C7A6C] transition-all duration-200 hover:border-[#9FC9B2] hover:bg-[#F5FAF7] hover:text-[#17734C]"
                        aria-label="Back"
                    >
                        <ArrowLeft
                            size={16}
                            strokeWidth={1.9}
                        />
                    </button>

                    <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#B8D9C8] bg-[#EEF8F2]">
                            <ShieldCheck
                                size={18}
                                strokeWidth={2}
                                className="text-[#17734C]"
                            />
                        </span>

                        <div>
                            <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-[#152C20]">
                                Edit Role
                            </h1>

                            <p className="mt-0.5 text-[11.5px] text-[#71877C]">
                                Modify role details and access permissions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ERROR */}
            {error && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-[#E8CACA] bg-[#FFF8F8] px-4 py-3 text-[11.5px] font-medium text-[#C43D3D]">
                    <XCircle size={14} />
                    {error}
                </div>
            )}

            {/* FORM CARD */}
            <form onSubmit={handleSubmit}>
                <div className="rounded-2xl border border-[#CBE3D6] bg-white shadow-[0_14px_40px_-24px_rgba(21,44,32,0.35)]">
                    {/* CARD HEADER */}
                    <div className="border-b border-[#E3F0E8] px-6 py-5">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#EEF8F2]">
                                <Pencil
                                    size={15}
                                    className="text-[#17734C]"
                                />
                            </div>

                            <div>
                                <h2 className="text-[14px] font-semibold text-[#1C382A]">
                                    Role Information
                                </h2>

                                <p className="mt-0.5 text-[10.5px] text-[#81968B]">
                                    Update the role name, department and permissions.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* FORM BODY */}
                    <div className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-2">
                        {/* DEPARTMENT */}
                        <div>
                            <label className="mb-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-[#263F33]">
                                <Building2
                                    size={13}
                                    strokeWidth={1.9}
                                    className="text-[#39785D]"
                                />
                                Department
                            </label>

                            <div
                                className="relative"
                                ref={departmentRef}
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setDepartmentOpen(
                                            (prev) => !prev
                                        )
                                    }
                                    className={`flex h-[46px] w-full items-center justify-between rounded-[10px] border bg-[#F9FCFA] px-3.5 text-left outline-none transition-all duration-200 ${
                                        departmentOpen
                                            ? "border-[#79B89A] bg-white shadow-[0_0_0_3px_rgba(31,138,95,0.07)]"
                                            : formErrors.department
                                            ? "border-[#C43D3D]"
                                            : "border-[#CBE3D6] hover:border-[#AFCFBE] hover:bg-white"
                                    }`}
                                    aria-expanded={departmentOpen}
                                    aria-haspopup="listbox"
                                >
                                    <span
                                        className={`text-[12.5px] font-medium ${
                                            selectedDepartment
                                                ? "text-[#1C382A]"
                                                : "text-[#94A79E]"
                                        }`}
                                    >
                                        {selectedDepartment?.name ||
                                            "Select department"}
                                    </span>

                                    <ChevronDown
                                        size={15}
                                        strokeWidth={1.8}
                                        className={`text-[#71877C] transition-transform duration-200 ${
                                            departmentOpen
                                                ? "rotate-180 text-[#287653]"
                                                : ""
                                        }`}
                                    />
                                </button>

                                {departmentOpen && (
                                    <div className="absolute left-0 right-0 top-[calc(100%+7px)] z-50 overflow-hidden rounded-xl border border-[#CBE3D6] bg-white p-1.5 shadow-[0_18px_40px_-18px_rgba(21,61,45,0.38)]">
                                        <div className="px-2.5 pb-1.5 pt-1 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#91A39A]">
                                            Departments
                                        </div>

                                        <div className="relative mb-1.5 px-1 flex items-center">
                                            <Search
                                                size={14}
                                                strokeWidth={1.8}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8AA096]"
                                            />

                                            <input
                                                type="text"
                                                value={deptSearch}
                                                onChange={(e) => setDeptSearch(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                placeholder="Search departments..."
                                                className="h-9 w-full rounded-lg border border-[#DCEAE2] bg-[#F8FBF9] pl-8 pr-8 text-[11.5px] font-medium text-[#1C382A] outline-none transition-all placeholder:text-[#9BAAA3] focus:border-[#79B89A] focus:bg-white focus:shadow-[0_0_0_3px_rgba(31,138,95,0.06)]"
                                            />

                                            {deptSearch && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeptSearch("");
                                                    }}
                                                    className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#91A39A] transition-colors hover:text-[#39785D]"
                                                >
                                                    <X size={13} strokeWidth={2} />
                                                </button>
                                            )}
                                        </div>

                                        {departments
                                            .filter((dept) =>
                                                dept.name?.toLowerCase().includes(deptSearch.toLowerCase())
                                            )
                                            .map((dept) => {
                                                const selected =
                                                    String(department) ===
                                                    String(dept.id);

                                                return (
                                                    <button
                                                        key={dept.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setDepartment(
                                                                String(
                                                                    dept.id
                                                                )
                                                            );
                                                            setDepartmentOpen(
                                                                false
                                                            );
                                                            setDeptSearch("");

                                                            setFormErrors(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    department:
                                                                        "",
                                                                })
                                                            );
                                                        }}
                                                        className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-2.5 text-left transition-all duration-150 ${
                                                            selected
                                                                ? "bg-[#EEF8F2] text-[#176B49]"
                                                                : "text-[#3B5549] hover:bg-[#F5FAF7] hover:text-[#176B49]"
                                                        }`}
                                                    >
                                                        <span className="text-[12px] font-medium">
                                                            {dept.name}
                                                        </span>

                                                        {selected && (
                                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#23845D] text-white">
                                                                <Check
                                                                    size={11}
                                                                    strokeWidth={
                                                                        2.5
                                                                    }
                                                                />
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}

                                        {departments.filter((dept) =>
                                            dept.name?.toLowerCase().includes(deptSearch.toLowerCase())
                                        ).length === 0 && (
                                            <div className="px-3 py-6 text-center text-[11.5px] text-[#8FA79B]">
                                                No departments found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {formErrors.department && (
                                <p className="mt-1.5 flex items-center gap-1 text-[10.5px] font-medium text-[#C43D3D]">
                                    <XCircle size={12} />
                                    {formErrors.department}
                                </p>
                            )}
                        </div>

                          {/* ROLE NAME */}
                        <div>
                            <label
                                htmlFor="roleName"
                                className="mb-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-[#263F33]"
                            >
                                <ShieldCheck
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

                                    if (formErrors.roleName) {
                                        setFormErrors((prev) => ({
                                            ...prev,
                                            roleName: "",
                                        }));
                                    }
                                }}
                                placeholder="Enter role name"
                                className={`h-[46px] w-full rounded-[10px] border bg-[#F9FCFA] px-3.5 text-[12.5px] font-medium text-[#1C382A] outline-none transition-all duration-200 placeholder:text-[#94A79E] ${
                                    formErrors.roleName
                                        ? "border-[#C43D3D]"
                                        : "border-[#CBE3D6] focus:border-[#79B89A] focus:bg-white focus:shadow-[0_0_0_3px_rgba(31,138,95,0.07)]"
                                }`}
                            />

                            {formErrors.roleName && (
                                <p className="mt-1.5 flex items-center gap-1 text-[10.5px] font-medium text-[#C43D3D]">
                                    <XCircle size={12} />
                                    {formErrors.roleName}
                                </p>
                            )}
                        </div>
                        
                    </div>

                    {/* PERMISSIONS */}
                    <div className="border-t border-[#E3F0E8] px-6 py-5">
                        <div className="mb-4">
                            <h3 className="text-[12.5px] font-semibold text-[#263F33]">
                                Permissions
                            </h3>

                            <p className="mt-0.5 text-[10.5px] text-[#81968B]">
                                Select the permissions this role should have.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {[
                                {
                                    key: "create",
                                    title: "Create",
                                    description:
                                        "Create new records",
                                },
                                {
                                    key: "view",
                                    title: "View",
                                    description:
                                        "View existing records",
                                },
                                {
                                    key: "edit",
                                    title: "Edit",
                                    description:
                                        "Modify existing records",
                                },
                            ].map((permission) => {
                                const checked =
                                    permissions[permission.key];

                                return (
                                    <button
                                        key={permission.key}
                                        type="button"
                                        onClick={() =>
                                            handlePermissionChange(
                                                permission.key
                                            )
                                        }
                                        className={`group flex items-center justify-between rounded-xl border p-4 text-left transition-all duration-200 ${
                                            checked
                                                ? "border-[#9CCCAF] bg-[#F1F9F4] shadow-[0_8px_20px_-16px_rgba(23,115,76,0.5)]"
                                                : "border-[#DCEBE2] bg-[#FAFCFB] hover:border-[#B9D7C5] hover:bg-white"
                                        }`}
                                    >
                                        <div>
                                            <p
                                                className={`text-[12px] font-semibold ${
                                                    checked
                                                        ? "text-[#176B49]"
                                                        : "text-[#334D41]"
                                                }`}
                                            >
                                                {permission.title}
                                            </p>

                                            <p className="mt-0.5 text-[10px] text-[#8A9E94]">
                                                {
                                                    permission.description
                                                }
                                            </p>
                                        </div>

                                        <span
                                            className={`flex h-5 w-5 items-center justify-center rounded-[6px] border transition-all ${
                                                checked
                                                    ? "border-[#23845D] bg-[#23845D] text-white"
                                                    : "border-[#C6D9CF] bg-white"
                                            }`}
                                        >
                                            {checked && (
                                                <Check
                                                    size={12}
                                                    strokeWidth={2.5}
                                                />
                                            )}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="flex items-center justify-end gap-3 border-t border-[#E3F0E8] bg-[#FBFDFC] px-6 py-4">
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/admin/roles-management")
                            }
                            disabled={saving}
                            className="h-10 rounded-[10px] border border-[#CBE3D6] bg-white px-5 text-[11.5px] font-semibold text-[#5C7A6C] transition hover:bg-[#F5FAF7] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex h-10 items-center gap-2 rounded-[10px] border border-[#176B49] bg-[#17734C] px-5 text-[11.5px] font-semibold text-white shadow-[0_6px_18px_-8px_rgba(23,115,76,0.6)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#125D3E] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                        >
                            {saving ? (
                                <>
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Pencil
                                        size={14}
                                        strokeWidth={2}
                                    />
                                    Update Role
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditRole;