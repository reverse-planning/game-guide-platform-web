// src/components/gnb/GnbAuthStatus.tsx
type Props = {
  isAuthed: boolean;
  nickname?: string | null;
};

export function GnbAuthStatus({ isAuthed, nickname }: Props) {
  return <>{isAuthed ? `${nickname}님` : "로그인을 해주세요"}</>;
}
