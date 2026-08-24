import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import useDebounce from "../../../hooks/useDebounce";

const SearchInput = ({
    value,
    onChange,
    suggestions = [],
    placeholder = "Search...",
    className = "",
    maxWidth = "320px",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Debounce value internally for matching suggestions
    const debouncedValue = useDebounce(value, 200);

    const filteredSuggestions = React.useMemo(() => {
        if (!debouncedValue.trim()) return [];
        const query = debouncedValue.toLowerCase();
        // Return suggestions that match but aren't exact equal (to avoid suggesting what's already typed fully)
        return suggestions.filter((item) =>
            item.toLowerCase().includes(query) && item.toLowerCase() !== query
        );
    }, [suggestions, debouncedValue]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className={`relative w-full mb-4 ${className}`} style={{ maxWidth }}>
            <div className="relative">
                <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA79B]"
                />

                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="h-[42px] w-full rounded-[10px] border border-[#CBE3D6] bg-[#F9FCFA] pl-9 pr-9 text-[12px] text-[#152C20] outline-none transition-all placeholder:text-[#94A79E] focus:border-[#79B89A] focus:bg-white focus:ring-2 focus:ring-[#1F8A5F]/[0.07]"
                />

                {value && (
                    <button
                        type="button"
                        onClick={() => {
                            onChange("");
                            setIsOpen(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A79E] hover:text-[#5C7A6C]"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {isOpen && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-[200px] overflow-y-auto rounded-lg border border-[#CBE3D6] bg-white p-1 shadow-[0_10px_25px_-10px_rgba(21,44,32,0.25)]">
                    {filteredSuggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => {
                                onChange(suggestion);
                                setIsOpen(false);
                            }}
                            className="w-full rounded-md px-3 py-2 text-left text-[12px] text-[#152C20] hover:bg-[#F5FAF7] hover:text-[#17734C] transition-colors"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchInput;
