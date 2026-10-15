import { useHosts } from "@/hooks/useHosts";
import { Header, HostList } from "@/components/Sections";

const RANGE_MS = 30 * 60 * 1000;

export default function Component() {
  const { data, isLoading, isError, isStale, refetch, updatedAt, since } =
    useHosts({ rangeMs: RANGE_MS });

  return (
    <div className="min-h-dvh p-2 max-w-screen-2xl mx-auto flex flex-col">
      <Header
        data={data}
        isLoading={isLoading}
        isError={isError}
        isStale={isStale}
        updatedAt={updatedAt}
      />
      <HostList
        data={data}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        since={since}
        until={updatedAt}
      />
      <footer className="mt-auto pt-8 pb-4 text-center text-xs text-gray-400">
        DumBO · refreshes every 15 seconds ·{" "}
        <a
          href="https://github.com/ufilme/dumbo"
          target="_blank"
          rel="noreferrer"
          className="underline-offset-2 hover:text-indigo-500 hover:underline"
        >
          source on GitHub
        </a>
      </footer>
    </div>
  );
}
