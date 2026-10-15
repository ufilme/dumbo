import { ReactNode } from "react";
import { useSearchParams } from "react-router";
import { Badge } from "@radix-ui/themes";
import { useNow } from "@/hooks/useNow";
import { timeAgo } from "@/lib/utils";
import { HostInfo } from "@/types/Host.types";

const loadKeys = ["One", "Five", "Fifteen"] as const;

// Tapping a machine count filters the list below and scrolls to it.
function FilterBadge({
  show,
  label,
  children,
}: {
  show: "online" | "offline";
  label: string;
  children: ReactNode;
}) {
  const [params, setParams] = useSearchParams();
  const active = params.get("show") === show;

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      onClick={() => {
        setParams(
          (prev) => {
            const p = new URLSearchParams(prev);
            if (active) p.delete("show");
            else p.set("show", show);
            return p;
          },
          { replace: true, preventScrollReset: true },
        );
        document
          .getElementById("hosts")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      <Badge
        color={show === "online" ? "green" : "red"}
        variant={active ? "solid" : "soft"}
        className="flex w-full place-content-center cursor-pointer"
      >
        {children}
      </Badge>
    </button>
  );
}

export function Status({
  data,
  isStale,
  updatedAt,
}: {
  data: HostInfo[];
  isStale: boolean;
  updatedAt: number;
}) {
  const now = useNow();

  const hostsUp = data.filter((h) => !h.IsDown);
  const hostsDown = data.length - hostsUp.length;

  // Average over the machines that are actually reporting.
  const globalLoad = loadKeys.map((key) =>
    hostsUp.length
      ? (
          hostsUp.reduce((sum, h) => sum + (h.Last?.[key] ?? 0), 0) /
          hostsUp.length
        ).toFixed(2)
      : "0.00",
  );

  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-bold">Status</h1>
        <span className="text-xs text-gray-500">
          updated {timeAgo(now - updatedAt)}
        </span>
      </div>
      <div className="grid gap-2 mt-2">
        <div className="grid grid-cols-2 items-center gap-4">
          <h1 className="text-xl">API Server</h1>
          <Badge
            color={isStale ? "red" : "green"}
            className="flex justify-center"
          >
            {isStale ? "Down" : "Operational"}
          </Badge>
        </div>
        <div>
          <div className="grid grid-cols-2 items-center gap-4">
            <h1 className="text-xl">Machines</h1>
            <div className="grid grid-cols-2 gap-2 items-center">
              <FilterBadge
                show="online"
                label={`Show the ${hostsUp.length} online machines`}
              >
                {hostsUp.length}
              </FilterBadge>
              <FilterBadge
                show="offline"
                label={`Show the ${hostsDown} offline machines`}
              >
                {hostsDown}
              </FilterBadge>
            </div>
          </div>
        </div>
        <div>
          <div className="grid grid-cols-2 items-center gap-4">
            <h1 className="text-xl">Load</h1>
            <div className="grid grid-cols-3 items-center gap-2">
              {globalLoad.map((value, i) => (
                <div key={loadKeys[i]} className="flex flex-col items-center">
                  <Badge
                    color="blue"
                    className="flex place-content-center w-full"
                    title={`Average ${["1", "5", "15"][i]}-minute load of online machines`}
                  >
                    {value}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
