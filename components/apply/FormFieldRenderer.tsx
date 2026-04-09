"use client";

import type { ApplyFieldConfig } from "../../types/apply";

type FormFieldRendererProps = {
  field: ApplyFieldConfig;
  value: string;
  onChange: (key: string, value: string) => void;
  inputStyle: React.CSSProperties;
  textareaStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
};

export default function FormFieldRenderer({
  field,
  value,
  onChange,
  inputStyle,
  textareaStyle,
  labelStyle,
}: FormFieldRendererProps) {
  return (
    <div>
      <label style={labelStyle}>
        {field.label}
        {field.required ? " *" : ""}
      </label>

      {field.type === "textarea" ? (
        <textarea
          style={{
            ...textareaStyle,
            minHeight: field.minHeight ?? 120,
          }}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      ) : (
        <input
          style={inputStyle}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      )}
    </div>
  );
}