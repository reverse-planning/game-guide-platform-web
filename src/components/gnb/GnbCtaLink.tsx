// src/components/gnb/GnbCtaLink.tsx
import { Link } from "react-router";
import type { ReactNode } from "react";

type Props = {
  to: string;
  children: ReactNode;
};

export function GnbCtaLink({ to, children }: Props) {
  return (
    <Link
      to={to}
      className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
    >
      {children}
    </Link>
  );
}
