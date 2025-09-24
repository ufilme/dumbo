import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "@/lib/makeRequest";
import { useDateStore } from "@/store/useDate";
import { HostInfo, HostLoad } from "@/types/Host.types";

export function useHosts(scope: "home" | "info", hostname?: string) {
  const time = useDateStore((state) => state.currentDate);
  const hosts = useQuery<HostInfo[]>({
    queryKey: ["hosts", scope, time],
    queryFn: async () =>
      makeRequest({
        method: "GET",
        path: "/api/hosts",
        headers: new Headers({ "Content-Type": "application/json" }),
        since: Math.floor(time.getTime() / 1000),
        modifyData: (data: HostInfo[]) => {
          return data.map((host: HostInfo) => ({
            ...host,
          }));
        },
      }),
  });

  const load = useQuery<HostLoad[]>({
    queryKey: ["load", scope, time],
    queryFn: async () =>
      makeRequest({
        method: "GET",
        path: "/api/load",
        headers: new Headers({ "Content-Type": "application/json" }),
        since: Math.floor(time.getTime() / 1000),
        hostname: hostname,
      }),
  });

  let data: HostInfo[] = [];
  if (hosts.data && load.data) {
    const loadMap = load.data.reduce<Record<number, HostLoad[]>>((acc, l) => {
      if (!acc[l.HostID]) acc[l.HostID] = [];
      acc[l.HostID].push(l);
      return acc;
    }, {});

    data = hosts.data.map((host: HostInfo) => {
      const loads = (loadMap[host.ID] || [])
        .slice()
        .sort((a: HostLoad, b: HostLoad) => {
          const aDate = a.Load?.Date ? new Date(a.Load.Date).getTime() : 0;
          const bDate = b.Load?.Date ? new Date(b.Load.Date).getTime() : 0;
          return aDate - bDate;
        });
      return {
        ...host,
        Load: loads,
        IsDown: loads.length === 0,
      };
    });
  }

  return {
    data,
    isLoading: hosts.isLoading || load.isLoading,
    isError: hosts.isError || load.isError,
    isFetching: hosts.isFetching || load.isFetching,
    time,
  };
}
