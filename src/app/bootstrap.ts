import { bootstrapMocking } from "./bootstrapMocking";
import { bootstrapSession } from "./bootstrapSession";

export async function bootstrap() {
  try {
    await bootstrapMocking();
  } catch (error) {
    console.warn("[MSW] Failed to start:", error);
  }

  try {
    await bootstrapSession();
  } catch (error) {
    console.warn("[bootstrapSession] Failed:", error);
  }
}
