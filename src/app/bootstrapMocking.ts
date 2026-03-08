import { ENV } from "@/constants/env";

export async function bootstrapMocking() {
  if (ENV.API_MODE !== "mock") return;

  const { worker } = await import("@/mocks/browser");
  return worker.start();
}
