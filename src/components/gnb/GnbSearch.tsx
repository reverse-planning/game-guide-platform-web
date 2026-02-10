// src/components/gnb/GnbSearch.tsx
type Props = {
  value: string;
  onChange: (v: string) => void;
  onClear?: () => void;
  placeholder?: string;
};

export function GnbSearch({ value, onChange, onClear, placeholder = "검색" }: Props) {
  return (
    <div className="relative w-full">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
      />

      {!!value && (
        <button
          type="button"
          onClick={() => (onClear ? onClear() : onChange(""))}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100"
          aria-label="검색어 지우기"
        >
          ✕
        </button>
      )}
    </div>
  );
}
