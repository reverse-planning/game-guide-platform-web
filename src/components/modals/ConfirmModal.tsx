// src/components/modals/ConfirmModal.tsx
import { ActionDangerButton } from "@/components/actions/ActionDangerButton";
import { ActionGhostButton } from "@/components/actions/ActionGhostButton";
import { UI_STATUS_MESSAGE } from "@/constants/uiMessages";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  isConfirming = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby={description ? "confirm-modal-description" : undefined}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-modal-title" className="text-lg font-semibold text-zinc-900">
          {title}
        </h2>

        {description && (
          <p id="confirm-modal-description" className="mt-2 text-sm text-zinc-600">
            {description}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <ActionGhostButton onClick={onClose} disabled={isConfirming}>
            {cancelText}
          </ActionGhostButton>

          <ActionDangerButton onClick={onConfirm} disabled={isConfirming}>
            {isConfirming ? UI_STATUS_MESSAGE.DELETING : confirmText}
          </ActionDangerButton>
        </div>
      </div>
    </div>
  );
}
