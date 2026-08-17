import React from "react";

const LogoMark = () => {
    return (
        <svg
            width="42"
            height="42"
            viewBox="0 0 42 42"
            fill="none"
        >
            <circle
                cx="21"
                cy="21"
                r="20"
                stroke="#0F3A63"
                strokeWidth="1.5"
                opacity="0.15"
            />

            <path
                d="M21 6 L21 16 M21 26 L21 36 M6 21 L16 21 M26 21 L36 21"
                stroke="#12A594"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.55"
            />

            <rect
                x="13"
                y="13"
                width="16"
                height="16"
                rx="4"
                fill="#0B2A4A"
            />

            <path
                d="M17 21 L20 24 L26 17"
                stroke="#2DD4C8"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    );
};

export default LogoMark;