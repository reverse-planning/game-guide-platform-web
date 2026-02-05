import { guideCreateHandlers } from "./guideCreate";
import { guideDeleteHandlers } from "./guideDelete";
import { guideDetailHandlers } from "./guideDetail";
import { guideListHandlers } from "./guideList";
import { guideUpdateHandlers } from "./guideUpdate";
import { sessionHandlers } from "./session";

export const handlers = [
  ...sessionHandlers,
  ...guideListHandlers,
  ...guideDetailHandlers,
  ...guideCreateHandlers,
  ...guideUpdateHandlers,
  ...guideDeleteHandlers,
];
