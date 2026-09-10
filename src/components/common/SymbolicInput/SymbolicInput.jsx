import React, { useEffect, useMemo, useState } from "react";
import { Input, Switch, Tree } from "antd";
import { DownOutlined } from "@ant-design/icons";

const UNIT_MASTER = [
  { discipline: "Pressure", units: ["Bar", "kg/cm²", "psi", "Mpa", "mBar", "mmHg", "mTorr", "InHg", "Torr", "mmWc", "Pa", "Kpa", "inWc", "cmWc"] },
  { discipline: "Temperature", units: ["°C"] },
  { discipline: "Relative Humidity", units: ["%RH"] },
  { discipline: "Velocity", units: ["fpm", "m/s", "cfm"] },
  { discipline: "Light intensity", units: ["Lumen", "Lux"] },
  { discipline: "Flow", units: ["gm/min", "ml/min", "LPM", "LPH", "m3/Hr"] },
  { discipline: "Conductivity", units: ["µS/cm", "mS/cm"] },
  { discipline: "pH", units: ["pH"] },
  { discipline: "Rotataion", units: ["rpm"] },
  { discipline: "Elecrical", units: ["mV", "V", "mA"] },
  { discipline: "Time", units: ["min", "1/100 sec", "Hr", "sec", "min:sec:1/100 sec", "Hr:min:sec:1/100 sec", "Hr:min"] },
  { discipline: "Level", units: ["mm", "Litres"] },
  { discipline: "Speed", units: ["mm/hr"] },
  { discipline: "distance", units: ["cm", "mm"] },
  { discipline: "Sound", units: ["dB"] },
  { discipline: "Frequency", units: ["Hz"] },
  { discipline: "Resistance", units: ["M Ω", "Ω", "m Ω", "K Ω"] },
  { discipline: "Concentration", units: ["mg/L", "μg/L", "ppm", "ppb"] },
  { discipline: "Weight", units: ["g", "mg", "Kg"] },
  { discipline: "UV", units: ["W/m²", "mW/cm²"] },
  { discipline: "Counter", units: ["counts"] },
  { discipline: "Particle count", units: ["μ", "μm"] },
  { discipline: "Gas analyser", units: ["%Vol", "% O2"] },
  { discipline: "Accuracy", units: ["±"] },
];

const normalizeValue = (value) => {
  if (value === undefined || value === null) return "";
  return String(value);
};

const parseValueAndUnit = (value) => {
  const text = normalizeValue(value).trim();
  if (!text) return { rawValue: "", discipline: "", unit: "" };
  const allUnits = UNIT_MASTER
    .flatMap((item) => item.units.map((unit) => ({ discipline: item.discipline, unit })))
    .sort((a, b) => b.unit.length - a.unit.length);
  const matched = allUnits.find(({ unit }) => text.endsWith(` ${unit}`) || text.endsWith(unit));
  if (!matched) return { rawValue: text, discipline: "", unit: "" };
  let rawValue = text;
  if (text.endsWith(` ${matched.unit}`)) rawValue = text.slice(0, -(` ${matched.unit}`).length).trim();
  else rawValue = text.slice(0, -matched.unit.length).trim();
  return { rawValue, discipline: matched.discipline, unit: matched.unit };
};

const SymbolicInput = ({
  value,
  onChange,
  defaultDiscipline = "",
  placeholder = "Enter value",
  disabled = false,
  className = "",
}) => {
  const initial = useMemo(() => parseValueAndUnit(value), [value]);
  const [rawValue, setRawValue] = useState(initial.rawValue);
  const [discipline, setDiscipline] = useState(initial.discipline || defaultDiscipline);
  const [unit, setUnit] = useState(initial.unit || "");
  const [symbolEnabled, setSymbolEnabled] = useState(Boolean(initial.unit));
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    const parsed = parseValueAndUnit(value);
    setRawValue(parsed.rawValue);
    if (parsed.unit) { setUnit(parsed.unit); setDiscipline(parsed.discipline); setSymbolEnabled(true); }
    else if (!value) setRawValue("");
  }, [value]);

  useEffect(() => {
    if (!unit && discipline) {
      const disciplineData = UNIT_MASTER.find((item) => item.discipline === discipline);
      if (disciplineData?.units?.length === 1) setUnit(disciplineData.units[0]);
    }
  }, [discipline, unit]);

  const combinedValue = useMemo(() => {
    const cleanValue = rawValue.trim();
    if (!cleanValue) return "";
    if (symbolEnabled && unit) return `${cleanValue} ${unit}`;
    return cleanValue;
  }, [rawValue, symbolEnabled, unit]);

  useEffect(() => {
    if (typeof onChange === "function") onChange(combinedValue);
  }, [combinedValue, onChange]);

  const treeData = UNIT_MASTER.map((item) => ({
    title: item.discipline,
    key: item.discipline,
    selectable: false,
    children: item.units.map((itemUnit) => ({
      title: itemUnit,
      key: `${item.discipline}__${itemUnit}`,
      isLeaf: true,
    })),
  }));

  const handleValueChange = (event) => setRawValue(event.target.value);
  const handleToggle = (checked) => {
    setSymbolEnabled(checked);
    if (checked) {
      setShowSelector(true);
      if (!unit && discipline) {
        const disciplineData = UNIT_MASTER.find((item) => item.discipline === discipline);
        if (disciplineData?.units?.length === 1) setUnit(disciplineData.units[0]);
      }
    } else {
      setShowSelector(false);
    }
  };
  const handleTreeSelect = (selectedKeys, info) => {
    if (!info?.node?.isLeaf) return;
    const selectedKey = selectedKeys?.[0];
    if (!selectedKey) return;
    const separatorIndex = selectedKey.indexOf("__");
    if (separatorIndex === -1) return;
    const selectedDiscipline = selectedKey.slice(0, separatorIndex);
    const selectedUnit = selectedKey.slice(separatorIndex + 2);
    setDiscipline(selectedDiscipline);
    setUnit(selectedUnit);
    setSymbolEnabled(true);
    setShowSelector(false);
  };
  const selectedTreeKeys = discipline && unit ? [`${discipline}__${unit}`] : [];

  return (
    <div className={`w-full ${className}`}>
      <div className="flex w-full items-center gap-3">
        <div className="relative w-full">
          <Input
            value={rawValue}
            onChange={handleValueChange}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full"
          />
          {symbolEnabled && unit && rawValue && (
            <span
              className="pointer-events-none absolute left-[12px] top-1/2 -translate-y-1/2 text-sm font-medium text-[#263B35]"
              style={{ left: `${Math.max(12, rawValue.length * 8 + 16)}px` }}
            >
              {unit}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm font-medium text-[#263B35]">Symbol</span>
          <Switch size="small" checked={symbolEnabled} onChange={handleToggle} disabled={disabled} />
        </div>
      </div>

      {symbolEnabled && showSelector && (
        <div className="mt-2 w-full rounded-lg border border-[#D9E2DE] bg-white p-2 shadow-sm">
          <div className="mb-2 flex items-center justify-between px-2">
            <div className="text-xs font-semibold text-[#6B7D76]">Select Discipline / Unit</div>
            <button
              type="button"
              onClick={() => setShowSelector(false)}
              disabled={disabled}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[#7B8983] transition hover:bg-[#F3F7F5] hover:text-[#263B35] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close symbol selector"
              title="Close"
            >
              ×
            </button>
          </div>
          <div className="max-h-[240px] overflow-y-auto">
            <Tree
              showLine
              switcherIcon={<DownOutlined />}
              treeData={treeData}
              selectedKeys={selectedTreeKeys}
              onSelect={handleTreeSelect}
            />
          </div>
        </div>
      )}

      {symbolEnabled && unit && !showSelector && (
        <button
          type="button"
          onClick={() => setShowSelector(true)}
          disabled={disabled}
          className="mt-2 rounded-md bg-[#F3F7F5] px-2 py-1 text-xs text-[#263B35] hover:bg-[#EAF1EE]"
        >
          {discipline} • {unit}
        </button>
      )}
    </div>
  );
};

export default SymbolicInput;