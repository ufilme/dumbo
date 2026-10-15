import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button, Card } from "@tremor/react";
import { Skeleton } from "@radix-ui/themes";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { HostCard, OfflineHostCard } from "@/components/Sections/HostList/HostCard";
import { Show, Sort, Toolbar } from "@/components/Sections/HostList/Toolbar";
import { DumboCrying } from "@/components/Sprites";
import { HostInfo } from "@/types/Host.types";

const SHOWS: Show[] = ["all", "online", "offline"];
const SORTS: Sort[] = ["name", "load-asc", "load-desc"];

const relativeLoad = (h: HostInfo) => (h.Last?.One ?? 0) / (h.CPUs || 1);

function SectionLabel({ title, count }: { title: string; count: number }) {
  return (
    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
      {title} · {count}
    </h2>
  );
}

export function HostList({
  data,
  isLoading,
  isError,
  onRetry,
  since,
  until,
}: {
  data: HostInfo[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  since: number;
  until: number;
}) {
  // Filters live in the URL so they survive navigating to a host and back.
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  // The search text lives in local state so typing is never held back by
  // the URL update; the URL just mirrors it.
  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const show = SHOWS.find((s) => s === params.get("show")) ?? "all";
  const sort = SORTS.find((s) => s === params.get("sort")) ?? "name";

  const update = (next: { q?: string; show?: Show; sort?: Sort }) => {
    if (next.q !== undefined) setQuery(next.q);
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(next)) {
          const isDefault =
            !value ||
            (key === "show" && value === "all") ||
            (key === "sort" && value === "name");
          if (isDefault) p.delete(key);
          else p.set(key, value);
        }
        return p;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  const { online, offline } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = data.filter((h) => h.Hostname.toLowerCase().includes(q));
    const byName = (a: HostInfo, b: HostInfo) =>
      a.Hostname.localeCompare(b.Hostname);
    const online = matches
      .filter((h) => !h.IsDown)
      .sort((a, b) => {
        if (sort === "load-asc") return relativeLoad(a) - relativeLoad(b);
        if (sort === "load-desc") return relativeLoad(b) - relativeLoad(a);
        return byName(a, b);
      });
    const offline = matches.filter((h) => h.IsDown).sort(byName);
    return { online, offline };
  }, [data, query, sort]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-2 overflow-hidden">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index}>
            <Card className="h-[30svh]"></Card>
          </Skeleton>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full grid justify-items-center items-start">
        <div className="grid place-items-center">
          <DumboCrying fill="rgb(99 102 241)" className="h-4/5 w-4/5" />
          <h1 className="-mt-10">Something went wrong</h1>
          <Button
            className="mt-4"
            variant="secondary"
            icon={ArrowPathIcon}
            onClick={onRetry}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const counts = {
    all: online.length + offline.length,
    online: online.length,
    offline: offline.length,
  };
  const showOnline = show !== "offline";
  const showOffline = show !== "online";
  const visible = [
    ...(showOnline ? online : []),
    ...(showOffline ? offline : []),
  ];

  // Enter in the search box opens the top result.
  const openFirst = () => {
    if (query && visible.length > 0) navigate(`/${visible[0].Hostname}`);
  };

  const emptyMessage = query
    ? `No machine matches “${query}”.`
    : show === "online"
      ? "No machine is online right now."
      : show === "offline"
        ? "All machines are online."
        : "No machines reported yet.";

  return (
    <div id="hosts" className="grid gap-4 p-2 scroll-mt-2">
      <div className="sticky top-0 z-30 -mx-4 px-4 py-2 bg-gray-50/90 backdrop-blur">
        <Toolbar
          query={query}
          show={show}
          sort={sort}
          counts={counts}
          onChange={update}
          onSubmit={openFirst}
        />
      </div>

      {visible.length === 0 && (
        <div className="py-12 grid place-items-center gap-2 text-center text-gray-500">
          <p>{emptyMessage}</p>
          {(query || show !== "all") && (
            <button
              type="button"
              className="text-indigo-600 hover:underline"
              onClick={() => update({ q: "", show: "all" })}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {showOnline && online.length > 0 && (
        <section>
        <SectionLabel title="Online" count={online.length} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {online.map((host) => (
            <HostCard key={host.ID} host={host} since={since} until={until} />
          ))}
        </div>
        </section>
      )}

      {showOffline && offline.length > 0 && (
        <section>
        <SectionLabel title="Offline" count={offline.length} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-8 gap-4">
          {offline.map((host) => (
            <OfflineHostCard key={host.ID} host={host} />
          ))}
        </div>
        </section>
      )}
    </div>
  );
}
