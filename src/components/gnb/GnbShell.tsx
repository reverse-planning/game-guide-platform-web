// src/components/gnb/GnbShell.tsx
import type { ReactNode } from "react";

type Props = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
};

export function GnbShell({ left, center, right, className }: Props) {
  return (
    <header className={`sticky top-0 z-10 border-b bg-white ${className ?? ""}`}>
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-4">{left}</div>
        <div className="flex w-full max-w-xl items-center gap-2">{center}</div>
        <div className="shrink-0 text-sm text-zinc-600">{right}</div>
      </div>
    </header>
  );
}
