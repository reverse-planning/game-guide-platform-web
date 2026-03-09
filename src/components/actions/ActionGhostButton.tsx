// src/components/actions/ActionGhostButton.tsx
import type { ReactNode } from "react";

type ActionGhostButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  className?: string;
};

export function ActionGhostButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  type = "button",
  className,
}: ActionGhostButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        "inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium",
        "border border-zinc-300 bg-white text-zinc-700",
        "hover:bg-zinc-100",
        "focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-white",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
