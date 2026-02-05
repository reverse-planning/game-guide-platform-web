import { Link, useNavigate } from "react-router";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-zinc-50">
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-xl border bg-white p-6">
          <h1 className="text-xl font-semibold">404 - Not Found</h1>
          <p className="mt-2 text-sm text-zinc-600">요청한 페이지를 찾을 수 없습니다.</p>

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-50"
            >
              뒤로 가기
            </button>

            <Link
              to="/"
              className="rounded-md bg-zinc-500 px-3 py-2 text-sm text-white hover:bg-zinc-450"
            >
              홈으로
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
