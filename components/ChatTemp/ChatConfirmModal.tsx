"use client";

type ChatConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export default function ChatConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: ChatConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="aurosModalOverlay">
      <div className="aurosModalCard" style={{ maxWidth: 460 }}>
        <div className="aurosModalHeader">
          <div>
            <p className="aurosPanelOverline">
              {danger ? "DANGER ACTION" : "CONFIRM ACTION"}
            </p>
            <h3 className="aurosModalTitle">{title}</h3>
          </div>

          <button type="button" className="aurosModalClose" onClick={onCancel}>
            ×
          </button>
        </div>

        <p style={{ color: "#cfc6aa", lineHeight: 1.7, marginTop: 0 }}>
          {message}
        </p>

        <div className="aurosModalActions">
          <button type="button" className="aurosModalSecondary" onClick={onCancel}>
            {cancelLabel}
          </button>

          <button
            type="button"
            className="aurosModalPrimary"
            onClick={onConfirm}
            style={
              danger
                ? {
                    borderColor: "rgba(255,107,107,0.3)",
                    background:
                      "linear-gradient(180deg, rgba(255,107,107,0.26), rgba(127,29,29,0.22))",
                    color: "#ffd7d7",
                  }
                : undefined
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}