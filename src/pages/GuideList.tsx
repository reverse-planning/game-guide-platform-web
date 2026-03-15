import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { listGuides, ListGuidesError } from "@/services/guideListService";
import { useSessionView } from "@/stores/sessionSelectors";
import { LIST_GUIDES_ERROR_MESSAGE } from "@/constants/errorMessages";
import { HeaderShell } from "@/components/shell/HeaderShell";
import { GnbBrand } from "@/components/gnb/GnbBrand";
import { GnbSearch } from "@/components/gnb/GnbSearch";
import { GnbUserStatus } from "@/components/gnb/GnbUserStatus";
import { PageShell } from "@/components/shell/PageShell";
import type { GuideListItem, GuideListSort } from "@/types/guide";
import { ActionPrimaryLink } from "@/components/actions/ActionPrimaryLink";
import { GAMES, type GameName } from "@/constants/games";
import { UI_RESULT_MESSAGE, UI_STATUS_MESSAGE } from "@/constants/uiMessages";
import { formatDateToMinute } from "@/utils/formatDate";
import { AppError } from "@/services/apiClient";
import { AuthRequiredError } from "@/services/authErrors";
import { buildLoginUrl } from "@/routes/utils/buildLoginUrl";
import { APP_ERROR_MESSAGE } from "@/constants/appErrorMessages";
import { deleteSession } from "@/services/sessionService";
import { useAppMessageStore } from "@/stores/appMessageSlice";
import { APP_MESSAGE_SOURCE, APP_MESSAGE_TYPE } from "@/constants/appMessage";
import { ResponseShapeError } from "@/services/responseErrors";
import { RESPONSE_SHAPE_ERROR_MESSAGE } from "@/constants/responseErrorMessages";
import type { GuideId } from "@/types/id";

type InitialLoadState = "idle" | "loading" | "success" | "error";
type LoadMorePhase = "idle" | "loading";
type LogoutPhase = "idle" | "submitting";

const PAGE_SIZE = 20;
const DEFAULT_SORT: GuideListSort = "updatedAt,desc";
const ROOT_MARGIN = "200px";
const DEBOUNCE_MS = 250;

const SORT_OPTIONS: Array<{ label: string; value: GuideListSort }> = [
  { label: "최신순", value: "updatedAt,desc" },
  { label: "조회순", value: "viewCount,desc" },
];

export default function GuideList() {
  const navigate = useNavigate();
  const { sessionNickname } = useSessionView();
  const { showAppMessage, clearAppMessage } = useAppMessageStore();

  // ✅ 입력 표시용(조합 중에도 바뀜)
  const [query, setQuery] = useState("");
  // ✅ debounce 결과(입력이 멈추면 갱신)
  const [debouncedQuery, setDebouncedQuery] = useState("");
  // ✅ 서버 요청용(조합 정책 + debounce 통과 후 반영)
  const [effectiveQuery, setEffectiveQuery] = useState("");

  const [sort, setSort] = useState<GuideListSort>(DEFAULT_SORT);
  const [game, setGame] = useState<GameName | "ALL">("ALL");

  const [items, setItems] = useState<GuideListItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);

  const [initialLoadState, setInitialLoadState] = useState<InitialLoadState>("idle");
  const [loadMorePhase, setLoadMorePhase] = useState<LoadMorePhase>("idle");
  const [logoutPhase, setLogoutPhase] = useState<LogoutPhase>("idle");

  const isInitialLoading = initialLoadState === "loading";
  const isLoadingMore = loadMorePhase === "loading";
  const isLoggingOut = logoutPhase === "submitting";

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // ✅ IME 조합 상태
  const isComposingRef = useRef(false);

  // IntersectionObserver에서 최신 상태를 안정적으로 참조하기 위한 ref
  const pageRef = useRef(page);
  const loadMorePhaseRef = useRef(loadMorePhase);
  const hasNextRef = useRef(hasNext);
  const effectiveQueryRef = useRef(effectiveQuery);
  const sortRef = useRef<GuideListSort>(sort);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);
  useEffect(() => {
    loadMorePhaseRef.current = loadMorePhase;
  }, [loadMorePhase]);
  useEffect(() => {
    hasNextRef.current = hasNext;
  }, [hasNext]);
  useEffect(() => {
    effectiveQueryRef.current = effectiveQuery;
    sortRef.current = sort;
  }, [effectiveQuery, sort]);

  // ✅ 1) query를 debounce해서 debouncedQuery를 만든다
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  // ✅ 2) debounce가 끝나면 effectiveQuery 반영
  //    단, 조합 중이면 보류(요청 안 함)
  useEffect(() => {
    if (isComposingRef.current) return; // ✅ 조합 중이면 여기서 STOP
    setEffectiveQuery(debouncedQuery); // ✅ 조합 아니면 요청 트리거
  }, [debouncedQuery]);

  // ✅ 서버에서 받아온 items에 대해 "프론트 게임 필터" 적용
  const filteredItems = useMemo(() => {
    if (game === "ALL") return items;
    return items.filter((item) => item.game === game);
  }, [items, game]);

  // ✅ effectiveQuery/정렬 변경 시: 서버에서 0페이지부터 다시 로드
  // (게임 필터는 프론트 가공이므로 서버 재요청 트리거에 포함하지 않음)
  useEffect(() => {
    let ignore = false;

    async function init() {
      clearAppMessage();
      setInitialLoadState("loading");

      try {
        console.log("init-0");
        const data = await listGuides({ query: effectiveQuery, page: 0, size: PAGE_SIZE, sort });
        console.log("init-1", data);
        if (ignore) return;
        console.log("init-2", data);

        setItems(data.items);
        setPage(0);
        setHasNext(data.nextPage !== null);
        setInitialLoadState("success");
      } catch (err) {
        if (ignore) return;

        if (err instanceof AuthRequiredError) {
          navigate(buildLoginUrl(window.location.href), { replace: true });
          return;
        }

        setItems([]);
        setPage(0);
        setHasNext(false);
        setInitialLoadState("error");

        if (err instanceof AppError) {
          showAppMessage({
            type: APP_MESSAGE_TYPE.ERROR,
            source: APP_MESSAGE_SOURCE.API,
            code: err.code,
            message: APP_ERROR_MESSAGE[err.code],
          });
          return;
        }

        if (err instanceof ResponseShapeError) {
          showAppMessage({
            type: APP_MESSAGE_TYPE.ERROR,
            source: APP_MESSAGE_SOURCE.API,
            code: err.code,
            message: RESPONSE_SHAPE_ERROR_MESSAGE[err.code],
          });
          return;
        }

        if (err instanceof ListGuidesError) {
          showAppMessage({
            type: APP_MESSAGE_TYPE.ERROR,
            source: APP_MESSAGE_SOURCE.API,
            code: err.code,
            message: LIST_GUIDES_ERROR_MESSAGE[err.code],
          });
          return;
        }

        showAppMessage({
          type: APP_MESSAGE_TYPE.ERROR,
          source: APP_MESSAGE_SOURCE.API,
          code: "UNKNOWN",
          message: LIST_GUIDES_ERROR_MESSAGE.UNKNOWN,
        });
      }
    }

    init();

    return () => {
      ignore = true;
    };
  }, [effectiveQuery, sort, navigate, clearAppMessage, showAppMessage]);

  const loadMore = useCallback(async () => {
    if (loadMorePhaseRef.current === "loading" || !hasNextRef.current) return;

    clearAppMessage();
    setLoadMorePhase("loading");

    try {
      const nextPage = pageRef.current + 1;

      console.log("loadmore-0");
      const data = await listGuides({
        query: effectiveQueryRef.current,
        page: nextPage,
        size: PAGE_SIZE,
        sort: sortRef.current,
      });
      console.log("loadmore-1", data);

      // 다음 페이지가 null이면 마지막
      setHasNext(data.nextPage !== null);
      setItems((prev) => [...prev, ...data.items]);
      setPage(nextPage);
    } catch (err) {
      if (err instanceof AuthRequiredError) {
        navigate(buildLoginUrl(window.location.href), { replace: true });
        return;
      }

      if (err instanceof AppError) {
        showAppMessage({
          type: APP_MESSAGE_TYPE.ERROR,
          source: APP_MESSAGE_SOURCE.API,
          code: err.code,
          message: APP_ERROR_MESSAGE[err.code],
        });
        return;
      }

      if (err instanceof ResponseShapeError) {
        showAppMessage({
          type: APP_MESSAGE_TYPE.ERROR,
          source: APP_MESSAGE_SOURCE.API,
          code: err.code,
          message: RESPONSE_SHAPE_ERROR_MESSAGE[err.code],
        });
        return;
      }

      if (err instanceof ListGuidesError) {
        showAppMessage({
          type: APP_MESSAGE_TYPE.ERROR,
          source: APP_MESSAGE_SOURCE.API,
          code: err.code,
          message: LIST_GUIDES_ERROR_MESSAGE[err.code],
        });
        return;
      }

      showAppMessage({
        type: APP_MESSAGE_TYPE.ERROR,
        source: APP_MESSAGE_SOURCE.API,
        code: "LOAD_MORE_FAILED",
        message: UI_RESULT_MESSAGE.LOAD_MORE_FAILED,
      });
    } finally {
      setLoadMorePhase("idle");
    }
  }, [navigate, clearAppMessage, showAppMessage]);

  const onLogout = useCallback(async () => {
    if (logoutPhase === "submitting") return;

    clearAppMessage();
    setLogoutPhase("submitting");

    try {
      await deleteSession();
      navigate("/", { replace: true });
    } catch (err) {
      if (err instanceof AuthRequiredError) {
        navigate("/", { replace: true });
        return;
      }

      if (err instanceof AppError) {
        showAppMessage({
          type: APP_MESSAGE_TYPE.ERROR,
          source: APP_MESSAGE_SOURCE.AUTH,
          code: err.code,
          message: APP_ERROR_MESSAGE[err.code],
        });
        return;
      }

      showAppMessage({
        type: APP_MESSAGE_TYPE.ERROR,
        source: APP_MESSAGE_SOURCE.AUTH,
        code: "UNKNOWN",
        message: APP_ERROR_MESSAGE.UNKNOWN,
      });
    } finally {
      setLogoutPhase("idle");
    }
  }, [logoutPhase, navigate, clearAppMessage, showAppMessage]);

  // ✅ 무한 스크롤: IntersectionObserver (관찰만, 데이터는 service가 담당)
  useEffect(() => {
    if (initialLoadState !== "success") return;

    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) loadMore();
      },
      { root: null, rootMargin: ROOT_MARGIN, threshold: 0 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [initialLoadState, loadMore]);

  const onCardClick = (id: GuideId) => {
    // 드래그로 텍스트 선택 중이면 이동 금지
    const sel = window.getSelection?.();
    if (sel && sel.type === "Range") return;

    navigate(`/guides/${id}`);
  };

  return (
    <PageShell>
      <HeaderShell
        left={<GnbBrand />}
        center={
          <GnbSearch
            value={query}
            onChange={(v) => {
              setQuery(v); // ✅ 입력은 항상 즉시 반영
              // ❌ 여기서 setEffectiveQuery 하지 않음 (debounce + IME 정책으로 통제)
            }}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={(v) => {
              isComposingRef.current = false;
              // - v: 확정된 최종 문자열
              // - query state가 아직 이전 값일 수 있으니 v를 신뢰
              setEffectiveQuery(v); // ✅ 즉시 요청 트리거 (flush)
              console.log("조합 완료", v);
            }}
            placeholder="공략 검색 (제목/본문/게임)"
          />
        }
        right={
          <GnbUserStatus
            nickname={sessionNickname}
            onLogout={onLogout}
            isLoggingOut={isLoggingOut}
          />
        }
      />

      <main className="mx-auto max-w-6xl p-4">
        {/* ✅ Sticky 상단 띠: 정렬/필터 + 글쓰기 버튼 */}
        {/* HeaderShell이 fixed/sticky 라면 top 값을 높이에 맞게 조정 (예: top-16) */}
        <div className="sticky top-16 z-10 mb-4 rounded-xl border bg-white/95 p-3 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {/* 정렬 */}
              <label className="text-sm font-medium text-zinc-800">정렬</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as GuideListSort)}
                className="h-9 rounded-lg border px-3 text-sm"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* 게임 필터(프론트 가공) */}
              <label className="ml-2 text-sm font-medium text-zinc-800">게임</label>
              <select
                value={game}
                onChange={(e) => setGame(e.target.value as GameName | "ALL")}
                className="h-9 rounded-lg border px-3 text-sm"
              >
                <option value="ALL">전체</option>
                {GAMES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              <span className="text-xs text-zinc-500">(정렬: 서버, 게임: 프론트 필터)</span>
            </div>

            <ActionPrimaryLink to="/guides/new">공략 등록</ActionPrimaryLink>
          </div>
        </div>

        {isInitialLoading ? (
          <div className="rounded-xl border bg-white p-6 text-sm text-zinc-600 shadow-sm">
            {UI_STATUS_MESSAGE.LOADING}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-xl border bg-white p-6 text-sm text-zinc-600 shadow-sm">
            {UI_RESULT_MESSAGE.EMPTY_SEARCH_RESULT}
          </div>
        ) : (
          <>
            {/* 카드 그리드 (3열 기준) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => onCardClick(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onCardClick(item.id);
                  }}
                  className="group relative cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                >
                  {/* 접근성/SEO용 “진짜 링크”는 제목에만 둬도 충분 */}
                  <h2 className="line-clamp-1 font-semibold text-zinc-900">
                    <Link
                      to={`/guides/${item.id}`}
                      onClick={(e) => e.stopPropagation()} // 중복 네비게이션 방지
                      className="focus:outline-none"
                    >
                      {item.title}
                    </Link>
                  </h2>

                  <div className="mt-1 text-xs text-zinc-500">
                    {item.game} · {item.author}
                  </div>

                  <p className="mt-3 truncate text-sm text-zinc-700">{item.excerpt}</p>

                  <div className="mt-3 text-xs text-zinc-500">
                    {formatDateToMinute(item.updatedAt)} · 조회 {item.viewCount}
                  </div>
                </article>
              ))}
            </div>

            {/* 무한 스크롤 센티널 */}
            <div ref={sentinelRef} className="h-10" />

            {/* 로딩/끝 상태 */}
            <div className="py-6 text-center text-sm text-zinc-600">
              {isLoadingMore && UI_STATUS_MESSAGE.LOADING}
              {!isLoadingMore &&
                filteredItems.length > 0 &&
                !hasNext &&
                UI_RESULT_MESSAGE.END_OF_LIST}
            </div>
          </>
        )}
      </main>
    </PageShell>
  );
}
