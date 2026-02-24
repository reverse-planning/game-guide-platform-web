import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite의 VITE_* 뿐 아니라, SENTRY_* 같은 빌드용 env도 읽기 위해 loadEnv 사용
  const env = loadEnv(mode, process.cwd(), "");

  const shouldUploadSourcemaps =
    Boolean(env.SENTRY_AUTH_TOKEN) && Boolean(env.SENTRY_ORG) && Boolean(env.SENTRY_PROJECT);

  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(shouldUploadSourcemaps
        ? [
            sentryVitePlugin({
              org: env.SENTRY_ORG,
              project: env.SENTRY_PROJECT,
              authToken: env.SENTRY_AUTH_TOKEN,
            }),
          ]
        : []),
    ],
    build: {
      sourcemap: "hidden",
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: "https://api.doi2.my",
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
