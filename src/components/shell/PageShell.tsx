// src/components/shell/PageShell.tsx
import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-zinc-50">{children}</div>;
}
