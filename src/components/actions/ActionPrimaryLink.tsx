// src/components/actions/ActionPrimaryLink.tsx
import { Link } from "react-router";
import type { ReactNode } from "react";

type ActionPrimaryLinkProps = {
  to: string;
  children: ReactNode;
  className?: string;
};

export function ActionPrimaryLink({ to, children, className }: ActionPrimaryLinkProps) {
  return (
    <Link
      to={to}
      className={[
        "inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium",
        "bg-blue-600 text-white hover:bg-blue-700",
        "focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
