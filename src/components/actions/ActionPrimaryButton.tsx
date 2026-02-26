// src/components/actions/ActionPrimaryButton.tsx
import { UI_MESSAGE } from "@/constants/uiMessages";
import type { ReactNode } from "react";

type ActionPrimaryButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  form?: string;
  className?: string;
};

export function ActionPrimaryButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  type = "button",
  form,
  className,
}: ActionPrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      form={form}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        "inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium",
        "bg-blue-600 text-white hover:bg-blue-700",
        "focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className ?? "",
      ].join(" ")}
    >
      {loading ? UI_MESSAGE.SUBMITTING : children}
    </button>
  );
}
