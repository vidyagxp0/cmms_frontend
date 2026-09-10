import React from "react";

/**
 * Reusable CustomScrollContainer component
 * Wraps elements in a scrollable div with sleek teal/slate custom scrollbar styling.
 *
 * Props:
 * - direction: "vertical" | "horizontal" | "both" (default: "vertical")
 * - height: CSS height (default: "100%")
 * - maxHeight: optional CSS max-height
 * - scrollRef: React ref object for the scroll container
 * - className: additional Tailwind or CSS class names
 * - children: wrapped content
 */
const CustomScrollContainer = ({
    children,
    className = "",
    direction = "vertical",
    height = "100%",
    maxHeight,
    scrollRef,
    style = {},
    ...props
}) => {
    let overflowClass = "overflow-y-auto overflow-x-hidden";
    if (direction === "horizontal") {
        overflowClass = "overflow-x-auto overflow-y-hidden";
    } else if (direction === "both") {
        overflowClass = "overflow-auto";
    }

    return (
        <div
            ref={scrollRef}
            style={{
                height,
                maxHeight,
                ...style,
            }}
            className={`custom-scrollbar ${overflowClass} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default CustomScrollContainer;
