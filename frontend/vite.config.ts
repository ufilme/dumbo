import { defineConfig, loadEnv } from "vite";
import path from "path";
import { reactRouter } from "@react-router/dev/vite";

// https://vite.dev/config/
export default ({ command, mode }: { command: string; mode: string }) => {
  const env = loadEnv(mode, process.cwd());

  return defineConfig({
    plugins: [reactRouter()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_DUMBO_API,
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        ...(command === "build"
          ? { "react-dom/server": "react-dom/server.node" }
          : {}),
        "@": path.resolve(__dirname, "./src"),
      },
    },
  });
};
