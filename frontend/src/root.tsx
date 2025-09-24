import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import {
  QueryClientProvider,
  QueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { Theme } from "@radix-ui/themes";
import { Dumbo } from "@/components/Sprites";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      placeholderData: keepPreviousData,
    },
  },
});

export function HydrateFallback() {
  return (
    <div className="h-screen flex items-center justify-center">
      <Dumbo fill="rgb(99 102 241)" className="h-1/5 w-1/5" />
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/dumbo.svg" />
        <title>Dumbo</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Theme>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </Theme>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}
