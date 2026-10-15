import { Link } from "react-router";
import { capitalize } from "@/lib/utils";
import { usePrefetchHost } from "@/hooks/usePrefetchHost";
import { Tracker, AreaChart } from "@/components/Hero";
import { Card, Button } from "@tremor/react";
import { HostInfo } from "@/types/Host.types";

// Covers the whole card so it can be tapped anywhere, while still being a
// real link (open in new tab, long-press preview, keyboard focus).
function CardLink({ host }: { host: HostInfo }) {
  const prefetch = usePrefetchHost(host.Hostname);

  return (
    <Link
      to={`/${host.Hostname}`}
      aria-label={`${capitalize(host.Hostname)}, ${host.IsDown ? "offline" : "online"}`}
      className="absolute inset-0 z-20 rounded-tremor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      {...prefetch}
    />
  );
}

export function HostCard({
  host,
  since,
  until,
}: {
  host: HostInfo;
  since: number;
  until: number;
}) {
  return (
    <Card
      className="group relative p-2 transition-shadow hover:shadow-tremor-dropdown"
      decoration="top"
      decorationColor={host.IsDown ? "red" : "green"}
    >
      <CardLink host={host} />
      <AreaChart className={"h-40 py-2"} host={host} />
      <div className="p-4 grid gap-2">
        <h1 className="text-4xl font-bold relative z-10 bottom-8 mt-4 h-4">
          {capitalize(host.Hostname)}
        </h1>
        <p className="flex gap-3 text-sm text-gray-500 tabular-nums">
          <span>
            <span className="font-semibold text-gray-700">
              {(host.Last?.One ?? 0).toFixed(2)}
            </span>{" "}
            / {host.CPUs} CPUs
          </span>
          <span aria-hidden>·</span>
          <span>
            {host.Last?.ConnectedUsers ?? 0}{" "}
            {host.Last?.ConnectedUsers === 1 ? "user" : "users"}
          </span>
        </p>
        <Tracker
          host={host}
          since={since}
          until={until}
          buckets={15}
          className={"flex w-full h-4"}
        />
        <Button
          variant="secondary"
          color={host.IsDown ? "red" : "indigo"}
          className={host.IsDown ? "group-hover:bg-red-50" : "group-hover:bg-indigo-50"}
          tabIndex={-1}
          aria-hidden
        >
          Details
        </Button>
      </div>
    </Card>
  );
}

// Offline machines have nothing to chart, so they get a compact card.
export function OfflineHostCard({ host }: { host: HostInfo }) {
  return (
    <Card
      className="relative p-2 transition-shadow hover:shadow-tremor-dropdown"
      decoration="top"
      decorationColor="red"
    >
      <CardLink host={host} />
      <h1 className="px-2 py-1 text-lg font-bold truncate text-gray-600">
        {capitalize(host.Hostname)}
      </h1>
    </Card>
  );
}
