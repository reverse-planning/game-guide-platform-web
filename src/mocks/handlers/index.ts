import { guideCreateHandlers } from "./guideCreate";
import { guideDetailHandlers } from "./guideDetail";
import { guideListHandlers } from "./guideList";
import { sessionHandlers } from "./session";

export const handlers = [
  ...sessionHandlers,
  ...guideListHandlers,
  ...guideDetailHandlers,
  ...guideCreateHandlers,
];
