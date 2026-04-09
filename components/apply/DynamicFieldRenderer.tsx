"use client";

import type { ApplyFieldConfig } from "../../types/apply";

type DynamicFieldRendererProps = {
  field: ApplyFieldConfig;
  value: string;
  onChange: (key: string, value: string) => void;
  inputStyle: React.CSSProperties;
  textareaStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
};

export default function DynamicFieldRenderer({
  field,
  value,
  onChange,
  inputStyle,
  textareaStyle,
  labelStyle,
}: DynamicFieldRendererProps) {
  return (
    <div>
      <label style={labelStyle}>
        {field.label}
        {field.required ? " *" : ""}
      </label>

      {field.description ? (
        <p
          style={{
            marginTop: 0,
            marginBottom: 8,
            color: "#9fb0d0",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {field.description}
        </p>
      ) : null}

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
      ) : field.type === "select" ? (
        <select
          style={inputStyle}
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
        >
          <option value="" style={{ background: "#0b152b", color: "white" }}>
            Select an option
          </option>

          {(field.options ?? []).map((option) => (
            <option
              key={option.value}
              value={option.value}
              style={{ background: "#0b152b", color: "white" }}
            >
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type === "url" ? "url" : "text"}
          style={inputStyle}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      )}
    </div>
  );
}