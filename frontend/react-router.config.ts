import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "src",
  ssr: false,
  buildDirectory: "dist",
  serverBundles: ({ branch }) => {
    console.log(branch);
    return [`${branch}/server.js`];
  },
} satisfies Config;
