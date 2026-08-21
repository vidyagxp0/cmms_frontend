import React, { useEffect, useState } from "react";
import {
    UserPen,
    User,
    Mail,
    Phone,
    LockKeyhole,
    Building2,
    ShieldCheck,
    Hash,
    AtSign,
    Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getUsersDetail,
    updateUsers,
} from "../../../services/adminApis/userApi";

import { getDepartments } from "../../../services/adminApis/departmentApi";
import { getRoles } from "../../../services/adminApis/rolesApi";

import Dropdown from "../../../components/ui/Dropdown";
import MultiSelectDropdown from "../../../components/ui/MultiSelectDropdown";
import FieldLabel from "../../../components/ui/FieldLabel";
import { inputClass } from "../../../components/ui/formStyles";
import { toast } from "sonner";

const EditUser = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        salutation: "",
        person_id: "",
        name: "",
        username: "",
        email: "",
        mobile_no: "",
        password: "",
        department_id: "",
        roles: [],
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const loadUser = async () => {
            try {
                setLoadingData(true);
                setError("");

                const [userResponse, departmentResponse, rolesResponse] =
                    await Promise.all([
                        getUsersDetail(id),
                        getDepartments(),
                        getRoles(),
                    ]);

                const user = userResponse?.data?.data;

                setDepartments(departmentResponse?.data?.data || []);
                setRoles(rolesResponse?.data?.data || []);

                if (!user) {
                    setError("User details not found.");
                    return;
                }

                setForm({
                    salutation: user.salutation || "",
                    person_id: user.person_id || "",
                    name: user.name || "",
                    username: user.username || "",
                    email: user.email || "",
                    mobile_no: user.mobile_no || "",
                    password: "",
                    department_id: user.department_id || "",
                    roles: Array.isArray(user.roles)
                        ? user.roles.map((role) =>
                              Number(
                                  typeof role === "object"
                                      ? role.id
                                      : role
                              )
                          )
                        : [],
                });
            } catch (err) {
                setError(
                    err?.response?.data?.message ||
                        "Failed to load user details."
                );
            } finally {
                setLoadingData(false);
            }
        };

        if (id) loadUser();
    }, [id]);

    const updateField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
    };

    const validate = () => {
        const nextErrors = {};

        if (!form.salutation)
            nextErrors.salutation = "Salutation is required.";

        if (!form.name.trim())
            nextErrors.name = "Name is required.";

        if (!form.username.trim())
            nextErrors.username = "Username is required.";

        if (!form.email.trim())
            nextErrors.email = "Email is required.";

        if (!form.mobile_no.trim())
            nextErrors.mobile_no = "Mobile number is required.";

        if (!form.department_id)
            nextErrors.department_id = "Department is required.";

        if (!form.roles.length)
            nextErrors.roles = "Select at least one role.";

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setSaving(true);
            setError("");

            const payload = {
                salutation: form.salutation,
                person_id: form.person_id,
                name: form.name.trim(),
                username: form.username.trim(),
                email: form.email.trim(),
                mobile_no: form.mobile_no.trim(),
                department_id: Number(form.department_id),
                roles: form.roles.map(Number),
                is_active: true,
            };

            if (form.password.trim()) {
                payload.password = form.password;
            }

            await updateUsers(id, payload);
            toast.success("User Update successfully!");
            navigate("/admin/users-management");
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Failed to update user."
            );
            toast.error(
                err?.response?.data?.message ||
                    "Failed to create role. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    const departmentOptions = departments.map((department) => ({
        value: department.id,
        label: department.name,
        icon: Building2,
    }));

    const roleOptions = roles.map((role) => ({
        value: role.id,
        label: role.name,
        icon: ShieldCheck,
    }));

    if (loadingData) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="flex items-center gap-2 text-[12px] font-medium text-[#5C7A6C]">
                    <Loader2
                        size={17}
                        className="animate-spin text-[#17734C]"
                    />
                    Loading user details...
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* PAGE HEADER */}
            <div className="mb-6 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#B8D9C8] bg-[#EEF8F2]">
                    <UserPen
                        size={18}
                        strokeWidth={2}
                        className="text-[#17734C]"
                    />
                </span>

                <div>
                    <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-[#152C20]">
                        Edit User
                    </h1>

                    <p className="mt-0.5 text-[11.5px] text-[#6C8679]">
                        Update user details and access permissions.
                    </p>
                </div>
            </div>

            {/* FORM */}
            <form
                onSubmit={handleSubmit}
                className="w-full rounded-2xl border border-[#CBE3D6] bg-white p-6 shadow-[0_10px_30px_-18px_rgba(21,44,32,0.35)]"
            >
                {error && (
                    <div className="mb-5 rounded-[10px] border border-[#F0CACA] bg-[#FFF7F7] px-4 py-3 text-[11.5px] font-medium text-[#C43D3D]">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* SALUTATION */}
                    <Dropdown
                        label="Salutation"
                        icon={User}
                        value={form.salutation}
                        onChange={(value) =>
                            updateField("salutation", value)
                        }
                        options={["Mr.", "Mrs.", "Ms.", "Dr."]}
                        placeholder="Select salutation"
                        error={errors.salutation}
                    />

                    {/* PERSON ID */}
                    <div>
                        <FieldLabel icon={Hash}>
                            Person ID
                        </FieldLabel>

                        <input
                            value={form.person_id}
                            disabled
                            className={`${inputClass(
                                "person_id"
                            )} cursor-not-allowed bg-[#F1F6F3] text-[#6D8579]`}
                        />
                    </div>

                    {/* NAME */}
                    <div>
                        <FieldLabel icon={User}>
                            Name
                        </FieldLabel>

                        <input
                            value={form.name}
                            onChange={(e) =>
                                updateField("name", e.target.value)
                            }
                            placeholder="Enter full name"
                            className={inputClass("name")}
                        />

                        {errors.name && (
                            <p className="mt-1.5 text-[10.5px] font-medium text-[#C43D3D]">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* USERNAME */}
                    <div>
                        <FieldLabel icon={AtSign}>
                            Username
                        </FieldLabel>

                        <input
                            value={form.username}
                            onChange={(e) =>
                                updateField(
                                    "username",
                                    e.target.value
                                )
                            }
                            placeholder="Enter username"
                            className={inputClass("username")}
                        />

                        {errors.username && (
                            <p className="mt-1.5 text-[10.5px] font-medium text-[#C43D3D]">
                                {errors.username}
                            </p>
                        )}
                    </div>

                    {/* EMAIL */}
                    <div>
                        <FieldLabel icon={Mail}>
                            Email
                        </FieldLabel>

                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) =>
                                updateField(
                                    "email",
                                    e.target.value
                                )
                            }
                            placeholder="Enter email address"
                            className={inputClass("email")}
                        />

                        {errors.email && (
                            <p className="mt-1.5 text-[10.5px] font-medium text-[#C43D3D]">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* MOBILE */}
                    <div>
                        <FieldLabel icon={Phone}>
                            Mobile Number
                        </FieldLabel>

                        <input
                            type="tel"
                            value={form.mobile_no}
                            onChange={(e) =>
                                updateField(
                                    "mobile_no",
                                    e.target.value
                                )
                            }
                            placeholder="Enter mobile number"
                            className={inputClass("mobile_no")}
                        />

                        {errors.mobile_no && (
                            <p className="mt-1.5 text-[10.5px] font-medium text-[#C43D3D]">
                                {errors.mobile_no}
                            </p>
                        )}
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <FieldLabel
                            icon={LockKeyhole}
                            required={false}
                        >
                            Password
                        </FieldLabel>

                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) =>
                                updateField(
                                    "password",
                                    e.target.value
                                )
                            }
                            placeholder="Password"
                            className={inputClass("password")}
                            disabled
                        />

                    </div>

                    {/* DEPARTMENT */}
                    <Dropdown
                        label="Department"
                        icon={Building2}
                        value={form.department_id}
                        onChange={(value) =>
                            updateField("department_id", value)
                        }
                        options={departmentOptions}
                        placeholder="Select department"
                        error={errors.department_id}
                        disabled={loadingData}
                    />

                    {/* ROLES */}
                    <MultiSelectDropdown
                        label="Roles"
                        icon={ShieldCheck}
                        value={form.roles}
                        onChange={(value) =>
                            updateField("roles", value)
                        }
                        options={roleOptions}
                        placeholder="Select roles"
                        error={errors.roles}
                        disabled={loadingData}
                    />
                </div>

                {/* ACTIONS */}
                <div className="mt-7 flex items-center justify-end gap-3 border-t border-[#E3F0E8] pt-5">
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/users-management")
                        }
                        disabled={saving}
                        className="h-10 rounded-[10px] border border-[#CBE3D6] bg-white px-5 text-[12px] font-semibold text-[#557064] transition-all hover:bg-[#F5FAF7]"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="flex h-10 items-center gap-2 rounded-[10px] border border-[#176B49] bg-[#17734C] px-5 text-[12px] font-semibold text-white shadow-[0_6px_18px_-8px_rgba(23,115,76,0.6)] transition-all hover:-translate-y-[1px] hover:bg-[#125D3E] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving && (
                            <Loader2
                                size={14}
                                className="animate-spin"
                            />
                        )}

                        {saving ? "Updating..." : "Update User"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditUser;