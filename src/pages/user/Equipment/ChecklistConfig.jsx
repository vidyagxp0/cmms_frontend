import React from "react";
import { Plus, X, Trash2 } from "lucide-react";
import SectionHeader from "../../../components/common/SectionHeader/SectionHeader";


const ChecklistConfiguration = ({
  value = [],
  onChange,
  description = "Define categorical inspection checkpoints for the field engineers.",
  disabled = false,
  className = "",
}) => {
  // ─── Category handlers ──────────────────────────────────────────────
  const addCategory = () => {
    const newCategory = {
      id: Date.now().toString(),
      name: "",
      checkpoints: [],
    };
    onChange([...value, newCategory]);
  };

  const deleteCategory = (catId) => {
    onChange(value.filter((cat) => cat.id !== catId));
  };

  const updateCategoryName = (catId, newName) => {
    onChange(
      value.map((cat) =>
        cat.id === catId ? { ...cat, name: newName } : cat
      )
    );
  };

  // ─── Checkpoint handlers ────────────────────────────────────────────
  const addCheckpoint = (catId) => {
    onChange(
      value.map((cat) =>
        cat.id === catId
          ? {
              ...cat,
              checkpoints: [...cat.checkpoints, { id: Date.now().toString(), text: "" }],
            }
          : cat
      )
    );
  };

  const deleteCheckpoint = (catId, cpId) => {
    onChange(
      value.map((cat) =>
        cat.id === catId
          ? {
              ...cat,
              checkpoints: cat.checkpoints.filter((cp) => cp.id !== cpId),
            }
          : cat
      )
    );
  };

  const updateCheckpointText = (catId, cpId, newText) => {
    onChange(
      value.map((cat) =>
        cat.id === catId
          ? {
              ...cat,
              checkpoints: cat.checkpoints.map((cp) =>
                cp.id === cpId ? { ...cp, text: newText } : cp
              ),
            }
          : cat
      )
    );
  };

  return (
    <div className={`mt-10 ${className}`}>
      <SectionHeader title="CHECKLIST CONFIGURATION" />

      <div className="rounded-xl border border-[#DCE8E2] bg-white p-6 shadow-[0_3px_14px_rgba(21,44,32,0.04)]">
        {/* Header / description */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[13px] text-[#7B8983]">{description}</p>
          <button
            type="button"
            onClick={addCategory}
            disabled={disabled}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-[#2B5577] px-4 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(43,85,119,0.20)] transition-all duration-200 hover:bg-[#234766] hover:shadow-[0_7px_16px_rgba(43,85,119,0.25)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={14} strokeWidth={2.5} />
            Add Category
          </button>
        </div>

        {/* Empty state */}
        {value.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#DCE8E2] bg-[#F9FAFB] py-12">
            <div className="mb-2 rounded-full bg-[#EEF3F1] p-3">
              <Plus size={20} className="text-[#8A9992]" />
            </div>
            <p className="text-[13px] font-medium text-[#8A9992]">
              No categories yet
            </p>
            <p className="mt-0.5 text-[12px] text-[#A8B7B0]">
              Click "Add Category" to start building your checklist.
            </p>
          </div>
        )}

        {/* Categories list */}
        {value.length > 0 && (
          <div className="space-y-5">
            {value.map((category) => (
              <div
                key={category.id}
                className="overflow-hidden rounded-xl border border-[#E5EAE8] bg-[#FAFCFB] transition-all hover:border-[#D0DCD6]"
              >
                {/* Category header */}
                <div className="flex items-center gap-3 border-b border-[#E5EAE8] bg-white px-4 py-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => updateCategoryName(category.id, e.target.value)}
                      placeholder="Category Name (e.g. Electrical Safety)"
                      disabled={disabled}
                      className="w-full border-none bg-transparent text-[14px] font-semibold text-[#263B35] placeholder-[#9AA6A1] outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteCategory(category.id)}
                    disabled={disabled}
                    className="rounded-lg p-1.5 text-[#9AA6A1] transition-colors hover:bg-[#FFF1F1] hover:text-[#DF5B5B] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Delete category"
                  >
                    <Trash2 size={16} strokeWidth={1.8} />
                  </button>
                </div>

                {/* Checkpoints */}
                <div className="p-4">
                  {category.checkpoints.length === 0 ? (
                    <p className="py-2 text-center text-[12px] text-[#9AA6A1]">
                      No checkpoints defined. Click "Add Checkpoint" below.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {category.checkpoints.map((cp, index) => (
                        <div
                          key={cp.id}
                          className="flex items-center gap-3 rounded-lg bg-white p-1.5 pl-3 shadow-sm ring-1 ring-[#E5EAE8] transition-all hover:ring-[#CCD8D3]"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EDF2F0] text-[10px] font-bold text-[#60716A]">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={cp.text}
                            onChange={(e) =>
                              updateCheckpointText(category.id, cp.id, e.target.value)
                            }
                            placeholder="Describe the inspection step..."
                            disabled={disabled}
                            className="flex-1 border-none bg-transparent py-1.5 text-[13px] text-[#263B35] placeholder-[#9AA6A1] outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
                          />
                          <button
                            type="button"
                            onClick={() => deleteCheckpoint(category.id, cp.id)}
                            disabled={disabled}
                            className="rounded-lg p-1.5 text-[#9AA6A1] transition-colors hover:bg-[#FFF1F1] hover:text-[#DF5B5B] disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Delete checkpoint"
                          >
                            <X size={14} strokeWidth={1.8} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add checkpoint button */}
                  <button
                    type="button"
                    onClick={() => addCheckpoint(category.id)}
                    disabled={disabled}
                    className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-[#4E7585] transition-colors hover:text-[#2B5577] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    Add Checkpoint
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChecklistConfiguration;