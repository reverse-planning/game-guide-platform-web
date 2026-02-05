// src/services/guideDetailService.ts
import axios from "axios";
import type { GuideItem } from "./guideListService";

export type GuideDetail = GuideItem & {
  content: string;
};

export async function getGuideDetail(guideId: number): Promise<GuideDetail> {
  const res = await axios.get<GuideDetail>(`/api/guides/${guideId}`);
  return res.data;
}
