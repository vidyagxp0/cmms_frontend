
import * as XLSX from "xlsx";

export const normalizeHeader = (value) =>
  String(value ?? "")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[’‘]/g, "'")
    .trim()
    .toLowerCase();

export const formatBytes = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export async function parseExcelFile(file, requiredHeaders, masterKey) {
  if (!file) {
    throw new Error("Please choose an Excel file.");
  }

  if (!/\.(xlsx|xls)$/i.test(file.name)) {
    throw new Error("Only .xlsx and .xls Excel files are supported.");
  }

  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: true,
  });

  const sheetName = workbook.SheetNames?.[0];

  if (!sheetName) {
    throw new Error("No worksheet was found in this file.");
  }

  const matrix = XLSX.utils.sheet_to_json(
    workbook.Sheets[sheetName],
    {
      header: 1,
      defval: "",
      raw: false,
      blankrows: false,
    }
  );

  if (
    !matrix.length ||
    !matrix[0]?.some((cell) => String(cell ?? "").trim())
  ) {
    throw new Error(
      "The first worksheet is empty or has no header row."
    );
  }

  const headers = matrix[0].map((cell) =>
    String(cell ?? "").trim()
  );

  const normalizedHeaders = headers.map(normalizeHeader);

  const missingHeaders = requiredHeaders.filter(
    (requiredHeader) =>
      !normalizedHeaders.includes(normalizeHeader(requiredHeader))
  );

  if (missingHeaders.length) {
    throw new Error(
      `Missing required columns: ${missingHeaders.join(", ")}. ` +
        "Use the correct template and keep its headers unchanged."
    );
  }

  const rows = matrix
    .slice(1)
    .map((row, index) => ({
      row,
      excelRow: index + 2,
    }))
    .filter(({ row }) =>
      row.some((value) => String(value ?? "").trim() !== "")
    )
    .map(({ row, excelRow }, index) => {
      const record = {
        key: `${masterKey}-${index + 1}`,
        _excelRow: excelRow,
      };

      headers.forEach((header, columnIndex) => {
        const columnName =
          header || `Column ${columnIndex + 1}`;

        record[columnName] = row[columnIndex] ?? "";
      });

      return record;
    });

  if (!rows.length) {
    throw new Error(
      "No data records were found below the header row."
    );
  }

  return {
    headers,
    rows,
    sheetName,
  };
}

export function validateRequiredCells(rows, requiredFields) {
  const issues = [];

  rows.forEach((row) => {
    requiredFields.forEach((field) => {
      const matchingHeader = Object.keys(row).find(
        (candidate) =>
          normalizeHeader(candidate) === normalizeHeader(field)
      );

      if (
        !matchingHeader ||
        String(row[matchingHeader] ?? "").trim() === ""
      ) {
        issues.push({
          row: row._excelRow,
          field,
        });
      }
    });
  });

  return issues;
}
