import axios from "axios";

export type GuideItem = {
  id: number;
  title: string;
  excerpt: string;
  game: string;
  author: string;
  updatedAt: string;
};

export type ListGuidesResponse = {
  items: GuideItem[];
  nextPage: number | null;
};
export async function listGuides(params: { q: string; page: number }): Promise<ListGuidesResponse> {
  const res = await axios.get<ListGuidesResponse>("/api/guides", {
    params: { q: params.q, page: params.page },
  });
  return res.data;
}
