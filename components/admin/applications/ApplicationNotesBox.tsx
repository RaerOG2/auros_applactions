"use client";

import { textareaStyle, primaryButtonStyle } from "../../../lib/admin-styles";

type ApplicationNotesBoxProps = {
  value?: string;
  controlled?: boolean;
  onChange?: (value: string) => void;
  onBlurSave?: (value: string) => void;
  onSaveClick?: () => void;
};

export default function ApplicationNotesBox({
  value = "",
  controlled = false,
  onChange,
  onBlurSave,
  onSaveClick,
}: ApplicationNotesBoxProps) {
  return (
    <div
      style={{
        padding: "14px",
        borderRadius: "14px",
        background: "#081225",
        border: "1px solid #22304d",
      }}
    >
      <strong>Internal Admin Notes</strong>

      {controlled ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Add internal notes for this application..."
          style={{
            ...textareaStyle,
            minHeight: 120,
            marginTop: 10,
          }}
        />
      ) : (
        <textarea
          defaultValue={value}
          placeholder="Add internal notes for this application..."
          style={{
            ...textareaStyle,
            minHeight: 120,
            marginTop: 10,
          }}
          onBlur={(e) => onBlurSave?.(e.target.value)}
        />
      )}

      {controlled && onSaveClick ? (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <button onClick={onSaveClick} style={primaryButtonStyle}>
            Save Notes
          </button>
        </div>
      ) : null}
    </div>
  );
}