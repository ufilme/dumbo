import { useMemo } from "react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api";
import { Host, HostInfo, HostLoad } from "@/types/Host.types";

// Clients report roughly once a minute: a host is considered down when its
// last sample is older than this.
export const DOWN_AFTER_MS = 3 * 60 * 1000;

const HOSTS_REFRESH_MS = 60 * 1000;
const LOAD_REFRESH_MS = 15 * 1000;

export const hostsQuery = queryOptions({
  queryKey: ["hosts"],
  queryFn: () => fetchJson<Host[]>("/api/hosts"),
  refetchInterval: HOSTS_REFRESH_MS,
});

// The key stays stable across refetches; `since` is recomputed on each fetch
// so the window slides forward with time.
export const loadQuery = (rangeMs: number, hostname?: string) =>
  queryOptions({
    queryKey: ["load", hostname ?? null, rangeMs],
    queryFn: () =>
      fetchJson<HostLoad[]>("/api/load", {
        since: Math.floor((Date.now() - rangeMs) / 1000),
        host: hostname,
      }),
    refetchInterval: LOAD_REFRESH_MS,
  });

export function useHosts({
  rangeMs,
  hostname,
}: {
  rangeMs: number;
  hostname?: string;
}) {
  const hosts = useQuery(hostsQuery);
  const load = useQuery(loadQuery(rangeMs, hostname));

  const updatedAt = load.dataUpdatedAt || Date.now();

  const data = useMemo<HostInfo[]>(() => {
    if (!hosts.data || !load.data) return [];

    const loadMap = new Map<number, HostLoad[]>();
    for (const l of load.data) {
      const list = loadMap.get(l.HostID);
      if (list) list.push(l);
      else loadMap.set(l.HostID, [l]);
    }

    return hosts.data.map((host) => {
      const loads = (loadMap.get(host.ID) ?? []).sort(
        (a, b) =>
          new Date(a.Load.Date).getTime() - new Date(b.Load.Date).getTime(),
      );
      const last = loads[loads.length - 1]?.Load;
      return {
        ...host,
        Load: loads,
        Last: last,
        IsDown:
          !last || updatedAt - new Date(last.Date).getTime() > DOWN_AFTER_MS,
      };
    });
  }, [hosts.data, load.data, updatedAt]);

  return {
    data,
    isLoading: hosts.isLoading || load.isLoading,
    // Hard failure: nothing to show. A failed refetch keeps the previous
    // data around and is reported through `isStale` instead.
    isError: (hosts.isError && !hosts.data) || (load.isError && !load.data),
    isStale: hosts.isError || load.isError,
    isFetching: hosts.isFetching || load.isFetching,
    // True while showing the previous range's data after the range changed.
    isPlaceholderData: load.isPlaceholderData,
    refetch: () => Promise.all([hosts.refetch(), load.refetch()]),
    updatedAt,
    since: updatedAt - rangeMs,
  };
}
