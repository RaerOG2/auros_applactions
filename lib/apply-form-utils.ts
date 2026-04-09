import type { ApplyFieldConfig } from "../types/apply";

export function groupFieldsForRows(fields: ApplyFieldConfig[]) {
  const rows: ApplyFieldConfig[][] = [];
  let currentRow: ApplyFieldConfig[] = [];

  for (const field of fields) {
    const width = field.width || "full";

    if (width === "full") {
      if (currentRow.length > 0) {
        rows.push(currentRow);
        currentRow = [];
      }
      rows.push([field]);
      continue;
    }

    currentRow.push(field);

    if (currentRow.length === 2) {
      rows.push(currentRow);
      currentRow = [];
    }
  }

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
}