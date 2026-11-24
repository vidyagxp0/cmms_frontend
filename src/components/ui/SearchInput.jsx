import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SearchInput = ({ value, onChange, placeholder = "Search...", className = "", suggestions = [] }) => {
    const [isFocused, setIsFocused] = useState(false);

    // Filter suggestions based on input value
    const filteredSuggestions = value.trim()
        ? suggestions
              .filter((item) =>
                  item.toLowerCase().includes(value.toLowerCase())
              )
              .slice(0, 5)
        : [];

    const showSuggestions = isFocused && filteredSuggestions.length > 0;

    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`relative w-full max-w-xs ${className}`}
        >
            <div className="relative">
                <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA79B]"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="h-[46px] w-full rounded-[10px] border border-[#CBE3D6] bg-[#F9FCFA] pl-9 pr-10 text-[12.5px] text-[#152C20] outline-none transition-all placeholder:text-[#94A79E] focus:border-[#79B89A] focus:bg-white focus:shadow-[0_0_0_3px_rgba(31,138,95,0.07)]"
                />
                <AnimatePresence>
                    {value && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                            type="button"
                            onClick={() => onChange("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-5 w-5 rounded-full bg-[#EAF5EE] text-[#17734C] hover:bg-[#D6E8DE] transition-colors"
                        >
                            <X size={12} strokeWidth={2.2} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* SUGGESTIONS DROPDOWN */}
            <AnimatePresence>
                {showSuggestions && (
                    <motion.ul
                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 8, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 z-50 max-h-48 overflow-y-auto rounded-xl border border-[#E3ECE6] bg-white p-1.5 shadow-[0_12px_40px_-12px_rgba(21,50,32,0.15)] custom-scrollbar"
                    >
                        {filteredSuggestions.map((item, idx) => (
                            <li key={`${item}-${idx}`}>
                                <button
                                    type="button"
                                    onMouseDown={() => {
                                        onChange(item);
                                        setIsFocused(false);
                                    }}
                                    className="w-full rounded-[8px] px-3.5 py-2 text-left text-[12px] font-medium text-[#2E473B] transition-colors hover:bg-[#F1F9F4] hover:text-[#17734C]"
                                >
                                    {item}
                                </button>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SearchInput;
