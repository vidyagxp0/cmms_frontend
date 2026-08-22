import React, { useState } from "react";

import DashboardActionBar from "../../../components/common/DashboardActionBar/DashboardActionBar";

import UserModal from "../../../components/common/UserModal/UserModal";

const EquipDashboard = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        equipmentId: "",
        make: "",
        modal: "",
        equipmentType: "",
    });

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreateRecord = (event) => {
        event.preventDefault();

        console.log("Equipment Record:", formData);

        // API will be integrated here later.

        setShowCreateModal(false);
    };

    return (
        <div className="min-h-screen bg-[#F7F9F8]">

            {/* FIXED ACTION BAR */}
            <DashboardActionBar
                title="Equipment Dashboard"
                onCreate={() => setShowCreateModal(true)}
            />

            {/* DASHBOARD CONTENT */}
            <main className="pt-[192px]">
                <div className="p-6">
                    {/* Equipment dashboard content goes here */}
                </div>
            </main>

            {/* CREATE EQUIPMENT MODAL */}
            <UserModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create Equipment Record"
                width="max-w-[540px]"
            >
                <form
                    onSubmit={handleCreateRecord}
                    className="space-y-4"
                >

                    {/* NAME */}
                    <div>
                        <label
                            htmlFor="name"
                            className="
                                mb-1.5 block
                                text-[11.5px]
                                font-semibold
                                text-[#4A5750]
                            "
                        >
                            Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter equipment name"
                            className="
                                h-[39px] w-full
                                rounded-[8px]
                                border border-[#D9DFDC]
                                bg-white
                                px-3
                                text-[12px]
                                text-[#303A35]
                                outline-none
                                transition-all duration-200
                                placeholder:text-[#A1AAA5]
                                hover:border-[#C5CDC8]
                                focus:border-[#8D9993]
                                focus:ring-2
                                focus:ring-[#EEF1EF]
                            "
                        />
                    </div>

                    {/* EQUIPMENT ID */}
                    <div>
                        <label
                            htmlFor="equipmentId"
                            className="
                                mb-1.5 block
                                text-[11.5px]
                                font-semibold
                                text-[#4A5750]
                            "
                        >
                            Equipment ID
                        </label>

                        <input
                            id="equipmentId"
                            name="equipmentId"
                            type="text"
                            value={formData.equipmentId}
                            onChange={handleChange}
                            placeholder="Enter equipment ID"
                            className="
                                h-[39px] w-full
                                rounded-[8px]
                                border border-[#D9DFDC]
                                bg-white
                                px-3
                                text-[12px]
                                text-[#303A35]
                                outline-none
                                transition-all duration-200
                                placeholder:text-[#A1AAA5]
                                hover:border-[#C5CDC8]
                                focus:border-[#8D9993]
                                focus:ring-2
                                focus:ring-[#EEF1EF]
                            "
                        />
                    </div>

                    {/* MAKE + MODEL */}
                    <div className="grid grid-cols-2 gap-3">

                        <div>
                            <label
                                htmlFor="make"
                                className="
                                    mb-1.5 block
                                    text-[11.5px]
                                    font-semibold
                                    text-[#4A5750]
                                "
                            >
                                Make
                            </label>

                            <input
                                id="make"
                                name="make"
                                type="text"
                                value={formData.make}
                                onChange={handleChange}
                                placeholder="Enter make"
                                className="
                                    h-[39px] w-full
                                    rounded-[8px]
                                    border border-[#D9DFDC]
                                    bg-white
                                    px-3
                                    text-[12px]
                                    text-[#303A35]
                                    outline-none
                                    transition-all duration-200
                                    placeholder:text-[#A1AAA5]
                                    hover:border-[#C5CDC8]
                                    focus:border-[#8D9993]
                                    focus:ring-2
                                    focus:ring-[#EEF1EF]
                                "
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="modal"
                                className="
                                    mb-1.5 block
                                    text-[11.5px]
                                    font-semibold
                                    text-[#4A5750]
                                "
                            >
                                Model
                            </label>

                            <input
                                id="modal"
                                name="modal"
                                type="text"
                                value={formData.modal}
                                onChange={handleChange}
                                placeholder="Enter model"
                                className="
                                    h-[39px] w-full
                                    rounded-[8px]
                                    border border-[#D9DFDC]
                                    bg-white
                                    px-3
                                    text-[12px]
                                    text-[#303A35]
                                    outline-none
                                    transition-all duration-200
                                    placeholder:text-[#A1AAA5]
                                    hover:border-[#C5CDC8]
                                    focus:border-[#8D9993]
                                    focus:ring-2
                                    focus:ring-[#EEF1EF]
                                "
                            />
                        </div>

                    </div>

                    {/* EQUIPMENT TYPE */}
                    <div>
                        <label
                            htmlFor="equipmentType"
                            className="
                                mb-1.5 block
                                text-[11.5px]
                                font-semibold
                                text-[#4A5750]
                            "
                        >
                            Equipment Type
                        </label>

                        <input
                            id="equipmentType"
                            name="equipmentType"
                            type="text"
                            value={formData.equipmentType}
                            onChange={handleChange}
                            placeholder="Enter equipment type"
                            className="
                                h-[39px] w-full
                                rounded-[8px]
                                border border-[#D9DFDC]
                                bg-white
                                px-3
                                text-[12px]
                                text-[#303A35]
                                outline-none
                                transition-all duration-200
                                placeholder:text-[#A1AAA5]
                                hover:border-[#C5CDC8]
                                focus:border-[#8D9993]
                                focus:ring-2
                                focus:ring-[#EEF1EF]
                            "
                        />
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div
                        className="
                            flex items-center justify-end
                            gap-2
                            border-t border-[#E9ECEA]
                            pt-4
                        "
                    >
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="
                                h-[35px]
                                rounded-[8px]
                                border border-[#D9DFDC]
                                bg-white
                                px-3.5
                                text-[11.5px]
                                font-medium
                                text-[#66726B]
                                transition-all duration-200
                                hover:border-[#C5CDC8]
                                hover:bg-[#F8F9F8]
                                hover:text-[#3E4943]
                                active:scale-[0.98]
                            "
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="
                                h-[35px]
                                rounded-[8px]
                                border border-[#303A35]
                                bg-[#303A35]
                                px-4
                                text-[11.5px]
                                font-semibold
                                text-white
                                shadow-[0_4px_12px_-7px_rgba(30,40,35,0.45)]
                                transition-all duration-200
                                hover:-translate-y-[1px]
                                hover:bg-[#252E2A]
                                hover:shadow-[0_7px_16px_-8px_rgba(30,40,35,0.5)]
                                active:translate-y-0
                                active:scale-[0.98]
                            "
                        >
                            Create Record
                        </button>
                    </div>
                </form>
            </UserModal>
        </div>
    );
};

export default EquipDashboard;