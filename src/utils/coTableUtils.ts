export const isMergedCellValue = (value: unknown) => {
  if (value === -999998 || value === "-999998") return true;
  return typeof value === "string" && value.trim().toUpperCase() === "_MERGED_UP_";
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