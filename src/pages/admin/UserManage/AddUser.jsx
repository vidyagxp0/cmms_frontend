import React, { useEffect, useState } from "react";
import {
    UserPlus,
    User,
    Mail,
    Phone,
    LockKeyhole,
    Building2,
    ShieldCheck,
    Hash,
    AtSign,
    Loader2,
    UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
    addUsers,
    getPid
} from "../../../services/adminApis/userApi";

import {
    getDepartments,
} from "../../../services/adminApis/departmentApi";

import {
    getRoles,
} from "../../../services/adminApis/rolesApi";

import AdminModal from "../../../components/common/AdminModal/AdminModal";
import Dropdown from "../../../components/ui/Dropdown";
import MultiSelectDropdown from "../../../components/ui/MultiSelectDropdown";
import FieldLabel from "../../../components/ui/FieldLabel";
import { inputClass } from "../../../components/ui/formStyles";
import { toast } from "sonner";

const AddUser = () => {
    const navigate = useNavigate();

    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [personId, setPersonId] = useState("");
    const [pidLoading, setPidLoading] = useState(true);

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
    const fetchPid = async () => {
        try {
            setPidLoading(true);

            const response = await getPid();

            const pid =
                response?.data?.data ||
                "";

            setPersonId(pid);
        } catch (error) {
            console.error("Failed to generate Person ID:", error);
            setPersonId("");
        } finally {
            setPidLoading(false);
        }
    };

    fetchPid();
}, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingData(true);

                const [departmentResponse, rolesResponse] =
                    await Promise.all([
                        getDepartments(),
                        getRoles(),
                    ]);

                setDepartments(
                    departmentResponse?.data?.data || []
                );

                setRoles(rolesResponse?.data?.data || []);
            } catch (err) {
                setError(
                    err?.response?.data?.message ||
                        "Failed to load departments and roles."
                );
            } finally {
                setLoadingData(false);
            }
        };

        loadData();
    }, []);


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

        if (!form.password)
            nextErrors.password = "Password is required.";

        if (!form.department_id)
            nextErrors.department_id =
                "Department is required.";

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

            await addUsers({
                salutation: form.salutation,
                person_id: personId,
                name: form.name.trim(),
                username: form.username.trim(),
                email: form.email.trim(),
                mobile_no: form.mobile_no.trim(),
                password: form.password,
                department_id: Number(form.department_id),
                roles: form.roles.map(Number),
                is_active: true,
            });
            toast.success("Role created successfully!");
            navigate("/admin/users-management");
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Failed to create user."
            );
            toast.error(
                error?.response?.data?.message ||
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

    return (
        <div className="w-full">
            <div className="mb-6 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#B8D9C8] bg-[#EEF8F2]">
                    <UserPlus
                        size={18}
                        strokeWidth={2}
                        className="text-[#17734C]"
                    />
                </span>

                <div>
                    <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-[#152C20]">
                        Add User
                    </h1>

                    <p className="mt-0.5 text-[11.5px] text-[#6C8679]">
                        Create a new user and assign access.
                    </p>
                </div>
            </div>

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
                    <Dropdown
                        label="Salutation"
                        icon={User}
                        value={form.salutation}
                        onChange={(value) =>
                            updateField("salutation", value)
                        }
                        options={[
                            "Mr.",
                            "Mrs.",
                            "Ms.",
                        ]}
                        placeholder="Select salutation"
                        error={errors.salutation}
                    />

                    <div>
                        <FieldLabel icon={UserRound}>
                            Person ID
                        </FieldLabel>

                        <input
                            type="text"
                            value={pidLoading ? "Generating..." : personId}
                            disabled
                            className={`${inputClass("person_id")} cursor-not-allowed bg-[#F1F6F3] text-[#557267]`}
                        />
                    </div>

                    <div>
                        <FieldLabel icon={User}>
                            Name
                        </FieldLabel>

                        <input
                            value={form.name}
                            onChange={(e) =>
                                updateField(
                                    "name",
                                    e.target.value
                                )
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

                    <div>
                        <FieldLabel icon={LockKeyhole}>
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
                            placeholder="Enter password"
                            className={inputClass("password")}
                        />

                        {errors.password && (
                            <p className="mt-1.5 text-[10.5px] font-medium text-[#C43D3D]">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <Dropdown
                        label="Department"
                        icon={Building2}
                        value={form.department_id}
                        onChange={(value) =>
                            updateField(
                                "department_id",
                                value
                            )
                        }
                        options={departmentOptions}
                        placeholder={
                            loadingData
                                ? "Loading departments..."
                                : "Select department"
                        }
                        error={errors.department_id}
                        disabled={loadingData}
                    />

                    <MultiSelectDropdown
                        label="Roles"
                        icon={ShieldCheck}
                        value={form.roles}
                        onChange={(value) =>
                            updateField("roles", value)
                        }
                        options={roleOptions}
                        placeholder={
                            loadingData
                                ? "Loading roles..."
                                : "Select roles"
                        }
                        error={errors.roles}
                        disabled={loadingData}
                    />
                </div>

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

                        {saving
                            ? "Creating..."
                            : "Create User"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddUser;