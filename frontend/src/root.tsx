import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import {
  QueryClientProvider,
  QueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { Theme } from "@radix-ui/themes";
import { Dumbo, DumboCrying } from "@/components/Sprites";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      placeholderData: keepPreviousData,
      // Avoids refetching data that was just prefetched when a page mounts.
      staleTime: 10 * 1000,
    },
  },
});

export function meta() {
  return [
    { title: "Dumbo" },
    {
      name: "description",
      content: "Live load and uptime of the DISI lab machines in Bologna.",
    },
  ];
}

export function HydrateFallback() {
  return (
    <div className="h-dvh flex items-center justify-center">
      <Dumbo fill="rgb(99 102 241)" className="h-1/5 w-1/5" />
    </div>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2 p-6 text-center">
      <DumboCrying fill="rgb(99 102 241)" className="h-48 w-48" />
      <h1 className="text-xl font-semibold">
        {notFound ? "Page not found" : "Something went wrong"}
      </h1>
      {!notFound && error instanceof Error && (
        <p className="max-w-md text-sm text-gray-500">{error.message}</p>
      )}
      <Link
        to="/"
        className="mt-2 text-sm font-medium text-indigo-600 hover:underline"
      >
        Back to all machines
      </Link>
    </main>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <link rel="icon" type="image/svg+xml" href="/dumbo.svg" />
        <link rel="apple-touch-icon" href="/dumbo_dark_rounded.svg" />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Theme accentColor="indigo" hasBackground={false}>
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
