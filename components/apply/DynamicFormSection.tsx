"use client";

import type { ApplyFieldConfig, ApplyFormValues } from "../../types/apply";
import { groupFieldsForRows } from "../../lib/apply-form-utils";
import DynamicFieldRenderer from "./DynamicFieldRenderer";

type DynamicFormSectionProps = {
  fields: ApplyFieldConfig[];
  values: ApplyFormValues;
  setValue: (key: string, value: string) => void;
  inputStyle: React.CSSProperties;
  textareaStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
};

export default function DynamicFormSection({
  fields,
  values,
  setValue,
  inputStyle,
  textareaStyle,
  labelStyle,
}: DynamicFormSectionProps) {
  const rows = groupFieldsForRows(fields);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={row.length === 2 ? "twoCol" : undefined}
          style={row.length === 1 ? { display: "grid", gap: 16 } : undefined}
        >
          {row.map((field) => (
            <DynamicFieldRenderer
              key={field.key}
              field={field}
              value={values[field.key] || ""}
              onChange={setValue}
              inputStyle={inputStyle}
              textareaStyle={textareaStyle}
              labelStyle={labelStyle}
            />
          ))}
        </div>
      ))}
    </div>
  );
}