// src/app/bootstrapSession.ts
import { getSession } from "@/services/sessionService";
import { clearAccessToken, getAccessToken } from "@/services/tokenStorage";
import { useSessionStore } from "@/stores/sessionSlice";

export async function bootstrapSession(): Promise<void> {
  const accessToken = getAccessToken();

  if (!accessToken) {
    useSessionStore.getState().resetSessionCache();
    return;
  }

  try {
    await getSession();
  } catch {
    clearAccessToken();
    useSessionStore.getState().resetSessionCache();
  }
}
