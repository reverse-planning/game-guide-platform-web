import fs from "fs";
import path from "path";
import seedrandom from "seedrandom";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rng = seedrandom("guide-seed-2026"); // 🔒 항상 같은 결과

const GAMES = [
  "엘든링",
  "발더스 게이트 3",
  "리그 오브 레전드",
  "오버워치",
  "다크 소울 3",
  "세키로",
  "몬스터 헌터 월드",
  "스타듀 밸리",
  "프로젝트 세카이",
  "쿠키런 킹덤",
];

const AUTHORS = [
  "재훈",
  "도희",
  "초보헌터",
  "보스킬러",
  "노데스러너",
  "힐러장인",
  "솔플장인",
  "전략러",
  "뉴비탈출",
];

const TITLE_PARTS = {
  prefix: [
    "초반에 반드시 알아야 할",
    "고인물 기준으로 정리한",
    "뉴비가 가장 많이 막히는",
    "실전에서 가장 안정적인",
    "시간 낭비 줄여주는",
  ],
  subject: ["보스 패턴 대응법", "파밍 루트", "스킬 운용법", "빌드 선택 기준", "위치 선정 전략"],
  suffix: ["정리", "완전 공략", "핵심 요약", "실수 방지 가이드", "체감 난이도 감소 팁"],
};

const SENTENCES = [
  "이 구간에서는 공격보다 회피 타이밍이 훨씬 중요하게 작용합니다.",
  "패턴을 모두 외우려 하기보다는 핵심 신호만 익히는 것이 좋습니다.",
  "욕심을 내는 순간 바로 실패로 이어지는 경우가 많았습니다.",
  "안정적인 플레이를 기준으로 접근하는 것이 클리어 확률을 높여줍니다.",
  "이 전략은 솔로 플레이 기준으로 가장 재현성이 높았습니다.",
  "스태미나 관리가 되지 않으면 후반부에서 급격히 무너집니다.",
  "공격 기회는 짧기 때문에 한 번의 판단이 매우 중요합니다.",
  "이 구간만 넘기면 이후 진행은 상대적으로 수월해집니다.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function uniqueTitle(game: string) {
  const t =
    `${pick(TITLE_PARTS.prefix)} ` +
    `${pick(TITLE_PARTS.subject)} ` +
    `${pick(TITLE_PARTS.suffix)}`;

  return `[${game}] ${t}`;
}

function makeContent(): string {
  const count = 6 + Math.floor(rng() * 5); // 6~10문장
  return Array.from({ length: count }, () => pick(SENTENCES)).join("\n\n");
}

function makeExcerpt(content: string): string {
  return content.split("\n")[0];
}

const guides = Array.from({ length: 120 }, (_, i) => {
  const game = pick(GAMES);
  const author = pick(AUTHORS);
  const content = makeContent();

  return {
    id: i + 1,
    title: uniqueTitle(game), // ✅ 전부 다름
    excerpt: makeExcerpt(content), // ✅ content 기반
    content, // ✅ 전부 다름
    game,
    author, // ⭕ 중복 허용
    updatedAt: new Date(Date.now() - Math.floor(rng() * 1000 * 60 * 60 * 24 * 14)).toISOString(),
  };
});

const outPath = path.resolve(__dirname, "../src/mocks/data/guides.json");
fs.writeFileSync(outPath, JSON.stringify(guides, null, 2), "utf-8");

console.log("✅ guides.json generated:", guides.length);
