import React, { useEffect } from "react";
import { X } from "lucide-react";

const UserModal = ({
    isOpen,
    onClose,
    title = "Create Record",
    description,
    children,
    width = "max-w-[520px]",
}) => {
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="
                fixed inset-0 z-[100]
                flex items-center justify-center
                bg-[#17211C]/20
                px-4
                backdrop-blur-[3px]
            "
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className={`
                    ${width}
                    w-full
                    overflow-hidden
                    rounded-[16px]
                    border border-[#DCE2DE]
                    bg-white
                    shadow-[0_24px_70px_-28px_rgba(25,38,31,0.35)]
                    animate-user-modal
                `}
                role="dialog"
                aria-modal="true"
                aria-labelledby="user-modal-title"
                onMouseDown={(event) => event.stopPropagation()}
            >
                {/* HEADER */}
                <div
                    className="
                        flex items-start justify-between
                        border-b border-[#E8ECEA]
                        px-5 py-4
                    "
                >
                    <div className="min-w-0">
                        <h2
                            id="user-modal-title"
                            className="
                                text-[15px]
                                font-semibold
                                tracking-[-0.015em]
                                text-[#27322D]
                            "
                        >
                            {title}
                        </h2>

                        {description && (
                            <p
                                className="
                                    mt-1
                                    text-[11px]
                                    leading-relaxed
                                    text-[#7A8580]
                                "
                            >
                                {description}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className="
                            ml-4
                            flex h-7 w-7 shrink-0
                            items-center justify-center
                            rounded-[7px]
                            text-[#8A9590]
                            transition-all duration-200
                            hover:bg-[#F2F4F3]
                            hover:text-[#46534D]
                            active:scale-95
                        "
                    >
                        <X size={15} strokeWidth={1.8} />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="px-5 py-5">
                    {children}
                </div>
            </div>

            <style>{`
                @keyframes userModalIn {
                    0% {
                        opacity: 0;
                        transform: translateY(8px) scale(0.985);
                    }

                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .animate-user-modal {
                    animation: userModalIn 220ms
                        cubic-bezier(0.22, 1, 0.36, 1)
                        both;
                }

                @media (prefers-reduced-motion: reduce) {
                    .animate-user-modal {
                        animation: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default UserModal;