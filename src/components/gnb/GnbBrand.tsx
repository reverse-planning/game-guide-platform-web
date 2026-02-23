// src/components/gnb/GnbBrand.tsx
import { Link } from "react-router";

export function GnbBrand() {
  return (
    <>
      <Link to="/guides" className="text-lg font-semibold">
        Game Guide
      </Link>
    </>
  );
}
