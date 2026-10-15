import { MouseEvent, ReactNode, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import {
  capitalize,
  formatBytes,
  formatUptime,
  INFO_DEFAULT_RANGE_MS,
  timeAgo,
} from "@/lib/utils";
import { useHosts } from "@/hooks/useHosts";
import { useNow } from "@/hooks/useNow";
import { AreaChart, Tracker } from "@/components/Hero";
import { Dumbo, DumboCrying } from "@/components/Sprites";
import {
  Avatar,
  SegmentedControl,
  Separator,
  Skeleton,
} from "@radix-ui/themes";
import { Card } from "@tremor/react";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";

const HOUR = 60 * 60 * 1000;
const RANGES = {
  "1h": { label: "1 hour", ms: INFO_DEFAULT_RANGE_MS, buckets: 30 },
  "12h": { label: "12 hours", ms: 12 * HOUR, buckets: 72 },
  "1d": { label: "1 day", ms: 24 * HOUR, buckets: 96 },
} as const;
type RangeKey = keyof typeof RANGES;

function Spec({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p className="text-lg sm:text-2xl font-bold whitespace-nowrap">
      <span className="font-normal text-gray-500">{label}</span> {children}
    </p>
  );
}

export function meta({ params }: { params: { hostname?: string } }) {
  return [{ title: `${capitalize(params.hostname ?? "")} · Dumbo` }];
}

export default function Component() {
  const { hostname = "" } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const rangeKey: RangeKey =
    (Object.keys(RANGES) as RangeKey[]).find((k) => k === params.get("range")) ??
    "1h";
  const range = RANGES[rangeKey];

  const { data, isLoading, isError, isPlaceholderData, updatedAt, since } =
    useHosts({ rangeMs: range.ms, hostname });
  const now = useNow(10 * 1000);

  const host = data.find((h) => h.Hostname === hostname);

  const setRange = (key: string) =>
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (key === "1h") p.delete("range");
        else p.set("range", key);
        return p;
      },
      { replace: true, preventScrollReset: true },
    );

  // Go back in history when possible so the home page keeps its filters;
  // fall back to a plain link on direct visits.
  const goBack = (e?: MouseEvent) => {
    if ((window.history.state?.idx ?? 0) > 0) {
      e?.preventDefault();
      navigate(-1);
    } else if (!e) {
      navigate("/");
    }
  };

  // Escape returns to the list.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) goBack();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const header = (
    <div className="flex justify-between items-center">
      <Link to="/" onClick={goBack} aria-label="Back to all machines">
        <ChevronLeftIcon className="h-10 sm:h-12" />
      </Link>
      <Dumbo fill="rgb(99 102 241)" className="h-16 sm:h-24" />
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-dvh p-2">
        <Skeleton>
          <Card className="h-[calc(100dvh-1rem)]"></Card>
        </Skeleton>
      </div>
    );
  }

  let body: ReactNode;
  if (isError || !host) {
    body = (
      <div className="grid place-items-center py-8 text-center">
        <DumboCrying fill="rgb(99 102 241)" className="h-48 w-48" />
        <h1 className="text-xl">
          {isError
            ? "Something went wrong"
            : `No machine called “${hostname}”`}
        </h1>
      </div>
    );
  } else {
    const last = host.Last;

    body = (
      <>
        <div className="flex flex-col sm:flex-row gap-4 p-2 sm:p-4">
          <div className="w-full flex gap-4 items-center min-w-0">
            <Avatar
              size={{ initial: "6", sm: "8", lg: "9" }}
              src={`/avatars/${host.Hostname.toLowerCase()}.jpeg`}
              fallback={host.Hostname[0].toUpperCase()}
            />
            <div className="min-w-0">
              <h1 className="sm:px-4 text-4xl sm:text-6xl lg:text-8xl font-bold truncate">
                {capitalize(host.Hostname)}
              </h1>
              <p className="sm:px-4 flex items-center gap-1.5 text-sm text-gray-500">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${host.IsDown ? "bg-red-500" : "bg-green-500"}`}
                  aria-hidden
                />
                {host.IsDown ? "Offline" : "Online"} ·{" "}
                {last
                  ? `last report ${timeAgo(now - new Date(last.Date).getTime())}`
                  : `no reports in the last ${range.label}`}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 w-full sm:flex sm:flex-col sm:gap-2 sm:items-end justify-center">
            <Spec label="CPU">{host.CPUs}</Spec>
            <Spec label="RAM">
              {last
                ? `${formatBytes(last.RamUsed)} / ${formatBytes(host.RAM)}`
                : formatBytes(host.RAM)}
            </Spec>
            {!host.IsDown && last && (
              <>
                <Spec label="Users">{last.ConnectedUsers}</Spec>
                <Spec label="Uptime">{formatUptime(host.Uptime)}</Spec>
              </>
            )}
          </div>
        </div>
        <div>
          <Tracker
            host={host}
            since={since}
            until={updatedAt}
            buckets={range.buckets}
            className={"flex w-full h-6"}
          />
          <div className="mt-1 flex justify-between text-xs text-gray-400">
            <span>{range.label} ago</span>
            <span>now</span>
          </div>
        </div>
        <SegmentedControl.Root value={rangeKey} onValueChange={setRange}>
          {(Object.keys(RANGES) as RangeKey[]).map((key) => (
            <SegmentedControl.Item key={key} value={key}>
              {RANGES[key].label}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.Root>
        <div
          className={`h-64 sm:h-72 lg:h-96 transition-opacity ${isPlaceholderData ? "opacity-50" : ""}`}
        >
          <AreaChart
            host={host}
            className="h-64 sm:h-72 lg:h-96"
            showTooltip={true}
            showXAxis={true}
            showYAxis={true}
            showGridLines={true}
            showLegend={true}
          />
        </div>
      </>
    );
  }

  return (
    <div className="min-h-dvh p-2 max-w-screen-2xl mx-auto">
      <Card className="min-h-[calc(100dvh-1rem)] flex flex-col gap-4 p-4 sm:p-6">
        {header}
        <Separator size="4" />
        {body}
      </Card>
    </div>
  );
}
