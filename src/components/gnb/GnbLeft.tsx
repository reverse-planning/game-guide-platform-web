// src/components/gnb/GnbLeft.tsx
import { Link } from "react-router";

export function GnbLeft() {
  return (
    <>
      <Link to="/guides" className="text-lg font-semibold">
        Game Guide
      </Link>
    </>
  );
}
