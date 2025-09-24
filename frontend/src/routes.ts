import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  index("./pages/Home.tsx"),
  route(":hostname", "./pages/Info.tsx"),
] satisfies RouteConfig;
