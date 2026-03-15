// src/components/gnb/GnbUserBadge.tsx
type GnbUserBadgeProps = {
  nickname: string;
};

export function GnbUserBadge({ nickname }: GnbUserBadgeProps) {
  return <span className="max-w-24 truncate text-sm text-zinc-700">{nickname}님</span>;
}
