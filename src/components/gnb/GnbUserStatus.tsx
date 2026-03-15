// src/components/gnb/GnbUserStatus.tsx
import { UI_STATUS_MESSAGE } from "@/constants/uiMessages";
import { ActionGhostButton } from "@/components/actions/ActionGhostButton";
import { GnbUserBadge } from "./GnbUserBadge";

type GnbUserStatusProps = {
  nickname: string;
  onLogout: () => void;
  isLoggingOut?: boolean;
};

export function GnbUserStatus({ nickname, onLogout, isLoggingOut }: GnbUserStatusProps) {
  return (
    <div className="flex items-center gap-3">
      <GnbUserBadge nickname={nickname} />
      <ActionGhostButton onClick={onLogout} disabled={isLoggingOut}>
        {isLoggingOut ? UI_STATUS_MESSAGE.LOGGING_OUT : "로그아웃"}
      </ActionGhostButton>
    </div>
  );
}
