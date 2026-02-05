import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { listGuides, ListGuidesError, type GuideItem } from "@/services/guideListService";
import { useSessionView } from "@/stores/sessionSelectors";
import { LIST_GUIDES_ERROR_MESSAGE } from "@/constants/errorMessages";

export default function GuideList() {
  const { sessionNickname } = useSessionView();

  const [query, setQuery] = useState("");
  const [items, setItems] = useState<GuideItem[]>([]);
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
        const data = await listGuides({ q: query, page: 0 });
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
      const data = await listGuides({ q: query, page: nextPage });

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

  const headerRightText = useMemo(() => {
    return sessionNickname ? `${sessionNickname}님` : "로그인을 해주세요";
  }, [sessionNickname]);

  return (
    <div className="min-h-dvh bg-zinc-50">
      {/* GNB + Search */}
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-lg font-semibold">
              Game Guide
            </Link>
            <Link to="/guides" className="text-sm text-zinc-700 hover:underline">
              공략글
            </Link>
          </div>

          <div className="flex w-full max-w-xl items-center gap-2">
            <div className="relative w-full">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="공략 검색 (제목/본문/게임)"
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100"
                  aria-label="검색어 지우기"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="shrink-0 text-sm text-zinc-600">{headerRightText}</div>
        </div>
      </header>

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

          <Link
            to="/guides/new"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            공략 등록
          </Link>
        </div>

        {/* 카드 그리드 (3열 기준) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <article key={it.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="line-clamp-1 font-semibold">
                    <Link to={`/guides/${it.id}`} className="hover:underline">
                      {it.title}
                    </Link>
                  </h2>
                  <div className="mt-1 text-xs text-zinc-500">
                    {it.game} · {it.author}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-zinc-500">{it.updatedAt}</span>
              </div>

              <p className="mt-3 line-clamp-3 text-sm text-zinc-700">{it.excerpt}</p>

              <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
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
    </div>
  );
}
