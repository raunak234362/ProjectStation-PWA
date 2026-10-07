export const isMergedCellValue = (value: unknown) => {
  if (value === 0 || value === "0") return true;
  if (typeof value === "number") return value === -999999 || value === -999998;
  if (typeof value !== "string") return false;

  const normalized = value.trim().toUpperCase();
  return normalized === "_MERGED_LEFT_" || normalized === "_MERGED_UP_" || normalized === "-999999" || normalized === "-999998";
};

export const getCOTableRowSpan = (rows: any[], rowIndex: number, field: string) => {
  let rowSpan = 1;

  while (rows[rowIndex + rowSpan] && isMergedCellValue(rows[rowIndex + rowSpan][field])) {
    rowSpan += 1;
  }

  return rowSpan;
};

export const normalizeCOTableRows = (rows: any[]) => {
  return rows.map((row, rowIndex) => {
    if (rowIndex === 0) return { ...row };

    const previousRow = rows[rowIndex - 1];
    const normalizedRow = { ...row };

    Object.keys(normalizedRow).forEach((field) => {
      if (isMergedCellValue(normalizedRow[field]) && previousRow[field] !== undefined) {
        normalizedRow[field] = previousRow[field];
      }
    });

    return normalizedRow;
  });
};