// src/components/actions/ActionDangerButton.tsx
import { UI_MESSAGE } from "@/constants/uiMessages";
import type { ReactNode } from "react";

type ActionDangerButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  form?: string;
  className?: string;
};

export function ActionDangerButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  type = "button",
  form,
  className,
}: ActionDangerButtonProps) {
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
        // ✅ danger는 solid로 존재감 확보
        "bg-red-600 text-white hover:bg-red-700",
        "focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-white",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className ?? "",
      ].join(" ")}
    >
      {loading ? UI_MESSAGE.SUBMITTING : children}
    </button>
  );
}
