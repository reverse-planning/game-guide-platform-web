import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { listGuides, ListGuidesError } from "@/services/guideListService";
import { useSessionView } from "@/stores/sessionSelectors";
import { LIST_GUIDES_ERROR_MESSAGE } from "@/constants/errorMessages";
import { HeaderShell } from "@/components/shell/HeaderShell";
import { GnbBrand } from "@/components/gnb/GnbBrand";
import { GnbSearch } from "@/components/gnb/GnbSearch";
import { GnbAuthStatus } from "@/components/gnb/GnbAuthStatus";
import { PageShell } from "@/components/shell/PageShell";
import type { GuideListItem } from "@/types/guide";
import { ActionPrimaryLink } from "@/components/actions/ActionPrimaryLink";

export default function GuideList() {
  const { isAuthed, sessionNickname } = useSessionView();

  const [query, setQuery] = useState("");
  const [items, setItems] = useState<GuideListItem[]>([]);
  const [page, setPage] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // ✅ 검색어 변경 시: 서버에서 0페이지부터 다시 로드
  useEffect(() => {
    let ignore = false;

    async function init() {
      setIsFetching(true);
      try {
        const data = await listGuides({ query, page: 0, size: 20 });
        if (ignore) return;

        setItems(data.items);
        setPage(0);
        setHasNext(data.nextPage !== null);
      } catch (err) {
        if (ignore) return;

        if (err instanceof ListGuidesError) {
          setErrorBanner(LIST_GUIDES_ERROR_MESSAGE[err.code]);
        } else {
          setErrorBanner(LIST_GUIDES_ERROR_MESSAGE.UNKNOWN);
        }

        setItems([]);
        setHasNext(false);
      } finally {
        if (!ignore) setIsFetching(false);
      }
    }

    init();
    return () => {
      ignore = true;
    };
  }, [query]);

  const loadMore = async () => {
    if (isFetching || !hasNext) return;

    setIsFetching(true);
    try {
      const nextPage = page + 1;
      const data = await listGuides({ query, page: nextPage, size: 20 });

      // 다음 페이지가 null이면 마지막
      setHasNext(data.nextPage !== null);
      setItems((prev) => [...prev, ...data.items]);
      setPage(nextPage);
    } catch (err) {
      if (err instanceof ListGuidesError) {
        setErrorBanner(LIST_GUIDES_ERROR_MESSAGE[err.code]);
      } else {
        setErrorBanner("추가 로드에 실패했습니다.");
      }
    } finally {
      setIsFetching(false);
    }
  };

  // ✅ 무한 스크롤: IntersectionObserver (관찰만, 데이터는 service가 담당)
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) loadMore();
      },
      { root: null, rootMargin: "200px", threshold: 0 },
    );

    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query, isFetching, hasNext]);

  return (
    <PageShell>
      <HeaderShell
        left={<GnbBrand />}
        center={
          <GnbSearch value={query} onChange={setQuery} placeholder="공략 검색 (제목/본문/게임)" />
        }
        right={<GnbAuthStatus isAuthed={isAuthed} nickname={sessionNickname} />}
      />

      <main className="mx-auto max-w-6xl p-4">
        {errorBanner && (
          <div className="mb-4 rounded-xl border bg-white p-3 text-sm text-red-600">
            {errorBanner}
          </div>
        )}

        {/* 상단 띠: 정렬/필터 + 글쓰기 버튼 */}
        <div className="mb-4 flex items-center justify-between rounded-xl border bg-white p-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">정렬/필터</span>
            <span className="text-xs text-zinc-500">(MVP: UI만 준비, 기능은 이후 티켓)</span>
          </div>

          <ActionPrimaryLink to="/guides/new">공략 등록</ActionPrimaryLink>
        </div>

        {/* 카드 그리드 (3열 기준) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <article
              key={it.id}
              className="group relative rounded-xl border bg-white p-4 shadow-sm transition hover:bg-zinc-50"
            >
              {/* 카드 전체 클릭용 overlay */}
              <Link
                to={`/guides/${it.id}`}
                aria-label={`${it.title} 상세로 이동`}
                className="absolute inset-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              />

              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="line-clamp-1 font-semibold text-zinc-900">{it.title}</h2>
                  <div className="mt-1 text-xs text-zinc-500">
                    {it.game} · {it.author}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-zinc-500">{it.updatedAt}</span>
              </div>

              <p className="relative mt-3 line-clamp-3 text-sm text-zinc-700">{it.excerpt}</p>

              <div className="relative mt-4 flex items-center justify-between text-xs text-zinc-500">
                <span>조회 1.2k</span>
                <span>수정: {it.updatedAt}</span>
              </div>
            </article>
          ))}
        </div>

        {/* 무한 스크롤 센티널 */}
        <div ref={sentinelRef} className="h-10" />

        {/* 로딩/끝 상태 */}
        <div className="py-6 text-center text-sm text-zinc-600">
          {isFetching && "불러오는 중..."}
          {!isFetching && !hasNext && "마지막 콘텐츠입니다."}
        </div>
      </main>
    </PageShell>
  );
}
