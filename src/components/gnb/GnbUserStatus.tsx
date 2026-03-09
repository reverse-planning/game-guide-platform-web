// src/components/gnb/GnbUserStatus.tsx
import { UI_MESSAGE } from "@/constants/uiMessages";
import { ActionGhostButton } from "@/components/actions/ActionGhostButton";

type GnbUserStatusProps = {
  nickname: string;
  onLogout: () => void;
  isLoggingOut?: boolean;
};

export function GnbUserStatus({ nickname, onLogout, isLoggingOut }: GnbUserStatusProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-zinc-700">{nickname}님</span>

      <ActionGhostButton onClick={onLogout} disabled={isLoggingOut}>
        {isLoggingOut ? UI_MESSAGE.LOGGING_OUT : "로그아웃"}
      </ActionGhostButton>
    </div>
  );
}
