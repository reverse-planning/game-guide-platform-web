// src/components/actions/ActionSecondaryLink.tsx
import { Link } from "react-router";
import type { ReactNode } from "react";

type ActionSecondaryLinkProps = {
  to: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};

export function ActionSecondaryLink({
  to,
  children,
  className,
  disabled = false,
}: ActionSecondaryLinkProps) {
  return (
    <Link
      to={disabled ? "#" : to}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      className={[
        "inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium",
        "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50",
        "focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white",
        disabled ? "pointer-events-none opacity-50" : "",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
