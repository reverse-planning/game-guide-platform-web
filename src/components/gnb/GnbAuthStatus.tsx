// src/components/gnb/GnbAuthStatus.tsx
type GnbAuthStatusProps = {
  isAuthed: boolean;
  nickname?: string | null;
};

export function GnbAuthStatus({ isAuthed, nickname }: GnbAuthStatusProps) {
  return <>{isAuthed ? `${nickname}님` : "로그인을 해주세요"}</>;
}
